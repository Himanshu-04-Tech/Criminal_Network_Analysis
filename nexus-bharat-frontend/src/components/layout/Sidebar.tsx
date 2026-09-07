"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col glass-sidebar transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-18",
        "max-md:-translate-x-full md:translate-x-0",
        sidebarOpen && "max-md:translate-x-0 max-md:w-64 max-md:shadow-[0_20px_50px_rgba(15,23,42,0.15)]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between border-b border-[#E2E8F0] px-4">
        <Link href="/overview" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20">
            <Shield className="h-5 w-5 fill-white/20" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-[#0F172A]">
                NEXUS<span className="text-[#2563EB]">-</span>BHARAT
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#64748B] font-mono font-medium">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Security Classification Ribbon */}
      {sidebarOpen && (
        <div className="border-b border-amber-200/60 bg-amber-50/70 px-4 py-1.5 text-[10px] font-mono font-semibold tracking-widest text-amber-800 flex items-center justify-between">
          <span>RESTRICTED // LEA ONLY</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/overview" && pathname === "/") ||
            (item.href !== "/overview" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.title : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs"
                  : "text-[#64748B] hover:bg-slate-100/70 hover:text-[#0F172A]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-150",
                  isActive
                    ? "text-[#2563EB]"
                    : "text-[#64748B] group-hover:text-[#0F172A]"
                )}
              />

              {sidebarOpen && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase",
                        item.badgeColor || "bg-blue-100 text-blue-700"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Active Indicator Bar on left */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#2563EB]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="border-t border-[#E2E8F0] p-3 bg-slate-50/50">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl bg-white p-2 border border-[#E2E8F0] shadow-xs",
            !sidebarOpen && "justify-center p-1.5"
          )}
        >
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>

          {sidebarOpen && (
            <div className="flex flex-col overflow-hidden text-[11px]">
              <span className="font-semibold text-[#0F172A] truncate">Grid Synchronized</span>
              <span className="text-[10px] font-mono text-[#64748B]">8 Engines Active</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
