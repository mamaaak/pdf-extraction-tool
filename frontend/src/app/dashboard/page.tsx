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
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 animate-fade-in-up">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight gradient-text">Dashboard</h1>
              <p className="text-gray-600 text-lg">
                {currentReport?.metadata?.title || 'Report Analysis and Visualization'}
              </p>
            </div>
          </div>
        </div>
        
        {currentReport && (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="border-blue-200 hover:bg-blue-50 transition-colors shadow-sm">
              <FileIcon className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="border-green-200 hover:bg-green-50 transition-colors shadow-sm">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}
      </div>
      
      {/* Report selector */}
      <Card className="mb-12 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 animate-fade-in-scale">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Available Reports</CardTitle>
              <CardDescription className="text-gray-600">
                Choose a report to view its analysis and visualizations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {reports.map((report, index) => (
              <Button
                key={report.id}
                variant={reportId === report.id ? "default" : "outline"}
                size="sm"
                asChild
                className={reportId === report.id 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                  : "border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors animate-fade-in-scale"
                }
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/dashboard?id=${report.id}`}>
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {report.title || report.documentType || `Report ${report.id.slice(0, 8)}`}
                </Link>
              </Button>
            ))}
            
            {reports.length === 0 && !loading && (
              <div className="text-center w-full py-8 animate-fade-in-scale">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-3">No reports available yet</p>
                <Button asChild variant="outline" className="border-blue-200 hover:bg-blue-50 transition-colors">
                  <Link href="/upload">
                    <FileIcon className="mr-2 h-4 w-4" />
                    Upload your first document
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-scale">
          <div className="relative mb-6">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full border-4 border-blue-100"></div>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Loading dashboard...</p>
          <p className="text-sm text-gray-600">This may take a moment</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 animate-fade-in-scale">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-900">Error Loading Dashboard</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : currentReport ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="animate-fade-in-scale">
              <StatCard
                title="Goals"
                value={currentReport.summary.totalGoals}
                description="Total goals identified"
                icon={<FileTextIcon className="h-5 w-5 text-blue-600" />}
              />
            </div>
            
            <div className="animate-fade-in-scale delay-100">
              <StatCard
                title="BMPs"
                value={currentReport.summary.totalBMPs}
                description="Best Management Practices"
                icon={<FileTextIcon className="h-5 w-5 text-purple-600" />}
              />
            </div>
            
            <div className="animate-fade-in-scale delay-200">
              <StatCard
                title="Completion Rate"
                value={`${Math.round(currentReport.summary.completionRate * 100)}%`}
                description="Implementation progress"
                trend={currentReport.summary.completionRate > 0.5 ? {
                  value: currentReport.summary.completionRate * 100,
                  positive: true
                } : undefined}
                icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
              />
            </div>
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
                  <FileIcon className="mr-2 h-4 w-4" />
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