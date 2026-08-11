import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const databaseUrl = process.env.RLS_TEST_DATABASE_URL

if (!databaseUrl) {
  console.error(
    "RLS_TEST_DATABASE_URL is required and must point to a disposable database."
  )
  process.exit(2)
}

const parsedUrl = new URL(databaseUrl)
const isLocal =
  parsedUrl.hostname === "127.0.0.1" ||
  parsedUrl.hostname === "localhost" ||
  parsedUrl.hostname === "::1"

if (!isLocal && process.env.RLS_TEST_ALLOW_REMOTE !== "1") {
  console.error(
    "Refusing a non-local RLS database. Set RLS_TEST_ALLOW_REMOTE=1 only for a disposable test project."
  )
  process.exit(2)
}

const files = [
  resolve("tests/rls/tenant-isolation.sql"),
  resolve("tests/rls/role-permissions.sql"),
]

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`Missing RLS test file: ${file}`)
    process.exit(2)
  }

  const result = spawnSync(
    "psql",
    ["-X", "--set", "ON_ERROR_STOP=1", "--file", file],
    {
      env: {
        ...process.env,
        PGDATABASE: databaseUrl,
      },
      stdio: "inherit",
    }
  )

  if (result.error) {
    console.error(`Unable to run ${file}: ${result.error.message}`)
    process.exit(2)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

