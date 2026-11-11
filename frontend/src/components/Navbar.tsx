"use client";

import React, { useState } from "react";
import { IndexStats } from "@/types";
import {
  FileText,
  Search,
  GitCompare,
  BarChart3,
  Menu,
  X,
  Scale,
} from "lucide-react";

export type NavTab = "copilot" | "workspace" | "diff" | "observatory";

export type UserMode = "standard" | "developer";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  stats: IndexStats | null;
  mode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  stats,
  mode,
  onModeChange,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "copilot", label: "Copilot", icon: Search },
    { id: "workspace", label: "Documents", icon: FileText },
    { id: "diff", label: "Compare", icon: GitCompare },
    { id: "observatory", label: "Evaluation", icon: BarChart3 },
  ];

  const visibleItems =
    mode === "developer"
      ? navItems
      : navItems.filter(
          (item) => item.id === "copilot" || item.id === "workspace"
        );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs">
            <Scale className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[15px] tracking-tight text-zinc-900">
              ClauseLens
            </span>
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/70">
              v1.0
            </span>
          </div>
        </div>

        {/* Center Minimalist Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1 rounded-lg border border-zinc-200/60">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-subtle border border-zinc-200/60"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-zinc-900" : "text-zinc-400"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Role Toggle + Developer Status */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-0.5 bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200/60">
            {(["standard", "developer"] as UserMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition cursor-pointer ${
                  mode === m
                    ? "bg-white text-zinc-900 shadow-subtle border border-zinc-200/60"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {mode === "developer" && (
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  <strong className="font-mono font-semibold text-zinc-900">
                    {stats?.dense_count ?? 6}
                  </strong>{" "}
                  vectors
                </span>
                <span className="text-zinc-300">&bull;</span>
                <span>
                  <strong className="font-mono font-semibold text-zinc-900">
                    {stats?.sparse_count ?? 6}
                  </strong>{" "}
                  BM25
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 mt-1 border-t border-zinc-100 flex items-center gap-1">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">
              View:
            </span>
            {(["standard", "developer"] as UserMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  onModeChange(m);
                  setMobileMenuOpen(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition cursor-pointer ${
                  mode === m
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
