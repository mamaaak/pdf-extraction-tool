"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  FileTextIcon, 
  DownloadIcon, 
  FileIcon, 
  ChevronDownIcon,
  BarChart3Icon,
  PieChartIcon,
  FileUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { MetricChart } from '@/components/dashboard/MetricChart';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define interfaces based on ExtractedReport type
interface Summary {
  totalGoals: number;
  totalBMPs: number;
  completionRate: number;
}

interface Goal {
  id: string;
  description: string;
  targetDate: string;
  status: string;
  relatedBMPs: string[];
}

interface BMP {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: string;
  timeframe: string;
  priority: string;
}

interface ImplementationActivity {
  activity: string;
  responsible: string[];
  timeline: string;
  status: string;
  costs: string;
}

interface MonitoringMetric {
  metric: string;
  frequency: string;
  baseline: string;
  target: string;
  responsible: string[];
}

interface ExtractedReport {
  id?: string;
  summary: Summary;
  goals: Goal[];
  bmps: BMP[];
  implementation: ImplementationActivity[];
  monitoring: MonitoringMetric[];
  documentType?: string;
  metadata?: {
    title?: string;
    date?: string;
    author?: string;
    [key: string]: any;
  };
  timestamp?: string;
}

interface DashboardProps {}

export default function Dashboard({ }: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  
  const [reports, setReports] = useState<{ id: string; title: string; documentType: string; timestamp: string }[]>([]);
  const [currentReport, setCurrentReport] = useState<ExtractedReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Fetch all reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/report`);
        if (response.data.success && response.data.reports) {
          setReports(response.data.reports);
        }
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch reports. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [apiUrl]);

  // Fetch specific report when ID changes
  useEffect(() => {
    const fetchReportDetails = async (id: string) => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/report/${id}`);
        if (response.data.success && response.data.report) {
          setCurrentReport(response.data.report.data);
          setError(null);
        }
        setLoading(false);
      } catch (err: any) {
        setError(`Failed to fetch report details: ${err.message}`);
        setLoading(false);
      }
    };
    
    if (reportId) {
      fetchReportDetails(reportId);
    } else if (reports.length > 0) {
      // If no report ID specified, use the first available report
      router.push(`/dashboard?id=${reports[0].id}`);
    }
  }, [reportId, reports, apiUrl, router]);

  // Handle export
  const handleExport = (format: 'json' | 'csv') => {
    if (!reportId) return;
    
    // Redirect to export endpoint (will trigger download)
    window.open(`${apiUrl}/api/export/${reportId}?format=${format}`, '_blank');
  };

  // Prepare chart data for goals status
  const getGoalsStatusData = () => {
    if (!currentReport?.goals) return [];
    
    const statusCounts: { [key: string]: number } = {
      'Complete': 0,
      'In Progress': 0,
      'Not Started': 0
    };
    
    currentReport.goals.forEach(goal => {
      const status = goal.status || 'Not Specified';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare chart data for BMP categories
  const getBMPCategoryData = () => {
    if (!currentReport?.bmps) return [];
    
    const categoryCounts: { [key: string]: number } = {};
    
    currentReport.bmps.forEach(bmp => {
      const category = bmp.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare chart data for summary metrics
  const getSummaryData = () => {
    if (!currentReport?.summary) return [];
    
    return [
      {
        name: 'Goals',
        count: currentReport.summary.totalGoals
      },
      {
        name: 'BMPs',
        count: currentReport.summary.totalBMPs
      },
      {
        name: 'Completion',
        count: Math.round(currentReport.summary.completionRate * 100)
      }
    ];
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {currentReport?.metadata?.title || 'Report Analysis and Visualization'}
          </p>
        </div>
        
        {currentReport && (
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <FileIcon className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}
      </div>
      
      {/* Report selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Report</CardTitle>
          <CardDescription>
            Choose a report to view its analysis and visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {reports.map((report) => (
              <Button
                key={report.id}
                variant={reportId === report.id ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/dashboard?id=${report.id}`}>
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {report.title || report.documentType || report.id}
                </Link>
              </Button>
            ))}
            
            {reports.length === 0 && !loading && (
              <div className="text-muted-foreground italic">
                No reports available. 
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/upload" className="ml-1">
                    Upload a document
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : currentReport ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Goals"
              value={currentReport.summary.totalGoals}
              description="Total goals identified"
              icon={<FileTextIcon className="h-4 w-4" />}
            />
            
            <StatCard
              title="BMPs"
              value={currentReport.summary.totalBMPs}
              description="Best Management Practices"
              icon={<FileTextIcon className="h-4 w-4" />}
            />
            
            <StatCard
              title="Completion Rate"
              value={`${Math.round(currentReport.summary.completionRate * 100)}%`}
              description="Implementation progress"
              trend={currentReport.summary.completionRate > 0.5 ? {
                value: currentReport.summary.completionRate * 100,
                positive: true
              } : undefined}
              icon={<CheckCircleIcon className="h-4 w-4" />}
            />
          </div>

          {/* Visualization Tabs */}
          <Tabs defaultValue="charts" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="data">Data Tables</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricChart
                  title="Goal Status Distribution"
                  data={getGoalsStatusData()}
                  type="pie"
                  dataKeys={['value']}
                />
                
                <MetricChart
                  title="BMP Categories"
                  data={getBMPCategoryData()}
                  type="pie"
                  dataKeys={['value']}
                />
                
                <MetricChart
                  title="Report Summary"
                  data={getSummaryData()}
                  type="bar"
                  dataKeys={['count']}
                  className="md:col-span-2"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Goals ({currentReport.goals.length})</CardTitle>
                  <CardDescription>List of identified goals and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b transition-colors">
                            <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                            <th className="h-10 px-4 text-left align-middle font-medium">Description</th>
                            <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                            <th className="h-10 px-4 text-left align-middle font-medium">Target Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentReport.goals.slice(0, 5).map((goal, index) => (
                            <tr key={goal.id || index} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle">{goal.id}</td>
                              <td className="p-4 align-middle">{goal.description}</td>
                              <td className="p-4 align-middle">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  goal.status === 'Complete' ? 'bg-green-100 text-green-800' :
                                  goal.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {goal.status === 'Complete' && <CheckCircleIcon className="mr-1 h-3 w-3" />}
                                  {goal.status === 'In Progress' && <ClockIcon className="mr-1 h-3 w-3" />}
                                  {goal.status === 'Not Started' && <XCircleIcon className="mr-1 h-3 w-3" />}
                                  {goal.status || 'Not specified'}
                                </span>
                              </td>
                              <td className="p-4 align-middle">{goal.targetDate || 'Not specified'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {currentReport.goals.length > 5 && (
                    <div className="mt-2 text-sm text-muted-foreground text-right">
                      Showing 5 of {currentReport.goals.length} goals
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">No report selected</h3>
              <p className="text-muted-foreground">
                Please select a report or upload a new document to analyze
              </p>
              <Button asChild>
                <Link href="/upload">
                  <FileUpIcon className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}