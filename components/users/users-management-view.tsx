"use client"

import * as React from "react"
import Link from "next/link"
import {
  listUsersAction,
  updateUserRoleAction,
  deleteUserAction,
  registerAction,
  logoutUserAction,
} from "@/app/actions/auth"
import type { SessionUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Check,
  Copy,
  Gamepad2,
  KeyRound,
  Lock,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserCog,
  Users,
  VenetianMask,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserRow {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  role: string
  createdAt: string
}

const AVATAR_OPTIONS = [
  "🚀", "⚡", "🦊", "🦁", "🐼", "🤖",
  "👾", "🦄", "🎯", "💻", "🔥", "✨",
]

interface UsersManagementViewProps {
  currentUser?: SessionUser
}

export function UsersManagementView({ currentUser }: UsersManagementViewProps) {
  const [users, setUsers] = React.useState<UserRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [actionMessage, setActionMessage] = React.useState<{ text: string; isError?: boolean } | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Create User Modal state
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false)
  const [newUserName, setNewUserName] = React.useState("")
  const [newUserUsername, setNewUserUsername] = React.useState("")
  const [newUserEmail, setNewUserEmail] = React.useState("")
  const [newUserPassword, setNewUserPassword] = React.useState("")
  const [newUserAvatar, setNewUserAvatar] = React.useState("⚡")
  const [newUserRole, setNewUserRole] = React.useState<"admin" | "developer" | "viewer">("developer")
  const [isSubmittingNewUser, setIsSubmittingNewUser] = React.useState(false)

  // Load users from server
  const loadUsers = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await listUsersAction()
      if (res.success && res.users) {
        setUsers(res.users)
      }
    } catch (err) {
      console.warn("Failed to list users:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleCopyUsername = (username: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`@${username}`)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "developer" | "viewer") => {
    const previousUsers = [...users]
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )
    try {
      const res = await updateUserRoleAction(userId, newRole)
      if (res.success) {
        setActionMessage({ text: `Access role updated to ${newRole.toUpperCase()} successfully!` })
        setTimeout(() => setActionMessage(null), 3000)
      } else {
        setUsers(previousUsers)
        setActionMessage({ text: res.error || "Failed to update role", isError: true })
        setTimeout(() => setActionMessage(null), 3500)
      }
    } catch {
      setUsers(previousUsers)
      setActionMessage({ text: "Network error updating role", isError: true })
    }
  }

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return
    try {
      const res = await deleteUserAction(userId)
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setActionMessage({ text: `User ${name} removed.` })
        setTimeout(() => setActionMessage(null), 3000)
      } else {
        setActionMessage({ text: res.error || "Failed to remove user", isError: true })
        setTimeout(() => setActionMessage(null), 3500)
      }
    } catch {
      setActionMessage({ text: "Network error deleting user", isError: true })
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setActionMessage({ text: "All fields are required.", isError: true })
      return
    }

    setIsSubmittingNewUser(true)
    try {
      const res = await registerAction({
        name: newUserName.trim(),
        username: newUserUsername.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        avatar: newUserAvatar,
        role: newUserRole,
      })

      if (res.success) {
        setIsAddUserOpen(false)
        setNewUserName("")
        setNewUserUsername("")
        setNewUserEmail("")
        setNewUserPassword("")
        await loadUsers()
        setActionMessage({ text: "New user account created successfully!" })
        setTimeout(() => setActionMessage(null), 3000)
      } else {
        setActionMessage({ text: res.error || "Failed to create user", isError: true })
      }
    } catch {
      setActionMessage({ text: "Network error creating user", isError: true })
    } finally {
      setIsSubmittingNewUser(false)
    }
  }

  // Filtered users list
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const adminCount = users.filter((u) => u.role === "admin").length
  const devCount = users.filter((u) => u.role === "developer").length
  const viewerCount = users.filter((u) => u.role === "viewer").length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs font-medium cursor-pointer shadow-2xs hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Services</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">
                Access Management & Users
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Role-based access control, Google/Gmail accounts, & identity settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/chat">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs font-semibold cursor-pointer border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
            >
              <Gamepad2 className="size-3.5" />
              <span>Anon & Team Chat</span>
            </Button>
          </Link>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            className="h-8 gap-1.5 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add User</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Action Message */}
        {actionMessage && (
          <div
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium border shadow-xs animate-in fade-in-50",
              actionMessage.isError
                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <span>{actionMessage.text}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="cursor-pointer text-xs underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active User Session */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Current Active Session
              </span>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-mono border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
              >
                {currentUser?.role || "Admin"}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl shadow-inner">
                {currentUser?.avatar || "👤"}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm truncate">
                  {currentUser?.name || "Active Session"}
                </div>
                <div className="font-mono text-xs text-muted-foreground truncate">
                  @{currentUser?.username || "administrator"}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Total Users */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Team Accounts
              </span>
              <Users className="size-4 text-sky-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight">
                {users.length}
              </span>
              <span className="text-xs text-muted-foreground">registered</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Google/Gmail + Username accounts
            </div>
          </div>

          {/* Card 3: Role Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Access Roles
              </span>
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-mono text-[11px]">
                {adminCount} Admin
              </Badge>
              <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-mono text-[11px]">
                {devCount} Dev
              </Badge>
              <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 font-mono text-[11px]">
                {viewerCount} Viewer
              </Badge>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Granular permission matrix
            </div>
          </div>

          {/* Card 4: Chat Identity Mode */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Chat Identity Control
              </span>
              <VenetianMask className="size-4 text-amber-500" />
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px]"
              >
                Anonymous Persona
              </Badge>
              <span className="text-xs text-muted-foreground">or</span>
              <Badge
                variant="outline"
                className="border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[10px]"
              >
                Verified User
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Each user toggles freely inside chat input bar
            </p>
          </div>
        </div>

        {/* Access Permissions Matrix Explanation Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <h2 className="text-sm font-bold">Access Control Matrix</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Configured via PBKDF2 Hashing & Neon Database
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                <ShieldAlert className="size-4" />
                <span>Admin</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Full authority: manage all catalog services, edit user roles, invite/delete members, create channels, and inspect audit logs.
              </p>
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                <UserCheck className="size-4" />
                <span>Developer</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Development privileges: access all environments (Dev, Test, Stage), execute cURL tests, query DevOps WIQL, and toggle chat between Real User and Anonymous persona.
              </p>
            </div>

            <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
                <User className="size-4" />
                <span>Viewer</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Read-only access: view service endpoints, health check status, documentation links, and participate in community chat lounge.
              </p>
            </div>
          </div>
        </div>

        {/* User Directory Table Section */}
        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border p-4 bg-muted/20">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, @username, or email..."
                className="h-9 pl-8 text-xs bg-background"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs">
                {["all", "admin", "developer", "viewer"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={cn(
                      "cursor-pointer rounded-md px-2.5 py-1 text-xs capitalize transition-colors font-medium",
                      roleFilter === role
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadUsers}
                disabled={isLoading}
                className="h-9 gap-1.5 px-3 text-xs cursor-pointer shadow-2xs"
                title="Refresh user list"
              >
                <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Email / Account</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">
                    Chat Capability
                  </th>
                  <th className="py-3 px-4 font-semibold hidden lg:table-cell">
                    Registered
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Loading users from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Users className="size-8 mx-auto text-muted-foreground/50" />
                        <p className="font-semibold text-foreground">No users match your filter</p>
                        <p className="text-xs">Try clearing the search query or role filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id
                    return (
                      <tr
                        key={u.id}
                        className={cn(
                          "transition-colors hover:bg-muted/30",
                          isSelf && "bg-indigo-500/5 font-medium"
                        )}
                      >
                        {/* User Identity Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-card border border-border shadow-2xs text-lg select-none">
                              {u.avatar || "👤"}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <Badge
                                    variant="outline"
                                    className="border-indigo-500/40 text-indigo-600 dark:text-indigo-400 text-[9px] px-1 py-0 h-4"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyUsername(u.username, u.id)}
                                className="group flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Click to copy username"
                              >
                                <span>@{u.username}</span>
                                {copiedId === u.id ? (
                                  <Check className="size-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Email Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Mail className="size-3 text-muted-foreground shrink-0" />
                            <span className="font-mono text-muted-foreground truncate max-w-[180px]">
                              {u.email}
                            </span>
                            {u.email.endsWith("@gmail.com") && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1 py-0 h-4 font-mono hidden sm:inline-flex"
                              >
                                Gmail
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Role Selector Column */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(
                                u.id,
                                e.target.value as "admin" | "developer" | "viewer"
                              )
                            }
                            className={cn(
                              "cursor-pointer rounded-lg border px-2 py-1 text-xs font-semibold shadow-2xs transition-colors",
                              u.role === "admin"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : u.role === "developer"
                                ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                                : "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>

                        {/* Chat Capability Column */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <VenetianMask className="size-3 text-amber-500" />
                              <span>Anon</span>
                            </span>
                            <span className="text-muted-foreground/60">/</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <UserCheck className="size-3 text-sky-500" />
                              <span>Verified</span>
                            </span>
                          </div>
                        </td>

                        {/* Created Date Column */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground hidden lg:table-cell">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Action Buttons Column */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isSelf && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="size-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                                title="Remove user"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserCog className="size-4 text-indigo-500" />
              <span>Create New User Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new coworker to the catalog with username, password, email, and role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            {/* Avatar Emoji Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Choose Avatar Emoji
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-muted/30">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewUserAvatar(emoji)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-lg transition-transform cursor-pointer",
                      newUserAvatar === emoji
                        ? "bg-indigo-600 text-white scale-110 shadow-xs"
                        : "hover:bg-muted"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                    @
                  </span>
                  <Input
                    required
                    value={newUserUsername}
                    onChange={(e) =>
                      setNewUserUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                      )
                    }
                    placeholder="sarah_c"
                    className="h-9 pl-7 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Email (Gmail) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Gmail or Work Email
              </label>
              <Input
                required
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="sarah@gmail.com"
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Initial Password
              </label>
              <Input
                required
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="h-9 text-xs"
              />
            </div>

            {/* Role Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Assign Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["developer", "admin", "viewer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewUserRole(r)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-2 text-center text-xs font-semibold capitalize transition-all",
                      newUserRole === r
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddUserOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingNewUser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                {isSubmittingNewUser ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
