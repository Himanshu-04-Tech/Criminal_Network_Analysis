"use client";

import React from "react";
import {
  ShieldAlert,
  Network,
  Sparkles,
  Share2,
  Database,
  Users,
  CreditCard,
  Radio,
} from "lucide-react";
import { RoleType } from "@/types";

export interface RoleBadgeProps {
  role: RoleType | string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function RoleBadge({ role, size = "sm", showIcon = true }: RoleBadgeProps) {
  const norm = role.toUpperCase();

  let colorStyle = "border-slate-200 bg-slate-100 text-slate-700";
  let Icon = Network;

  switch (norm) {
    case "BROKER":
      colorStyle = "border-amber-200 bg-amber-50 text-amber-800 shadow-2xs";
      Icon = ShieldAlert;
      break;
    case "HUB":
      colorStyle = "border-blue-200 bg-blue-50 text-blue-700 shadow-2xs";
      Icon = Network;
      break;
    case "INFLUENCER":
      colorStyle = "border-purple-200 bg-purple-50 text-purple-700 shadow-2xs";
      Icon = Sparkles;
      break;
    case "CONNECTOR":
      colorStyle = "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-2xs";
      Icon = Share2;
      break;
    case "RESOURCE_CONTROLLER":
      colorStyle = "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-2xs";
      Icon = Database;
      break;
    case "COORDINATOR":
      colorStyle = "border-rose-200 bg-rose-50 text-rose-800 shadow-2xs";
      Icon = Users;
      break;
    case "FINANCIAL_CONDUIT":
      colorStyle = "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-2xs";
      Icon = CreditCard;
      break;
    default:
      colorStyle = "border-slate-200 bg-slate-100 text-slate-700";
      Icon = Radio;
      break;
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-bold uppercase tracking-wider ${colorStyle} ${padding}`}
    >
      {showIcon && <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />}
      <span>{norm.replace("_", " ")}</span>
    </span>
  );
}

