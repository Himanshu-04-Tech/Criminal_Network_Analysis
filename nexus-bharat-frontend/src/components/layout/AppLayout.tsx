"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Background Subtle Light Intelligence Grid */}
      <div className="pointer-events-none fixed inset-0 intel-grid opacity-60 z-0" />

      {/* Fixed Glass Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "relative z-10 flex min-h-screen flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:pl-64" : "md:pl-18"
        )}
      >
        {/* Floating Glass Navbar */}
        <Navbar />

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 pt-2">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Legal & Security Classification Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white/75 backdrop-blur-md py-3.5 px-6 text-center text-[11px] font-mono text-[#64748B] tracking-wider">
          NEXUS-BHARAT CRIMINAL INTELLIGENCE PLATFORM // CLASSIFICATION: LAW ENFORCEMENT SENSITIVE // STRICT ACCESS AUDIT ACTIVE
        </footer>
      </div>
    </div>
  );
}
