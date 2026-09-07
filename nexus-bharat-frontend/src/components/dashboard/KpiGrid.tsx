"use client";

import React from "react";
import {
  Folder,
  Users,
  Share2,
  ShieldAlert,
  Network,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/cards/StatCard";
import { DashboardMetrics } from "@/types/dashboard";

export interface KpiGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export function KpiGrid({ metrics, isLoading }: KpiGridProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
          >
            <div className="h-3 w-20 rounded bg-slate-100 mb-3" />
            <div className="h-7 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {/* 1. Active Cases */}
      <motion.div variants={item}>
        <StatCard
          title="Active Cases"
          value={metrics.activeCases}
          icon={Folder}
          accent="blue"
          trend={metrics.trends?.casesTrend}
          subtitle="FIR investigations"
        />
      </motion.div>

      {/* 2. Entities */}
      <motion.div variants={item}>
        <StatCard
          title="Entities"
          value={metrics.entities}
          icon={Users}
          accent="blue"
          trend={metrics.trends?.entitiesTrend}
          subtitle="Monitored targets"
        />
      </motion.div>

      {/* 3. Relationships */}
      <motion.div variants={item}>
        <StatCard
          title="Relationships"
          value={metrics.relationships}
          icon={Share2}
          accent="cyan"
          trend={metrics.trends?.relationshipsTrend}
          subtitle="Associative edges"
        />
      </motion.div>

      {/* 4. Brokers */}
      <motion.div variants={item}>
        <StatCard
          title="Brokers"
          value={metrics.brokers}
          icon={ShieldAlert}
          accent="amber"
          trend={metrics.trends?.brokersTrend}
          badge="High Risk"
          subtitle="Bridge intermediaries"
        />
      </motion.div>

      {/* 5. Communities */}
      <motion.div variants={item}>
        <StatCard
          title="Communities"
          value={metrics.communities}
          icon={Network}
          accent="cyan"
          trend={metrics.trends?.communitiesTrend}
          subtitle="Syndicate clusters"
        />
      </motion.div>

      {/* 6. Critical Alerts */}
      <motion.div variants={item}>
        <StatCard
          title="Critical Alerts"
          value={metrics.criticalAlerts}
          icon={AlertTriangle}
          accent="red"
          badge="CRITICAL"
          trend={metrics.trends?.alertsTrend}
          subtitle="Priority anomalies"
        />
      </motion.div>
    </motion.div>
  );
}
