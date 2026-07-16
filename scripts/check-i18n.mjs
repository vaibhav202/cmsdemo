import { parse } from "@formatjs/icu-messageformat-parser"
import { readFile } from "node:fs/promises"
import path from "node:path"

const locales = ["mr-IN", "en-IN", "hi-IN", "gu-IN"]
const referenceLocale = "en-IN"
const messagesDirectory = path.join(process.cwd(), "messages")

async function readMessages(locale) {
  const source = await readFile(
    path.join(messagesDirectory, `${locale}.json`),
    "utf8"
  )
  return JSON.parse(source)
}

function flattenMessages(value, prefix = "", result = new Map()) {
  for (const [key, entry] of Object.entries(value)) {
    const pathKey = prefix ? `${prefix}.${key}` : key

    if (typeof entry === "string") {
      result.set(pathKey, entry)
      continue
    }

    if (!entry || Array.isArray(entry) || typeof entry !== "object") {
      throw new Error(`${pathKey} must be a string or message namespace.`)
    }

    flattenMessages(entry, pathKey, result)
  }

  return result
}

function collectArguments(nodes, names = new Set()) {
  for (const node of nodes) {
    if (typeof node !== "object" || node === null) continue
    if ("value" in node && typeof node.value === "string" && node.type !== 0) {
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

const allMessages = Object.fromEntries(
  await Promise.all(locales.map(async (locale) => [locale, await readMessages(locale)]))
)
const reference = flattenMessages(allMessages[referenceLocale])
const errors = []

for (const locale of locales) {
  const current = flattenMessages(allMessages[locale])

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

    try {
      const currentArguments = [...collectArguments(parse(message))].sort()
      const referenceMessage = reference.get(key)
      if (!referenceMessage) continue
      const referenceArguments = [
        ...collectArguments(parse(referenceMessage)),
      ].sort()

      if (currentArguments.join("|") !== referenceArguments.join("|")) {
        errors.push(
          `${locale}: arguments differ for ${key} (${currentArguments.join(", ")} vs ${referenceArguments.join(", ")})`
        )
      }
    } catch (error) {
      errors.push(`${locale}: invalid ICU message ${key}: ${error.message}`)
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exitCode = 1
} else {
  console.log(
    `Validated ${reference.size} messages across ${locales.length} locales.`
  )
}
