/**
 * Environment Variable & Secrets Config Studio Utilities
 * Supports parsing, format conversion (.env, JSON, Docker Compose, Kubernetes),
 * environment comparison (diffing missing variables), and syntax validation.
 */

export interface EnvVariable {
  id: string
  key: string
  value: string
  comment?: string
  isSecret: boolean
  isMasked: boolean
}

export interface EnvComparisonResult {
  allKeys: string[]
  env1Name: string
  env2Name: string
  missingInEnv1: string[]
  missingInEnv2: string[]
  identicalValues: string[]
  differentValues: string[]
}

export interface EnvValidationIssue {
  line: number
  key?: string
  severity: "error" | "warning"
  message: string
}

export const SAMPLE_ENV_PRESETS: Record<string, string> = {
  "Next.js FullStack": `# Next.js Frontend & API Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://hub.internal.company.com
NEXT_PUBLIC_API_VERSION=v1

# Neon Postgres Database Connection
DATABASE_URL=postgresql://neondb_owner:p4ssw0rd@ep-prod-01.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Security & Session Authentication
AUTH_SECRET=9f82c418293adbc9182371982731928371928371298
AUTH_SESSION_COOKIE=service_hub_session_v1
AUTH_SESSION_TTL_HOURS=72

# Cache & Message Broker
REDIS_URL=redis://default:s3cr3t@redis.cluster.internal:6379
REDIS_KEY_PREFIX=service_hub:

# Observability & Monitoring
SENTRY_DSN=https://abc123def456@o99999.ingest.sentry.io/1234567
METRICS_PORT=9090
LOG_LEVEL=info
`,

  "Go Microservice Backend": `# Go Microservice Configuration
APP_NAME=commerce-api-service
APP_ENV=staging
HTTP_PORT=8080
GRPC_PORT=9090

# PostgreSQL Connection
DB_HOST=postgres.staging.internal
DB_PORT=5432
DB_USER=app_user
DB_PASSWORD=StagingSecurePassword2026!
DB_NAME=commerce_db
DB_SSL_MODE=require

# JWT & Cryptography
JWT_SIGNING_KEY=secret-signing-key-very-long-and-secure
JWT_EXPIRATION_MINUTES=60

# Distributed Tracing
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.monitoring:4317
OTEL_SERVICE_NAME=commerce-api
`,

  "Staging Companion": `# Staging Environment Companion
NODE_ENV=staging
PORT=3000
NEXT_PUBLIC_APP_URL=https://hub-staging.internal.company.com
NEXT_PUBLIC_API_VERSION=v1

# Staging Database (Missing POOL_MIN & POOL_MAX on purpose for diff)
DATABASE_URL=postgresql://neondb_staging:pass123@ep-stage-02.us-east-2.aws.neon.tech/neondb_stg?sslmode=require

# Security
AUTH_SECRET=staging-secret-key-321
AUTH_SESSION_COOKIE=service_hub_session_v1

# Observability
LOG_LEVEL=debug
DEBUG_MODE=true
`,
}

/**
 * Detects if a variable key is likely sensitive / secret
 */
export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase()
  return (
    lower.includes("secret") ||
    lower.includes("password") ||
    lower.includes("pass") ||
    lower.includes("key") ||
    lower.includes("token") ||
    lower.includes("auth") ||
    lower.includes("private") ||
    lower.includes("credential")
  )
}

/**
 * Parses raw .env string into structured EnvVariable items
 */
export function parseEnvString(raw: string): EnvVariable[] {
  const lines = raw.split(/\r?\n/)
  const result: EnvVariable[] = []
  let pendingComment = ""

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) {
      pendingComment = ""
      return
    }

    if (trimmed.startsWith("#")) {
      pendingComment = pendingComment
        ? `${pendingComment}\n${trimmed.replace(/^#\s?/, "")}`
        : trimmed.replace(/^#\s?/, "")
      return
    }

    // Strip optional "export " prefix
    const lineWithoutExport = trimmed.replace(/^export\s+/, "")
    const eqIdx = lineWithoutExport.indexOf("=")

    if (eqIdx > 0) {
      const key = lineWithoutExport.slice(0, eqIdx).trim()
      let value = lineWithoutExport.slice(eqIdx + 1).trim()

      // Handle quoted values
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      const isSecret = isSensitiveKey(key)

      result.push({
        id: `var-${index}-${key}`,
        key,
        value,
        comment: pendingComment || undefined,
        isSecret,
        isMasked: isSecret,
      })

      pendingComment = ""
    }
  })

  return result
}

/**
 * Serializes EnvVariables back to .env format
 */
export function serializeToEnvString(vars: EnvVariable[]): string {
  return vars
    .map((v) => {
      let line = ""
      if (v.comment) {
        const commentLines = v.comment
          .split("\n")
          .map((c) => `# ${c}`)
          .join("\n")
        line += `${commentLines}\n`
      }
      const needsQuotes = v.value.includes(" ") || v.value.includes("#") || v.value.includes("\n")
      const valStr = needsQuotes ? `"${v.value}"` : v.value
      line += `${v.key}=${valStr}`
      return line
    })
    .join("\n")
}

/**
 * Serializes EnvVariables to JSON
 */
export function serializeToJson(vars: EnvVariable[]): string {
  const obj: Record<string, string> = {}
  vars.forEach((v) => {
    if (v.key) obj[v.key] = v.value
  })
  return JSON.stringify(obj, null, 2)
}

