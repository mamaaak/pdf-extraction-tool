/**
 * Types for the Dashboard data structure
 * Used for visualizing extracted document data
 */

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: string;
}

export interface BMP {
  id: string;
  name: string;
  description: string;
  category: string;
  effectiveness: number;
}

export interface ImplementationActivity {
  id: string;
  name: string;
  status: string;
  progress: number;
}

export interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
}

export interface OutreachActivity {
  id: string;
  name: string;
  reach: number;
  type: string;
}

export interface GeographicArea {
  id: string;
  name: string;
  size?: number;
  unit?: string;
}

export interface ExtractedReport {
  summary: {
    totalGoals: number;
    totalBMPs: number;
    completionRate: number;
  };
  goals: Goal[];
  bmps: BMP[];
  implementation: ImplementationActivity[];
  monitoring: MonitoringMetric[];
  outreach: OutreachActivity[];
  geographicAreas: GeographicArea[];
}

/**
 * API Response interfaces
 */
export interface ApiResponse {
  success: boolean;
  data?: ExtractedReport;
  error?: string;
  confidence?: number;
  metadata?: Record<string, any>;
  text?: string;
  [key: string]: any;
}