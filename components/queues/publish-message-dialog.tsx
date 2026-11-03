"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BrokerQueue } from "@/lib/broker-queues-data"
import { Send, Sparkles, Zap } from "lucide-react"

interface PublishMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queues: BrokerQueue[]
  onPublishSuccess: (queueId: string, payload: any) => void
}

const PRESETS = {
  order: {
    label: "Order Created Event",
    payload: JSON.stringify(
      {
        eventId: "EVT-ORD-9982",
        eventType: "commerce.order.placed",
        orderId: "ORD-884210",
        tenantId: "TENANT-HASTI-CENTRAL",
        totalAmountToman: 18450000,
        itemsCount: 3,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
  },
  inventory: {
    label: "Inventory Sync Update",
    payload: JSON.stringify(
      {
        batchId: "SAP-SYNC-9012",
        sourceSystem: "SAP-ERP",
        records: [
          { sku: "SKU-CLOUD-ROUTER-V1", quantity: 24 },
          { sku: "SKU-MANAGED-POE-SWITCH", quantity: 8 },
        ],
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
  },
  sms: {
    label: "SMS Dispatch Trigger",
    payload: JSON.stringify(
      {
        recipient: "09129998877",
        message: "Your shipment has been dispatched from Tehran Distribution Hub.",
        priority: "NORMAL",
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
  },
}

export function PublishMessageDialog({
  open,
  onOpenChange,
  queues,
  onPublishSuccess,
}: PublishMessageDialogProps) {
  const [selectedQueueId, setSelectedQueueId] = React.useState<string>(
    queues[0]?.id || "q-order-created"
  )
  const [messageKey, setMessageKey] = React.useState("partition-key-01")
  const [payloadText, setPayloadText] = React.useState(PRESETS.order.payload)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isPublishing, setIsPublishing] = React.useState(false)

  const handleApplyPreset = (key: keyof typeof PRESETS) => {
    setPayloadText(PRESETS[key].payload)
    setErrorMsg(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const parsed = JSON.parse(payloadText)
      setErrorMsg(null)
      setIsPublishing(true)

      setTimeout(() => {
        setIsPublishing(false)
        onPublishSuccess(selectedQueueId, parsed)
        onOpenChange(false)
      }, 700)
    } catch (err: any) {
      setErrorMsg("Invalid JSON payload: " + err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Send className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Publish Test Message to Broker
              </DialogTitle>
              <DialogDescription className="text-xs">
                Inject a simulated message payload into a message queue or topic.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs py-2">
          {/* Target Queue */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Target Queue / Topic</label>
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2.5 font-mono text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name} ({q.brokerType})
                </option>
              ))}
            </select>
          </div>

          {/* Partition Key */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Message / Partition Key</label>
            <Input
              type="text"
              placeholder="e.g. order-884210"
              value={messageKey}
              onChange={(e) => setMessageKey(e.target.value)}
              className="h-8 font-mono text-xs"
            />
          </div>

          {/* Presets & Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">Message Payload (JSON)</label>
              <div className="flex items-center gap-1">
                {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleApplyPreset(k)}
                    className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {PRESETS[k].label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={8}
              value={payloadText}
              onChange={(e) => {
                setPayloadText(e.target.value)
                setErrorMsg(null)
              }}
              className="w-full rounded-md border border-border bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
            {errorMsg && (
              <p className="text-[11px] font-medium text-rose-500">{errorMsg}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPublishing}
              className="h-8 text-xs cursor-pointer gap-1.5 shadow-2xs bg-amber-500 hover:bg-amber-600 text-white dark:text-black"
            >
              <Send className="size-3.5" />
              <span>{isPublishing ? "Publishing..." : "Publish Event"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
