"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  User,
  Clock,
  ChevronDown,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { SearchBar } from "@/components/common/SearchBar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { toggleSidebar, sidebarOpen } = useUIStore();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().slice(0, 19).replace("T", " ") + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 mx-4 sm:mx-6 lg:mx-8 my-3.5 flex h-[72px] items-center justify-between rounded-[20px] glass-navbar px-4 sm:px-6 transition-all">
      {/* Left: Mobile Toggle & Context Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all md:hidden shadow-xs"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span className="text-xs font-mono font-semibold text-[#64748B] tracking-wide">
            INTELLIGENCE GRID // NODE-01 DELHI HQ
          </span>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="flex flex-1 items-center justify-center px-4 max-w-xl">
        <SearchBar
          placeholder="Global associative search: suspect, burner SIM, account, FIR ID..."
          className="w-full"
        />
      </div>

      {/* Right: Telemetry, Notifications & Analyst Profile */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#475569] border border-[#E2E8F0] bg-slate-100/70 px-3 py-1.5 rounded-xl shadow-xs">
          <Clock className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>{currentTime || "2026-09-08 00:00:00 UTC"}</span>
        </div>

        {/* Tactical Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:border-slate-300 hover:text-[#0F172A] hover:bg-slate-50 transition-all shadow-xs"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-sm">
              5
            </span>
          </button>

          {/* Quick Notification Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-84 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Tactical Anomalies
                </span>
                <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  5 CRITICAL
                </span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-2.5">
                  <div className="font-semibold text-red-900">COMMUNICATION_BURST</div>
                  <div className="text-[11px] text-[#64748B]">37 calls over 6h between P001 & P017</div>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-2.5">
                  <div className="font-semibold text-amber-900">FINANCIAL_FAN_OUT</div>
                  <div className="text-[11px] text-[#64748B]">₹45L dispersed into 12 mules in 40m</div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
                  <div className="font-semibold text-blue-900">NEW_CROSS_CASE_BRIDGE</div>
                  <div className="text-[11px] text-[#64748B]">P017 detected bridging FIR001 & FIR007</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analyst Profile Pill */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white pl-2 pr-3 py-1.5 shadow-xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB] font-bold text-xs">
            JD
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#0F172A] leading-tight">Analyst R. Sanyal</span>
            <span className="text-[10px] font-mono text-[#64748B] leading-tight">Joint Directorate</span>
          </div>
        </div>
      </div>
    </header>
  );
}
