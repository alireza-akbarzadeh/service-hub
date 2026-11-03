/**
 * Message Broker & Dead Letter Queue (DLQ) Observability Suite
 * Provides real-time queue lag telemetry, consumer group monitoring,
 * poison-pill message inspection, and dead-letter queue (DLQ) redrive capabilities
 * across Kafka, RabbitMQ, CAP Event Bus, and Redis Streams.
 */

export type BrokerType = "Kafka" | "RabbitMQ" | "CAP Event Bus" | "Redis Streams"
export type QueueStatus = "healthy" | "lagging" | "critical_dlq"

export interface ConsumerGroupInfo {
  name: string
  activeConsumers: number
  lag: number
  partitionCount: number
}

export interface BrokerQueue {
  id: string
  name: string
  serviceName: string
  brokerType: BrokerType
  environment: "Production" | "Staging"
  throughputMsgPerSec: number
  totalProcessedCount: number
  consumerLag: number
  dlqCount: number
  status: QueueStatus
  consumerGroups: ConsumerGroupInfo[]
  description: string
  retentionHours: number
}

export interface DeadLetterMessage {
  id: string
  queueId: string
  topicName: string
  serviceName: string
  failedAt: string // ISO
  retryCount: number
  maxRetries: number
  exceptionType: string
  errorMessage: string
  headers: Record<string, string>
  payload: Record<string, any>
  isReplayed: boolean
}

export interface BrokerSummary {
  totalQueues: number
  totalThroughputMsgPerSec: number
  totalConsumerLag: number
  totalDlqMessages: number
  laggingQueuesCount: number
}

export const initialQueues: BrokerQueue[] = [
  {
    id: "q-order-created",
    name: "commerce.orders.created",
    serviceName: "Order Processing Service",
    brokerType: "Kafka",
    environment: "Production",
    throughputMsgPerSec: 145,
    totalProcessedCount: 1420500,
    consumerLag: 12,
    dlqCount: 0,
    status: "healthy",
    retentionHours: 72,
    description: "Published whenever a customer completes checkout. Consumed by Inventory, Billing, and SMS dispatch.",
    consumerGroups: [
      { name: "inventory-worker-group", activeConsumers: 4, lag: 4, partitionCount: 6 },
      { name: "billing-invoice-group", activeConsumers: 3, lag: 8, partitionCount: 6 },
    ],
  },
  {
    id: "q-inventory-sync",
    name: "catalog.inventory.sync.hangfire",
    serviceName: "Product Catalog Search API",
    brokerType: "CAP Event Bus",
    environment: "Production",
    throughputMsgPerSec: 42,
    totalProcessedCount: 620400,
    consumerLag: 1840,
    dlqCount: 14,
    status: "lagging",
    retentionHours: 24,
    description: "Batched inventory sync updates from SAP ERP into Elasticsearch cluster.",
    consumerGroups: [
      { name: "catalog-sync-worker", activeConsumers: 2, lag: 1840, partitionCount: 4 },
    ],
  },
  {
    id: "q-notify-sms",
    name: "notifications.sms.dispatch",
    serviceName: "Notification Worker Hub",
    brokerType: "RabbitMQ",
    environment: "Production",
    throughputMsgPerSec: 85,
    totalProcessedCount: 940000,
    consumerLag: 28,
    dlqCount: 3,
    status: "critical_dlq",
    retentionHours: 12,
    description: "High-priority OTP verification and transactional SMS outbound queue to KavehNegar.",
    consumerGroups: [
      { name: "sms-gateway-pool", activeConsumers: 6, lag: 28, partitionCount: 8 },
    ],
  },
  {
    id: "q-payment-webhook",
    name: "banking.ipg.settlement.events",
    serviceName: "Payment Gateway Connector",
    brokerType: "Kafka",
    environment: "Production",
    throughputMsgPerSec: 64,
    totalProcessedCount: 410800,
    consumerLag: 5,
    dlqCount: 1,
    status: "healthy",
    retentionHours: 168,
    description: "Verified Shaparak banking callbacks and automated settlement records.",
    consumerGroups: [
      { name: "reconciliation-worker", activeConsumers: 3, lag: 5, partitionCount: 4 },
    ],
  },
  {
    id: "q-audit-security",
    name: "security.iam.audit.stream",
    serviceName: "Identity & SSO Provider",
    brokerType: "Redis Streams",
    environment: "Production",
    throughputMsgPerSec: 110,
    totalProcessedCount: 2840000,
    consumerLag: 0,
    dlqCount: 0,
    status: "healthy",
    retentionHours: 48,
    description: "Real-time authentication audits, OAuth2 token issuances, and admin permission elevations.",
    consumerGroups: [
      { name: "siem-collector", activeConsumers: 2, lag: 0, partitionCount: 2 },
    ],
  },
  {
    id: "q-stage-orders",
    name: "staging.commerce.orders.preview",
    serviceName: "Commerce Gateway API",
    brokerType: "Kafka",
    environment: "Staging",
    throughputMsgPerSec: 18,
    totalProcessedCount: 84000,
    consumerLag: 2,
    dlqCount: 0,
    status: "healthy",
    retentionHours: 24,
    description: "Staging sandbox simulation topic for canary verification and integration tests.",
    consumerGroups: [
      { name: "stage-e2e-testers", activeConsumers: 2, lag: 2, partitionCount: 2 },
    ],
  },
]

