"use client";

import React, { useState } from "react";
import { Search, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
  showShortcut?: boolean;
}

export function SearchBar({
  placeholder = "Search suspects, burner phones, bank accounts, FIRs...",
  value: controlledValue,
  onChange,
  onSearch,
  className,
  showShortcut = true,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const query = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!isControlled) setInternalValue(newVal);
    onChange?.(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(query);
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange?.("");
    onSearch?.("");
  };

  return (
    <div className={cn("relative flex items-center w-full max-w-md", className)}>
      <Search className="absolute left-3.5 h-4 w-4 text-[#94A3B8] pointer-events-none" />

      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-16 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-xs"
      />

      <div className="absolute right-2.5 flex items-center gap-1">
        {query ? (
          <button
            onClick={handleClear}
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : showShortcut ? (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[#E2E8F0] bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#64748B]">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        ) : null}
      </div>
    </div>
  );
}
