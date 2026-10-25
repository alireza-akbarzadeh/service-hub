"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/db/schema";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Star,
  CornerDownLeft,
  X,
  Layers,
  Code2,
  MonitorCheck,
  Cpu,
  Network,
  Building2,
  Globe,
  Hash,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

const ENV_ICONS: Record<string, React.ElementType> = {
  Develop: Code2,
  Test: MonitorCheck,
  Stage: Cpu,
  "DevOps & Tools": Network,
  "Portals & HR": Building2,
};

export function CommandPalette({
  open,
  onOpenChange,
  services,
  favorites,
  onToggleFavorite,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<string>("All");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const lastMousePosRef = React.useRef({ x: 0, y: 0 });

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Filter services based on search query and quick filter
  const filteredServices = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((svc) => {
      const matchesEnv =
        activeFilter === "All"
          ? true
          : activeFilter === "Favorites"
          ? favorites.includes(svc.id)
          : svc.environment === activeFilter;

      if (!matchesEnv) return false;
      if (!q) return true;

      return (
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q) ||
        svc.environment.toLowerCase().includes(q) ||
        (svc.owner && svc.owner.toLowerCase().includes(q)) ||
        svc.url.toLowerCase().includes(q)
      );
    });
  }, [services, query, activeFilter, favorites]);

  // Reset selected index safely when filtered list changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredServices.length, query, activeFilter]);

  // Scroll selected item into view whenever selectedIndex changes
  React.useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIndex]);

  const copyUrl = (svc: Service, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(svc.url);
    setCopiedId(svc.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openService = React.useCallback(
    (svc: Service) => {
      if (!svc || !svc.url) return;
      // Use clean anchor navigation so browser pop-up blockers never block it
      const a = document.createElement("a");
      a.href = svc.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onOpenChange(false);
    },
    [onOpenChange]
  );

  // Global keydown handler for ArrowDown, ArrowUp, Enter, Escape, Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredServices.length > 0 ? (prev + 1) % filteredServices.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredServices.length > 0
            ? (prev - 1 + filteredServices.length) % filteredServices.length
            : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredServices[selectedIndex]) {
          openService(filteredServices[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, filteredServices, selectedIndex, openService]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-150"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette Modal Box */}
      <div className="relative z-50 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-border px-4 py-3">
          <Search className="size-5 shrink-0 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services... (Use ↑↓ arrows to navigate, Enter to visit)"
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="mr-2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/20 px-4 py-2 text-xs no-scrollbar">
          {[
            "All",
            "Favorites",
            "Develop",
            "Test",
            "Stage",
            "DevOps & Tools",
            "Portals & HR",
          ].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter === "Favorites" ? (
                  <Star
                    className={cn(
                      "size-3",
                      isActive
                        ? "fill-primary-foreground"
                        : "text-amber-500 fill-amber-500"
                    )}
                  />
                ) : filter === "All" ? (
                  <Layers className="size-3" />
                ) : (
                  <Hash className="size-3 opacity-60" />
                )}
                <span>{filter}</span>
                {filter === "Favorites" && favorites.length > 0 && (
                  <span
                    className={cn(
                      "text-[10px] ml-0.5 px-1 py-0.2 rounded-full",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] min-h-[160px] overflow-y-auto p-2"
        >
          {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Search className="size-8 opacity-40 mb-2 stroke-1" />
              <p className="text-sm font-medium">
                No services matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for general keywords like &ldquo;admin&rdquo;, &ldquo;kibana&rdquo;, or &ldquo;swagger&rdquo;
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredServices.map((svc, index) => {
                const isSelected = index === selectedIndex;
                const isFavorite = favorites.includes(svc.id);
                const EnvIcon = ENV_ICONS[svc.environment] || Globe;

                return (
                  <div
                    key={svc.id}
                    data-index={index}
                    onClick={() => openService(svc)}
                    onMouseMove={(e) => {
                      // Only update selection if mouse actually moved
                      if (
                        Math.abs(e.clientX - lastMousePosRef.current.x) > 3 ||
                        Math.abs(e.clientY - lastMousePosRef.current.y) > 3
                      ) {
                        lastMousePosRef.current = {
                          x: e.clientX,
                          y: e.clientY,
                        };
                        if (selectedIndex !== index) {
                          setSelectedIndex(index);
                        }
                      }
                    }}
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/15 text-foreground ring-2 ring-primary/80 border-primary/40 shadow-xs"
                        : "hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Active Indicator Chevron */}
                      <div className="flex size-4 items-center justify-center shrink-0">
                        {isSelected ? (
                          <ArrowRight className="size-3.5 text-primary animate-pulse" />
                        ) : null}
                      </div>

                      {/* Environment Icon */}
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                          isSelected
                            ? "border-primary/50 bg-primary/20 text-primary font-semibold"
                            : "border-border bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <EnvIcon className="size-3.5" />
                      </div>

                      {/* Title & Description */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-semibold truncate",
                              isSelected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {svc.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 font-normal shrink-0"
                          >
                            {svc.environment}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-normal shrink-0 hidden sm:inline-flex"
                          >
                            {svc.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {svc.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions on Item */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(svc.id);
                        }}
                        className={cn(
                          "p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer",
                          isFavorite
                            ? "text-amber-500"
                            : "text-muted-foreground hover:text-amber-500"
                        )}
                        title={
                          isFavorite ? "Unpin service" : "Pin to favorites"
                        }
                      >
                        <Star
                          className={cn(
                            "size-3.5",
                            isFavorite && "fill-amber-400"
                          )}
                        />
                      </button>

                      {/* Copy URL Button */}
                      <button
                        type="button"
                        onClick={(e) => copyUrl(svc, e)}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        title="Copy URL"
                      >
                        {copiedId === svc.id ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>

                      {/* Visit / Open action badge */}
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-mono transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "hidden sm:inline-flex opacity-0 group-hover:opacity-60 bg-muted text-muted-foreground"
                        )}
                      >
                        <span>Visit</span>
                        <CornerDownLeft className="size-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                ↵
              </kbd>
              <span>visit app</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ESC
              </kbd>
              <span>close</span>
            </span>
          </div>

          <div className="text-[11px] font-medium text-muted-foreground">
            {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "service" : "services"}
          </div>
        </div>
      </div>
    </div>
  );
}