export const initialDeadLetterMessages: DeadLetterMessage[] = [
  {
    id: "MSG-DLQ-9041",
    queueId: "q-inventory-sync",
    topicName: "catalog.inventory.sync.hangfire",
    serviceName: "Product Catalog Search API",
    failedAt: "2026-11-03T09:12:44Z",
    retryCount: 3,
    maxRetries: 3,
    exceptionType: "System.Text.Json.JsonException",
    errorMessage: "The JSON value could not be converted to System.Int32. Path: $.items[14].stockQuantity: 'NaN'",
    headers: {
      "X-Correlation-Id": "c8f2b1a0-4d9e-4e8a-8b1c-99f2e1a34b02",
      "X-Source-System": "SAP-ERP-Tehran",
      "X-Batch-Size": "500",
    },
    payload: {
      batchId: "SAP-SYNC-8841",
      warehouseId: "WH-TEH-CENTRAL",
      items: [
        { sku: "SKU-99201", stockQuantity: 45, unitPrice: 1250000 },
        { sku: "SKU-99202", stockQuantity: "NaN", unitPrice: 3400000 },
      ],
      initiatedBy: "Hangfire.BackgroundJobServer",
    },
    isReplayed: false,
  },
  {
    id: "MSG-DLQ-9040",
    queueId: "q-notify-sms",
    topicName: "notifications.sms.dispatch",
    serviceName: "Notification Worker Hub",
    failedAt: "2026-11-03T08:44:10Z",
    retryCount: 3,
    maxRetries: 3,
    exceptionType: "HttpRequestException",
    errorMessage: "HTTP 429 Too Many Requests: KavehNegar upstream rate limit quota exceeded on VIP trunk.",
    headers: {
      "X-Correlation-Id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "X-Priority": "HIGH_OTP",
    },
    payload: {
      recipient: "09121234567",
      message: "Your Service Hub verification code is: 849201. Do not share.",
      template: "OTP_AUTH_V1",
      provider: "KavehNegar",
    },
    isReplayed: false,
  },
  {
    id: "MSG-DLQ-9039",
    queueId: "q-payment-webhook",
    topicName: "banking.ipg.settlement.events",
    serviceName: "Payment Gateway Connector",
    failedAt: "2026-11-02T22:15:30Z",
    retryCount: 3,
    maxRetries: 3,
    exceptionType: "SecurityTokenInvalidSignatureException",
    errorMessage: "IDX10503: Signature validation failed. Key mismatch for Shaparak certificate thumbprint: 7b84c...0a",
    headers: {
      "X-Correlation-Id": "f7e6d5c4-b3a2-1908-7654-3210fedcba98",
      "X-Bank-Code": "MELLAT_IPG",
    },
    payload: {
      transactionId: "TX-9904281",
      amountToman: 4850000,
      bankReferenceCode: "SHP-88412098",
      status: "SETTLED",
    },
    isReplayed: false,
  },
]

/**
 * Calculates summary metrics across message broker queues.
 */
export function calculateBrokerSummary(queues: BrokerQueue[] = initialQueues, dlqs: DeadLetterMessage[] = initialDeadLetterMessages): BrokerSummary {
  const totalQueues = queues.length
  let totalThroughput = 0
  let totalLag = 0
  let laggingCount = 0

  queues.forEach((q) => {
    totalThroughput += q.throughputMsgPerSec
    totalLag += q.consumerLag
    if (q.status === "lagging" || q.status === "critical_dlq") {
      laggingCount++
    }
  })

  const activeDlqMessages = dlqs.filter((m) => !m.isReplayed).length

  return {
    totalQueues,
    totalThroughputMsgPerSec: totalThroughput,
    totalConsumerLag: totalLag,
    totalDlqMessages: activeDlqMessages,
    laggingQueuesCount: laggingCount,
  }
}

/**
 * Generates RFC 4180 CSV export string for broker queues and consumer lag.
 */
export function exportQueuesToCsv(queues: BrokerQueue[]): string {
  const headers = [
    "Queue ID",
    "Topic Name",
    "Service Name",
    "Broker Type",
    "Environment",
    "Throughput (msg/s)",
    "Total Processed",
    "Consumer Lag",
    "DLQ Count",
    "Status",
  ]

  const rows = queues.map((q) => [
    q.id,
    `"${q.name.replace(/"/g, '""')}"`,
    `"${q.serviceName.replace(/"/g, '""')}"`,
    q.brokerType,
    q.environment,
    q.throughputMsgPerSec,
    q.totalProcessedCount,
    q.consumerLag,
    q.dlqCount,
    q.status.toUpperCase(),
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}
