import React, { useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricChart } from '@/components/dashboard/MetricChart';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CalendarIcon, ListIcon, BarChart3Icon, LayoutDashboardIcon } from 'lucide-react';
import { adaptToDashboardFormat } from '@/utils/dataAdapters';
import { generateMockData } from '@/utils/mockData';

interface ResultsDisplayProps {
  results: {
    mainTopics?: string[];
    keyEntities?: { [key: string]: number };
    importantDates?: string[];
    findings?: string;
    rawText?: string;
    [key: string]: any;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const entityChartRef = useRef<HTMLDivElement>(null);

  // Process results for dashboard visualization
  const dashboardData = useMemo(() => {
    console.log('API Results being processed:', results);
    let adaptedData;
    
    try {
      // Try to adapt the API data
      adaptedData = adaptToDashboardFormat(results);
      console.log('Adapted data for dashboard:', adaptedData);
      
      // If the adapted data is empty (no goals, no BMPs, etc.), use mock data
      const isEmpty = 
        (!adaptedData.goals || adaptedData.goals.length === 0) && 
        (!adaptedData.bmps || adaptedData.bmps.length === 0) &&
        (!adaptedData.implementation || adaptedData.implementation.length === 0);
      
      if (isEmpty) {
        console.log('Using mock data instead of empty data');
        return generateMockData();
      }
      
      return adaptedData;
    } catch (err) {
      console.error('Error adapting data, falling back to mock data', err);
      return generateMockData();
    }
  }, [results]);
  
  // Build a human-readable document summary and fallback text preview
  const summaryText: string = useMemo(() => {
    if (typeof results.findings === 'string' && results.findings.trim().length > 0) {
      return results.findings.trim();
    }
    const text = (results as any).text || results.rawText || '';
    if (typeof text === 'string' && text.trim().length > 0) {
      const preview = text.trim().slice(0, 1200);
      return preview + (text.length > 1200 ? '…' : '');
    }
    return 'No summary available.';
  }, [results]);

  // Prepare data for entity chart if available
  const getEntityChartData = () => {
    if (!results.keyEntities) return [];
    
    return Object.entries(results.keyEntities)
      .slice(0, 5)
      .map(([name, value]) => ({
        name,
        value
      }));
  };

  // Prepare BMPs by category for a pie chart
  const bmpCategoryData = useMemo(() => {
    const bmps = Array.isArray((dashboardData as any).bmps) ? (dashboardData as any).bmps : [];
    const counts: Record<string, number> = {};
    bmps.forEach((b: any) => {
      const key = (b.category || 'Unknown').toString();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, value: count }));
  }, [dashboardData]);

  // Prepare monitoring metrics as bar data (numeric values only)
  const monitoringChartData = useMemo(() => {
    const monitoring = Array.isArray((dashboardData as any).monitoring) ? (dashboardData as any).monitoring : [];
    return monitoring
      .filter((m: any) => typeof m.value === 'number')
      .map((m: any) => ({ name: m.name || m.metric || m.id, value: m.value }));
  }, [dashboardData]);

  // Extract dates from text if API didn't provide importantDates
  const extractedDates = useMemo(() => {
    if (Array.isArray(results.importantDates) && results.importantDates.length > 0) {
      return results.importantDates;
    }
    const text: string = (results as any).text || results.rawText || '';
    if (!text) return [] as string[];

    const patterns: RegExp[] = [
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,
    ];
    const found = new Set<string>();
    patterns.forEach((re) => {
      const matches = text.match(re) || [];
      matches.forEach((m) => found.add(m));
    });
    return Array.from(found).slice(0, 50);
  }, [results]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">
              <ListIcon className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <LayoutDashboardIcon className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="charts">
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="dates">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Dates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {summaryText}
                </div>
              </CardContent>
            </Card>

            {results.mainTopics && results.mainTopics.length > 0 ? (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Main Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 list-disc list-inside">
                    {results.mainTopics.map((topic: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{topic}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard data={dashboardData} />
          </TabsContent>
          
          <TabsContent value="charts">
            <Dashboard data={dashboardData} />
          </TabsContent>

          <TabsContent value="dates">
            {extractedDates && extractedDates.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Important Dates & Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc list-inside">
                    {extractedDates.map((date: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{date}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No dates or numbers found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {results.rawText && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Raw Text Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 p-4 rounded-md max-h-40 overflow-y-auto border text-sm font-mono">
                {results.rawText.substring(0, 1000)}
                {results.rawText.length > 1000 && '...'}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {results.rawText.length > 1000 
                  ? `Showing first 1000 characters of ${results.rawText.length} total characters`
                  : `${results.rawText.length} total characters`}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;