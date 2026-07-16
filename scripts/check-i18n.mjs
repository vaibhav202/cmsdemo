import { parse, TYPE } from "@formatjs/icu-messageformat-parser"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const locales = ["mr-IN", "en-IN", "hi-IN", "gu-IN"]
const referenceLocale = "en-IN"
const messagesDirectory = path.join(process.cwd(), "messages")
const sourceDirectory = path.join(process.cwd(), "src")

const limits = {
  catalogBytes: 256 * 1024,
  keyLength: 100,
  messageLength: 1000,
  messagesPerLocale: 2000,
  namespaceDepth: 12,
}

const dangerousObjectKeys = new Set(["__proto__", "constructor", "prototype"])
const forbiddenControlCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u
const forbiddenDirectionControls =
  /[\u061c\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/u
const forbiddenExecutableSchemes =
  /\b(?:javascript|vbscript)\s*:|data\s*:\s*(?:text\/html|image\/svg\+xml)/iu
const markupLikeTag = /<\/?[a-z][^>]*>/iu

const sourceSecurityPatterns = [
  {
    code: "raw_react_html",
    label: "React dangerouslySetInnerHTML",
    pattern: /\bdangerouslySetInnerHTML\b/u,
  },
  {
    code: "direct_dom_html",
    label: "direct DOM HTML injection",
    pattern: /\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/u,
  },
  {
    code: "dynamic_code",
    label: "dynamic code evaluation",
    pattern: /\beval\s*\(|\bnew\s+Function\s*\(/u,
  },
  {
    code: "raw_translation",
    label: "next-intl raw, markup, or rich translation rendering",
    pattern: /\.\s*(?:raw|markup|rich)\s*\(/u,
  },
]

function issue(code, message) {
  return { code, message }
}

function containsTag(nodes) {
  for (const node of nodes) {
    if (node.type === TYPE.tag) return true

    if ("options" in node && node.options) {
      for (const option of Object.values(node.options)) {
        if (containsTag(option.value)) return true
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      if (containsTag(node.children)) return true
    }
  }

  return false
}

export function getMessageSecurityIssues(message) {
  const issues = []

  if (message.length > limits.messageLength) {
    issues.push(
      issue(
        "message_too_long",
        `exceeds ${limits.messageLength} characters`
      )
    )
  }

  if (forbiddenControlCharacters.test(message)) {
    issues.push(issue("control_character", "contains a forbidden control character"))
  }

  if (forbiddenDirectionControls.test(message)) {
    issues.push(
      issue(
        "direction_control",
        "contains an invisible or bidirectional direction-control character"
      )
    )
  }

  if (forbiddenExecutableSchemes.test(message)) {
    issues.push(issue("executable_scheme", "contains an executable URL scheme"))
  }

  if (markupLikeTag.test(message)) {
    issues.push(issue("markup", "contains HTML/XML-like markup"))
  }

  try {
    const ast = parse(message)
    if (containsTag(ast) && !issues.some((entry) => entry.code === "markup")) {
      issues.push(issue("markup", "contains an ICU rich-text tag"))
    }
  } catch (error) {
    issues.push(issue("invalid_icu", `has invalid ICU syntax: ${error.message}`))
  }

  return issues
}

export function getSourceSecurityIssues(source) {
  const issues = []

  for (const rule of sourceSecurityPatterns) {
    const index = source.search(rule.pattern)
    if (index === -1) continue

    const line = source.slice(0, index).split(/\r?\n/u).length
    issues.push(issue(rule.code, `${rule.label} at line ${line}`))
  }

  return issues
}

async function readMessages(locale, errors) {
  const filename = `${locale}.json`
  const filepath = path.join(messagesDirectory, filename)
  let source

  try {
    source = await readFile(filepath, "utf8")
  } catch (error) {
    errors.push(`${locale}: cannot read ${filename}: ${error.message}`)
    return null
  }

  if (Buffer.byteLength(source, "utf8") > limits.catalogBytes) {
    errors.push(
      `${locale}: catalog exceeds ${limits.catalogBytes} UTF-8 bytes`
    )
  }

  try {
    return JSON.parse(source)
  } catch (error) {
    errors.push(`${locale}: invalid JSON: ${error.message}`)
    return null
  }
}

function flattenMessages(
  value,
  locale,
  errors,
  prefix = "",
  result = new Map(),
  depth = 0
) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    errors.push(`${locale}: ${prefix || "catalog"} must be a message namespace`)
    return result
  }

  if (depth > limits.namespaceDepth) {
    errors.push(
      `${locale}: ${prefix || "catalog"} exceeds ${limits.namespaceDepth} namespace levels`
    )
    return result
  }

  for (const [key, entry] of Object.entries(value)) {
    const pathKey = prefix ? `${prefix}.${key}` : key

    if (!key || key.length > limits.keyLength || key.includes(".")) {
      errors.push(`${locale}: invalid message key ${pathKey}`)
    }

    if (dangerousObjectKeys.has(key)) {
      errors.push(`${locale}: dangerous object key ${pathKey}`)
    }

    if (typeof entry === "string") {
      result.set(pathKey, entry)
      continue
    }

    if (!entry || Array.isArray(entry) || typeof entry !== "object") {
      errors.push(`${locale}: ${pathKey} must be a string or message namespace`)
      continue
    }

    flattenMessages(entry, locale, errors, pathKey, result, depth + 1)
  }

  return result
}

function collectArguments(nodes, names = new Set()) {
  for (const node of nodes) {
    if (
      "value" in node &&
      typeof node.value === "string" &&
      node.type !== TYPE.literal &&
      node.type !== TYPE.tag
    ) {
      names.add(node.value)
    }

    if ("options" in node && node.options) {
      for (const option of Object.values(node.options)) {
        collectArguments(option.value, names)
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      collectArguments(node.children, names)
    }
  }

  return names
}

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filepath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(filepath)))
    } else if (/\.[cm]?[jt]sx?$/u.test(entry.name)) {
      files.push(filepath)
    }
  }

  return files
}

