"use client"

import * as React from "react"
import type { Service } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CATEGORIES } from "@/hooks/use-services-dashboard"

interface ServiceFormDialogsProps {
  isAddOpen: boolean
  setIsAddOpen: (open: boolean) => void
  editingService: Service | null
  setEditingService: (svc: Service | null) => void
  formName: string
  setFormName: (v: string) => void
  formDescription: string
  setFormDescription: (v: string) => void
  formCategory: string
  setFormCategory: (v: string) => void
  formEnvironment: string
  setFormEnvironment: (v: string) => void
  formStatus: string
  setFormStatus: (v: string) => void
  formUrl: string
  setFormUrl: (v: string) => void
  formOwner: string
  setFormOwner: (v: string) => void
  isSubmitting: boolean
  onCreateService: (e: React.FormEvent) => void
  onUpdateService: (e: React.FormEvent) => void
}

export function ServiceFormDialogs({
  isAddOpen,
  setIsAddOpen,
  editingService,
  setEditingService,
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  formCategory,
  setFormCategory,
  formEnvironment,
  setFormEnvironment,
  formStatus,
  setFormStatus,
  formUrl,
  setFormUrl,
  formOwner,
  setFormOwner,
  isSubmitting,
  onCreateService,
  onUpdateService,
}: ServiceFormDialogsProps) {
  return (
    <>
      {/* Add Service Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={onCreateService}>
            <DialogHeader>
              <DialogTitle>Register New Service</DialogTitle>
              <DialogDescription>
                Add a new service, microservice, or portal to the Neon database catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Service Name *
                </label>
                <Input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Orders Settlement API"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Environment *
                  </label>
                  <select
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Develop">Develop</option>
                    <option value="Test">Test</option>
                    <option value="Stage">Stage</option>
                    <option value="DevOps & Tools">DevOps & Tools</option>
                    <option value="Portals & HR">Portals & HR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Description *
                </label>
                <Input
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short description of service responsibilities..."
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Endpoint URL *
                </label>
                <Input
                  required
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="operational">Operational</option>
                    <option value="degraded">Degraded</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Owner Team
                  </label>
                  <Input
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    placeholder="e.g. Commerce Squad"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save to Neon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={onUpdateService}>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Modify the configuration and links for this service in the catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Service Name *
                </label>
                <Input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Environment *
                  </label>
                  <select
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Develop">Develop</option>
                    <option value="Test">Test</option>
                    <option value="Stage">Stage</option>
                    <option value="DevOps & Tools">DevOps & Tools</option>
                    <option value="Portals & HR">Portals & HR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Description *
                </label>
                <Input
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Endpoint URL *
                </label>
                <Input
                  required
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="operational">Operational</option>
                    <option value="degraded">Degraded</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Owner Team
                  </label>
                  <Input
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingService(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
