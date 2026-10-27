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
import { Badge } from "@/components/ui/badge"
import { createFeedbackRequest } from "@/app/actions/requests"
import type { FeedbackRequest } from "@/lib/db/schema"
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Code2,
  GitPullRequest,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
  Terminal,
} from "lucide-react"

type RequestType = "feature" | "bug" | "pull_request"

interface RequestSubmitModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultType?: RequestType
  defaultService?: string
  servicesList?: string[]
  onSuccess?: (newRequest: FeedbackRequest) => void
}

const COMMON_SQUADS = [
  "Frontend Squad",
  "Backend Commerce",
  "FinTech & Wallet",
  "Catalog Squad",
  "Admin Core Team",
  "DevOps Team",
  "Platform Architecture",
  "QA Specialist",
]

const DEFAULT_SERVICES = [
  "General / Platform",
  "Commerce Web (Dev)",
  "Admin Portal (Dev)",
  "Vendor Portal (Dev)",
  "Admin API Gateway Swagger (Dev)",
  "CAP Messaging - Catalog (Test)",
  "CAP Messaging - Sale (Test)",
  "RabbitMQ Cluster (Dev)",
  "Consul Service Mesh (Dev)",
  "Developer Tools Suite",
  "Anonymous Chat Lounge",
  "Other / Infrastructure",
]

