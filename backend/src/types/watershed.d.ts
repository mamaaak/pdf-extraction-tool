/**
 * TypeScript definitions for Mississippi Watershed Plan data extraction
 */

export interface ExtractedReport {
  summary: ReportSummary;
  goals: Goal[];
  bmps: BMP[];
  implementation: ImplementationActivity[];
  monitoring: MonitoringMetric[];
  outreach: OutreachActivity[];
  geographicAreas: GeographicArea[];
}

export interface ReportSummary {
  totalGoals: number;
  totalBMPs: number;
  completionRate: number;
}

export interface Goal {
  id: string;
  description: string;
  targetDate: string; // YYYY-MM-DD or "Ongoing"
  status: string; // "Complete", "In Progress", "Not Started"
  relatedBMPs: string[];
}

export interface BMP {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: string; // Includes units
  timeframe: string;
  priority: string; // "High", "Medium", "Low"
}

export interface ImplementationActivity {
  activity: string;
  responsible: string[];
  timeline: string;
  status: string;
  costs: string;
}

export interface MonitoringMetric {
  metric: string;
  frequency: string;
  baseline: string;
  target: string;
  responsible: string[];
}

export interface OutreachActivity {
  activity: string;
  audience: string[];
  timeline: string;
  responsible: string[];
}

export interface GeographicArea {
  name: string;
  priority: string;
  size: string; // Includes units
  description: string;
}

export interface ValidationResult {
  totalChecks: number;
  passedChecks: number;
  sectionValidation: {
    [key: string]: SectionValidation;
  };
  issues: string[];
}

export interface SectionValidation {
  totalChecks: number;
  passedChecks: number;
  issues: string[];
}

export interface ExtractedDataResult {
  data: ExtractedReport;
  validation: ValidationResult;
  confidence: number;
}

export interface WatershedApiResponse {
  success: boolean;
  confidence?: number;
  warning?: string;
  data?: ExtractedReport;
  validation?: ValidationResult;
  error?: string;
}