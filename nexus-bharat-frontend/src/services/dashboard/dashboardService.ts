import { DashboardMetrics } from "@/types/dashboard";
import { Alert } from "@/types/alert";
import { IntelligenceFinding } from "@/types/finding";
import { ActivityEvent } from "@/types/activity";

import { mockDashboardMetrics } from "@/lib/mock/dashboard";
import { mockCriticalAlerts } from "@/lib/mock/alerts";
import { mockIntelligenceFindings } from "@/lib/mock/findings";
import { mockRecentActivity } from "@/lib/mock/activity";

/**
 * DashboardService
 * 
 * Central service layer for the Intelligence Overview Dashboard.
 * Currently returns local mock data with simulated async resolution.
 * Ready for future FastAPI endpoint integration without component changes.
 */
export class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Fetch top-level intelligence metrics (cases, entities, relationships, brokers, health metrics)
   */
  public async getMetrics(): Promise<DashboardMetrics> {
    // Simulated network delay for async contract
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { ...mockDashboardMetrics };
  }

  /**
   * Fetch priority critical and tactical anomaly alerts
   */
  public async getAlerts(): Promise<Alert[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockCriticalAlerts];
  }

  /**
   * Fetch investigative intelligence findings
   */
  public async getFindings(): Promise<IntelligenceFinding[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...mockIntelligenceFindings];
  }

  /**
   * Fetch chronological timeline of recent investigation events
   */
  public async getRecentActivity(): Promise<ActivityEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 90));
    return [...mockRecentActivity];
  }
}

export const dashboardService = DashboardService.getInstance();
