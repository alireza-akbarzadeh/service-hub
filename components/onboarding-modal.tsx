"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Compass,
  Layers,
  Database,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Share2,
} from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [step, setStep] = React.useState(1)

  const steps = [
    {
      step: 1,
      badge: "The Vision",
      title: "Why Service Hub Exists",
      description:
        "Modern engineering teams manage dozens of microservices, gateways, and tools scattered across environments. Service Hub unifies everything into a single, high-speed developer portal.",
      icon: Compass,
      points: [
        "Eliminate lost Swagger, Kibana, Hangfire, and CAP event bus links.",
        "Clear organization across Develop, Test, Stage, and Enterprise Portals.",
        "Zero-leakage team authentication protects internal infrastructure URLs.",
      ],
    },
    {
      step: 2,
      badge: "Core Architecture",
      title: "Neon Serverless Postgres & Drizzle",
      description:
        "Engineered for high performance and elasticity with cutting-edge serverless database infrastructure.",
      icon: Database,
      points: [
        "Neon Serverless PostgreSQL: Sub-second branching and automatic connection pooling.",
        "Drizzle ORM: Full type-safety, zero overhead, and effortless schema migrations.",
        "Next.js 16 App Router: Lightning-fast server rendering and Turbopack speed.",
      ],
    },
    {
      step: 3,
      badge: "Quick Guide",
      title: "How to Use the Dashboard",
      description:
        "Designed to boost day-to-day frontend and backend productivity in just seconds.",
      icon: Zap,
      points: [
        "Sidebar Filter: Click any environment (Develop, Test, Stage) to isolate your squad's tools.",
        "Category Dropdown: Filter by Web Apps, API & Swagger, Messaging, or Background Jobs.",
        "Instant Search: Search by service title, domain keyword, or owner team.",
        "Register Service: Add your squad's new endpoints directly into Neon with one click.",
      ],
    },
  ]

  const currentStepData = steps[step - 1]
  const StepIcon = currentStepData.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border bg-card p-0 sm:max-w-xl">
        {/* Top Header Banner */}
        <div className="relative border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="mb-2 flex items-center justify-between">
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/20 bg-background/80 text-xs text-primary"
            >
              <Sparkles className="size-3" />
              {currentStepData.badge}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              Step {step} of {steps.length}
            </span>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <StepIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {currentStepData.title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {currentStepData.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body Points */}
        <div className="space-y-3 p-6">
          {currentStepData.points.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span className="leading-relaxed text-foreground">{point}</span>
            </div>
          ))}

          {/* Stepper progress dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => setStep(s.step)}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${
                  step === s.step
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to step ${s.step}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-border bg-muted/10 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Skip Tour
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                className="cursor-pointer text-xs"
              >
                Previous
              </Button>
            )}

            {step < steps.length ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                className="cursor-pointer gap-1 text-xs"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer gap-1 text-xs"
              >
                Get Started
                <CheckCircle2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
