import {
  LayoutDashboard,
  Network,
  GitBranch,
  ShieldAlert,
  Layers,
  FolderGit2,
  Clock,
  GitCompare,
  AlertTriangle,
  FileText,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
  description: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    description: "Command center intelligence overview and operational metrics",
  },
  {
    title: "Network Explorer",
    href: "/network-explorer",
    icon: Network,
    badge: "136 Nodes",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    description: "Interactive multi-hop entity graph visualization",
  },
  {
    title: "Connection Finder",
    href: "/connection-finder",
    icon: GitBranch,
    description: "Multi-hop hidden associative connection discovery",
  },
  {
    title: "Role Intelligence",
    href: "/network-intelligence",
    icon: ShieldAlert,
    badge: "Brokers",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description: "Automated topological role and influence classification",
  },
  {
    title: "Cross Case",
    href: "/cross-case",
    icon: Layers,
    description: "Inter-FIR hidden entity and evidence correlation",
  },
  {
    title: "Case Fusion",
    href: "/case-fusion",
    icon: FolderGit2,
    badge: "Emergent",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    description: "Analytical multi-FIR graph synthesis and bridge emergence",
  },
  {
    title: "Temporal",
    href: "/temporal",
    icon: Clock,
    badge: "Bursts",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Time-series sliding window analysis and communication bursts",
  },
  {
    title: "Graph Diff",
    href: "/graph-diff",
    icon: GitCompare,
    description: "Snapshot differencing, network evolution and impact scoring",
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
    badge: "5 Critical",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Prioritized tactical and financial laundering anomalies",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    badge: "7 Ready",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Court-ready audit reports and evidence packages",
  },
];