export function RequestSubmitModal({
  isOpen,
  onOpenChange,
  defaultType = "feature",
  defaultService,
  servicesList = DEFAULT_SERVICES,
  onSuccess,
}: RequestSubmitModalProps) {
  const [activeType, setActiveType] = React.useState<RequestType>(defaultType)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [successItem, setSuccessItem] = React.useState<FeedbackRequest | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Submitter state (stored in localStorage)
  const [authorName, setAuthorName] = React.useState("")
  const [authorRole, setAuthorRole] = React.useState("Frontend Squad")
  const [authorEmail, setAuthorEmail] = React.useState("")

  // Common fields
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [targetService, setTargetService] = React.useState(defaultService || "General / Platform")
  const [priority, setPriority] = React.useState<"low" | "medium" | "high" | "critical">("medium")
  const [tagsInput, setTagsInput] = React.useState("")

  // Bug fields
  const [severity, setSeverity] = React.useState<string>("P2")
  const [environment, setEnvironment] = React.useState<string>("Develop")
  const [stepsToReproduce, setStepsToReproduce] = React.useState("")
  const [expectedBehavior, setExpectedBehavior] = React.useState("")
  const [actualBehavior, setActualBehavior] = React.useState("")

  // PR fields
  const [branchName, setBranchName] = React.useState("")
  const [prUrl, setPrUrl] = React.useState("")
  const [diffContent, setDiffContent] = React.useState("")
  const [testNotes, setTestNotes] = React.useState("")

  // Load submitter identity from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("service_catalog_coworker_name")
      const savedRole = localStorage.getItem("service_catalog_coworker_role")
      const savedEmail = localStorage.getItem("service_catalog_coworker_email")
      if (savedName) setAuthorName(savedName)
      if (savedRole) setAuthorRole(savedRole)
      if (savedEmail) setAuthorEmail(savedEmail)
    }
  }, [])

  // Sync default type when opened
  React.useEffect(() => {
    if (isOpen) {
      if (defaultType) setActiveType(defaultType)
      if (defaultService) setTargetService(defaultService)
      setSuccessItem(null)
      setErrorMessage(null)
    }
  }, [isOpen, defaultType, defaultService])

  const handleFillSample = () => {
    if (activeType === "feature") {
      setTitle("Add GraphQL Playground tab to Dev Tools")
      setDescription(
        "Allow developers to execute and debug GraphQL queries directly against the internal gateway endpoints without installing external browser extensions."
      )
      setPriority("high")
      setTagsInput("GraphQL, DevTools, API")
    } else if (activeType === "bug") {
      setTitle("CORS error when calling Swagger endpoint from localhost:3000")
      setTargetService("Vendor API Gateway Swagger (Dev)")
      setSeverity("P1")
      setEnvironment("Develop")
      setStepsToReproduce(
        "1. Open local frontend dev server at http://localhost:3000\n2. Trigger API fetch to Swagger endpoint\n3. Console displays Access-Control-Allow-Origin header missing"
      )
      setExpectedBehavior("200 OK with allowed origin")
      setActualBehavior("403 Forbidden with CORS blocking")
      setPriority("high")
      setTagsInput("CORS, Swagger, Gateway")
    } else {
      setTitle("Fix Redis connection retry timeout and add exponential backoff")
      setTargetService("Redis UI - Dev (172.31.59.35:6379)")
      setBranchName("fix/redis-retry-backoff")
      setPrUrl("https://hig-devops.gig.services/HIT/Hastim/_git/infra/pullrequest/1502")
      setDiffContent(`--- a/src/Cache/RedisClient.cs
+++ b/src/Cache/RedisClient.cs
@@ -25,5 +25,8 @@ public async Task ConnectAsync()
-    await _muxer.ConnectAsync(timeout: 2000);
+    var retryPolicy = Policy
+        .Handle<RedisTimeoutException>()
+        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
+    await retryPolicy.ExecuteAsync(() => _muxer.ConnectAsync(timeout: 5000));`)
      setTestNotes("Tested simulated Redis restart. Client smoothly reconnected after 2nd retry attempt.")
      setPriority("medium")
      setTagsInput("Redis, Retry, Resilience")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!authorName.trim()) {
      setErrorMessage("Please provide your name or coworker handle.")
      return
    }
    if (!title.trim()) {
      setErrorMessage("Please enter a title for your submission.")
      return
    }

    // Save identity for future submissions
    if (typeof window !== "undefined") {
      localStorage.setItem("service_catalog_coworker_name", authorName.trim())
      localStorage.setItem("service_catalog_coworker_role", authorRole.trim())
      if (authorEmail) {
        localStorage.setItem("service_catalog_coworker_email", authorEmail.trim())
      }
    }

    setIsSubmitting(true)

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const avatarColors = ["#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"]
    const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)]

    const res = await createFeedbackRequest({
      type: activeType,
      title,
      description: description || title,
      targetService,
      priority,
      authorName,
      authorRole,
      authorEmail: authorEmail || undefined,
      authorAvatar: randomAvatar,
      severity: activeType === "bug" ? severity : undefined,
      environment: activeType === "bug" ? environment : undefined,
      stepsToReproduce: activeType === "bug" ? stepsToReproduce : undefined,
      expectedBehavior: activeType === "bug" ? expectedBehavior : undefined,
      actualBehavior: activeType === "bug" ? actualBehavior : undefined,
      branchName: activeType === "pull_request" ? branchName : undefined,
      prUrl: activeType === "pull_request" ? prUrl : undefined,
      diffContent: activeType === "pull_request" ? diffContent : undefined,
      testNotes: activeType === "pull_request" ? testNotes : undefined,
      tags,
    })

    setIsSubmitting(false)

    if (res.success && res.data) {
      setSuccessItem(res.data)
      if (onSuccess) onSuccess(res.data)
    } else {
      setErrorMessage(res.error || "Failed to submit request. Please try again.")
    }
  }

  const handleResetForm = () => {
    setTitle("")
    setDescription("")
    setStepsToReproduce("")
    setExpectedBehavior("")
    setActualBehavior("")
    setBranchName("")
    setPrUrl("")
    setDiffContent("")
    setTestNotes("")
    setTagsInput("")
    setSuccessItem(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {successItem ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Submission Received Successfully!
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
              Your{" "}
              <span className="font-semibold text-foreground">
                {successItem.type === "pull_request"
                  ? "Bug Fix Pull Request"
                  : successItem.type === "bug"
                    ? "Bug Report"
                    : "Feature Request"}
              </span>{" "}
              has been recorded under ticket{" "}
              <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                {successItem.id}
              </Badge>
              . It is now visible on the triage board for review and merge.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetForm}
                className="cursor-pointer text-xs"
              >
                Submit Another Item
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  if (typeof window !== "undefined") {
                    window.location.href = "/requests"
                  }
                }}
                className="cursor-pointer bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                View on Requests Board →
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Sparkles className="size-4 text-primary" />
                  Collaborator & Coworker Submission
                </DialogTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFillSample}
                  className="h-7 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Fill Sample
                </Button>
              </div>
              <DialogDescription className="text-xs">
                Submit feature requests, report bugs, or propose bug-fix pull requests with code diffs for review.
              </DialogDescription>
            </DialogHeader>

            {/* Top Type Selector Tabs */}
            <div className="my-3 grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setActiveType("feature")}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  activeType === "feature"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Lightbulb className="size-3.5" />
                <span>Feature Request</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("bug")}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  activeType === "bug"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Bug className="size-3.5" />
                <span>Bug Report</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("pull_request")}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  activeType === "pull_request"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <GitPullRequest className="size-3.5" />
                <span>Bug Fix / PR</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-3 flex items-center gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3 py-2 text-xs">
              {/* Coworker Identity Banner */}
              <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5">
                <div className="mb-2 font-semibold text-foreground">
                  Contributor Profile (Your Info)
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Your Name *
                    </label>
                    <Input
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Farhad Karimi"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Squad / Role
                    </label>
                    <select
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                    >
                      {COMMON_SQUADS.map((sq) => (
                        <option key={sq} value={sq}>
                          {sq}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Email (optional)
                    </label>
                    <Input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="e.g. f.karimi@hasti.co"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Target Service */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-medium text-foreground">
                    {activeType === "pull_request"
                      ? "PR Title / Fix Description *"
                      : activeType === "bug"
                        ? "Bug Summary *"
                        : "Feature Title *"}
                  </label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      activeType === "pull_request"
                        ? "e.g. Fix CORS Preflight Headers on Vendor Gateway"
                        : activeType === "bug"
                          ? "e.g. 504 Timeout during batch catalog sync"
                          : "e.g. Webhook Replay Simulator in Dev Tools"
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Target Service / Area
                  </label>
                  <select
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                    className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                  >
                    {servicesList.map((svc) => (
                      <option key={svc} value={svc}>
                        {svc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Meta */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high" | "critical")
                    }
                    className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                  >
                    <option value="low">Low (Nice to have)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical / Urgent</option>
                  </select>
                </div>

                {activeType === "bug" && (
                  <>
                    <div>
                      <label className="mb-1 block font-medium text-foreground">
                        Severity
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="P0">P0 - Blocker / Outage</option>
                        <option value="P1">P1 - Critical</option>
                        <option value="P2">P2 - Major</option>
                        <option value="P3">P3 - Minor</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-foreground">
                        Environment
                      </label>
                      <select
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="Develop">Develop</option>
                        <option value="Test">Test (QA)</option>
                        <option value="Stage">Stage</option>
                        <option value="DevOps & Tools">DevOps & Tools</option>
                        <option value="All">All Environments</option>
                      </select>
                    </div>
                  </>
                )}

                <div className={activeType === "bug" ? "" : "sm:col-span-3"}>
                  <label className="mb-1 block font-medium text-foreground">
                    Tags (comma separated)
                  </label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Gateway, CORS, Auth"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Type specific fields */}
              {activeType === "feature" && (
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Description & Expected Value
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain what problem this feature solves and why it would be beneficial for the team..."
                    className="w-full rounded-md border border-border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {activeType === "bug" && (
                <>
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Steps to Reproduce
                    </label>
                    <textarea
                      rows={3}
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      placeholder="1. Go to...\n2. Click on...\n3. Observe error..."
                      className="w-full rounded-md border border-border bg-background p-2 font-mono text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-medium text-foreground">
                        Expected Behavior
                      </label>
                      <textarea
                        rows={2}
                        value={expectedBehavior}
                        onChange={(e) => setExpectedBehavior(e.target.value)}
                        placeholder="What should have happened..."
                        className="w-full rounded-md border border-border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-foreground">
                        Actual Behavior
                      </label>
                      <textarea
                        rows={2}
                        value={actualBehavior}
                        onChange={(e) => setActualBehavior(e.target.value)}
                        placeholder="What actually occurred or error message..."
                        className="w-full rounded-md border border-border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeType === "pull_request" && (
                <>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-medium text-foreground">
                        Branch Name
                      </label>
                      <Input
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. fix/vendor-cors-preflight"
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-foreground">
                        Git / DevOps PR Link
                      </label>
                      <Input
                        value={prUrl}
                        onChange={(e) => setPrUrl(e.target.value)}
                        placeholder="e.g. https://hig-devops.../pullrequest/123"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-medium text-foreground">
                        Code Changes / Git Diff Patch
                      </label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Unified diff format (+ / -)
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={diffContent}
                      onChange={(e) => setDiffContent(e.target.value)}
                      placeholder={`--- a/src/Service.cs\n+++ b/src/Service.cs\n@@ -10,3 +10,4 @@\n- old code\n+ new code`}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-100 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Testing & Verification Notes
                    </label>
                    <textarea
                      rows={2}
                      value={testNotes}
                      onChange={(e) => setTestNotes(e.target.value)}
                      placeholder="How did you test this fix? (e.g. curl command, manual verification on Dev, unit test suite)"
                      className="w-full rounded-md border border-border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className={`cursor-pointer gap-1.5 text-xs font-semibold text-white ${
                  activeType === "pull_request"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : activeType === "bug"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>
                      {activeType === "pull_request"
                        ? "Submit Pull Request"
                        : activeType === "bug"
                          ? "Submit Bug Report"
                          : "Submit Feature Request"}
                    </span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