async function validateSource(errors) {
  let files

  try {
    files = await listSourceFiles(sourceDirectory)
  } catch (error) {
    errors.push(`source scan failed: ${error.message}`)
    return 0
  }

  for (const filepath of files) {
    const source = await readFile(filepath, "utf8")
    const relativePath = path.relative(process.cwd(), filepath)

    for (const finding of getSourceSecurityIssues(source)) {
      errors.push(`${relativePath}: ${finding.message}`)
    }
  }

  return files.length
}

function runSecuritySelfTests(errors) {
  const fixtures = [
    ["markup", "Click <script>alert(1)</script>", "markup"],
    ["scheme", "javascript:alert(1)", "executable_scheme"],
    ["direction", `Save\u202eremove`, "direction_control"],
    ["control", `Invalid\u0007message`, "control_character"],
    ["length", "x".repeat(limits.messageLength + 1), "message_too_long"],
  ]

  for (const [name, message, expectedCode] of fixtures) {
    const findings = getMessageSecurityIssues(message)
    if (!findings.some((entry) => entry.code === expectedCode)) {
      errors.push(`security self-test ${name} did not trigger ${expectedCode}`)
    }
  }

  const safeIndicMessage = "मराठी क्‍ष {count, number}"
  const safeFindings = getMessageSecurityIssues(safeIndicMessage)
  if (safeFindings.length) {
    errors.push(
      `security self-test rejected safe Indic text: ${safeFindings
        .map((entry) => entry.code)
        .join(", ")}`
    )
  }

  const structureErrors = []
  flattenMessages(
    JSON.parse('{"Safe":{"__proto__":"value"}}'),
    "fixture",
    structureErrors
  )
  if (!structureErrors.some((entry) => entry.includes("dangerous object key"))) {
    errors.push("security self-test did not reject a dangerous object key")
  }

  const sourceFindings = getSourceSecurityIssues(
    "return <div dangerouslySetInnerHTML={{__html: content}} />"
  )
  if (!sourceFindings.some((entry) => entry.code === "raw_react_html")) {
    errors.push("security self-test did not reject raw React HTML")
  }

  return fixtures.length + 3
}

async function main() {
  const errors = []
  const expectedFiles = locales.map((locale) => `${locale}.json`).sort()

  try {
    const actualFiles = (await readdir(messagesDirectory))
      .filter((filename) => filename.endsWith(".json"))
      .sort()

    if (actualFiles.join("|") !== expectedFiles.join("|")) {
      errors.push(
        `catalog files differ (expected ${expectedFiles.join(", ")}; found ${actualFiles.join(", ")})`
      )
    }
  } catch (error) {
    errors.push(`cannot list message catalogs: ${error.message}`)
  }

  const allMessages = {}
  for (const locale of locales) {
    allMessages[locale] = await readMessages(locale, errors)
  }

  const referenceMessages = allMessages[referenceLocale]
  const reference = referenceMessages
    ? flattenMessages(referenceMessages, referenceLocale, errors)
    : new Map()

  for (const locale of locales) {
    const messages = allMessages[locale]
    if (!messages) continue

    const current = flattenMessages(messages, locale, errors)

    if (current.size > limits.messagesPerLocale) {
      errors.push(
        `${locale}: contains more than ${limits.messagesPerLocale} messages`
      )
    }

    for (const key of reference.keys()) {
      if (!current.has(key)) errors.push(`${locale}: missing ${key}`)
    }
    for (const key of current.keys()) {
      if (!reference.has(key)) errors.push(`${locale}: unexpected ${key}`)
    }

    for (const [key, message] of current) {
      if (!message.trim()) {
        errors.push(`${locale}: empty ${key}`)
        continue
      }

      const securityIssues = getMessageSecurityIssues(message)
      for (const finding of securityIssues) {
        errors.push(`${locale}: ${key} ${finding.message}`)
      }

      if (securityIssues.some((entry) => entry.code === "invalid_icu")) {
        continue
      }

      const referenceMessage = reference.get(key)
      if (!referenceMessage) continue

      try {
        const currentArguments = [...collectArguments(parse(message))].sort()
        const referenceArguments = [
          ...collectArguments(parse(referenceMessage)),
        ].sort()

        if (currentArguments.join("|") !== referenceArguments.join("|")) {
          errors.push(
            `${locale}: arguments differ for ${key} (${currentArguments.join(", ")} vs ${referenceArguments.join(", ")})`
          )
        }
      } catch {
        // ICU syntax errors are reported by getMessageSecurityIssues.
      }
    }
  }

  const fixtureCount = runSecuritySelfTests(errors)
  const sourceFileCount = await validateSource(errors)

  if (errors.length) {
    console.error(errors.join("\n"))
    process.exitCode = 1
    return
  }

  console.log(
    `Validated ${reference.size} messages across ${locales.length} locales, ${fixtureCount} security fixtures, and ${sourceFileCount} source files.`
  )
}

await main()