/**
 * Serializes to Docker Compose environment: format
 */
export function serializeToDockerCompose(vars: EnvVariable[]): string {
  let yaml = "services:\n  app:\n    environment:\n"
  vars.forEach((v) => {
    if (v.key) {
      const needsQuotes = v.value.includes(" ") || v.value.includes(":") || v.value.includes("#")
      yaml += `      - ${v.key}=${needsQuotes ? `"${v.value}"` : v.value}\n`
    }
  })
  return yaml
}

/**
 * Serializes to Kubernetes ConfigMap YAML
 */
export function serializeToKubernetesConfigMap(
  vars: EnvVariable[],
  configMapName: string = "app-config"
): string {
  let yaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${configMapName}
  labels:
    app.kubernetes.io/managed-by: service-hub
data:
`
  vars.forEach((v) => {
    if (v.key) {
      const isMultiLine = v.value.includes("\n")
      if (isMultiLine) {
        yaml += `  ${v.key}: |\n    ${v.value.replace(/\n/g, "\n    ")}\n`
      } else {
        yaml += `  ${v.key}: "${v.value.replace(/"/g, '\\"')}"\n`
      }
    }
  })
  return yaml
}

/**
 * Serializes to Kubernetes Secret YAML (Base64 Encoded)
 */
export function serializeToKubernetesSecret(
  vars: EnvVariable[],
  secretName: string = "app-secret"
): string {
  let yaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${secretName}
  labels:
    app.kubernetes.io/managed-by: service-hub
type: Opaque
data:
`
  vars.forEach((v) => {
    if (v.key) {
      let b64 = ""
      if (typeof btoa !== "undefined") {
        b64 = btoa(unescape(encodeURIComponent(v.value)))
      } else {
        b64 = Buffer.from(v.value).toString("base64")
      }
      yaml += `  ${v.key}: ${b64}\n`
    }
  })
  return yaml
}

/**
 * Compares two environment sets and calculates missing & mismatched variables
 */
export function compareEnvironments(
  env1Vars: EnvVariable[],
  env2Vars: EnvVariable[],
  env1Name: string = "Environment A",
  env2Name: string = "Environment B"
): EnvComparisonResult {
  const map1 = new Map<string, string>()
  const map2 = new Map<string, string>()

  env1Vars.forEach((v) => {
    if (v.key) map1.set(v.key, v.value)
  })

  env2Vars.forEach((v) => {
    if (v.key) map2.set(v.key, v.value)
  })

  const allKeySet = new Set<string>([...Array.from(map1.keys()), ...Array.from(map2.keys())])
  const allKeys = Array.from(allKeySet).sort()

  const missingInEnv1: string[] = []
  const missingInEnv2: string[] = []
  const identicalValues: string[] = []
  const differentValues: string[] = []

  allKeys.forEach((k) => {
    const has1 = map1.has(k)
    const has2 = map2.has(k)

    if (!has1) {
      missingInEnv1.push(k)
    } else if (!has2) {
      missingInEnv2.push(k)
    } else {
      const val1 = map1.get(k)
      const val2 = map2.get(k)
      if (val1 === val2) {
        identicalValues.push(k)
      } else {
        differentValues.push(k)
      }
    }
  })

  return {
    allKeys,
    env1Name,
    env2Name,
    missingInEnv1,
    missingInEnv2,
    identicalValues,
    differentValues,
  }
}

/**
 * Validates .env raw text for syntax anomalies
 */
export function validateEnvSyntax(raw: string): EnvValidationIssue[] {
  const issues: EnvValidationIssue[] = []
  const lines = raw.split(/\r?\n/)
  const seenKeys = new Set<string>()

  lines.forEach((line, index) => {
    const lineNum = index + 1
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return

    const lineWithoutExport = trimmed.replace(/^export\s+/, "")
    const eqIdx = lineWithoutExport.indexOf("=")

    if (eqIdx === -1) {
      issues.push({
        line: lineNum,
        severity: "error",
        message: "Missing equals sign '=' separator",
      })
      return
    }

    const key = lineWithoutExport.slice(0, eqIdx).trim()
    const value = lineWithoutExport.slice(eqIdx + 1).trim()

    // Key format check
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      issues.push({
        line: lineNum,
        key,
        severity: "warning",
        message: "Key contains non-standard characters (recommend uppercase alphanumeric & underscores)",
      })
    }

    // Duplicate check
    if (seenKeys.has(key)) {
      issues.push({
        line: lineNum,
        key,
        severity: "warning",
        message: `Duplicate key '${key}' detected (will overwrite earlier value)`,
      })
    } else {
      seenKeys.add(key)
    }

    // Spaces around = warning
    if (lineWithoutExport.slice(0, eqIdx).endsWith(" ") || lineWithoutExport.slice(eqIdx + 1).startsWith(" ")) {
      issues.push({
        line: lineNum,
        key,
        severity: "warning",
        message: "Spaces detected around equals sign '=' (may cause issues in strict POSIX shells)",
      })
    }

    // Unquoted space in value
    if (value.includes(" ") && !((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      issues.push({
        line: lineNum,
        key,
        severity: "warning",
        message: "Value with spaces should be wrapped in double quotes",
      })
    }
  })

  return issues
}
