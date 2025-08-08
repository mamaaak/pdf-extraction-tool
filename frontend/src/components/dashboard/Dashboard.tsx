import React from 'react';
import { MetricChart } from './MetricChart';
import { ExtractedReport } from '@/types/dashboard';

interface DashboardProps {
  data: ExtractedReport;
}

export function Dashboard({ data }: DashboardProps) {
  // Prepare data for different charts
  
  // Ensure we have data or use placeholder data
  const summary = data?.summary || { totalGoals: 0, totalBMPs: 0, completionRate: 0 };
  const goals = data?.goals || [];
  const bmps = data?.bmps || [];
  const implementation = data?.implementation || [];
  const monitoring = data?.monitoring || [];
  const outreach = data?.outreach || [];
  
  // Summary pie chart - ensure non-zero values for visualization
  const summaryData = [
    { name: 'Goals', value: Math.max(summary.totalGoals, 0) },
    { name: 'BMPs', value: Math.max(summary.totalBMPs, 0) },
    { name: 'Completion', value: Math.max(summary.completionRate, 0) },
  ].filter(item => item.value > 0);
  
  // Add placeholder if all values are zero
  if (summaryData.length === 0) {
    summaryData.push({ name: 'No Data', value: 1 });
  }
  
  // BMP effectiveness bar chart
  const bmpData = bmps.map(bmp => ({
    name: bmp.name && bmp.name.length > 20 ? bmp.name.substring(0, 20) + '...' : (bmp.name || 'Unnamed BMP'),
    effectiveness: bmp.effectiveness || 0,
    category: bmp.category || 'Uncategorized'
  }));
  
  // Implementation progress bar chart
  const implementationData = implementation.map(activity => ({
    name: activity.name && activity.name.length > 20 ? activity.name.substring(0, 20) + '...' : (activity.name || 'Unnamed Activity'),
    progress: activity.progress || 0,
    status: activity.status || 'Unknown'
  }));
  
  // Monitoring metrics bar chart
  const monitoringData = monitoring.map(metric => ({
    name: metric.name || 'Unnamed Metric',
    value: metric.value || 0,
    unit: metric.unit || ''
  }));
  
  // Outreach activities chart
  const outreachData = outreach.map(activity => ({
    name: activity.name || 'Unnamed Outreach',
    reach: activity.reach || 0,
    type: activity.type || 'Unknown'
  }));

  return (
    <div className="space-y-8 py-4 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-3xl font-bold text-white">Document Analysis Dashboard</h2>
        <p className="text-blue-100 mt-2">Visual representation of extracted document data</p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Goals</p>
            <p className="text-3xl font-bold text-gray-800">{data.summary.totalGoals}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total BMPs</p>
            <p className="text-3xl font-bold text-gray-800">{data.summary.totalBMPs}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-800">{data.summary.completionRate}%</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Charts */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Overview</h3>
          <div className="h-80">
            <MetricChart
              title=""
              data={summaryData}
              type="pie"
              dataKeys={['value']}
            />
          </div>
        </div>
        
        {/* Implementation Progress */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Implementation Progress</h3>
          <div className="h-80">
            {implementationData.length > 0 ? (
              <MetricChart
                title=""
                description=""
                data={implementationData}
                type="bar"
                dataKeys={['progress']}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p>No implementation data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* BMP Effectiveness */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">BMP Effectiveness Ratings</h3>
          <div className="h-80">
            {bmpData.length > 0 ? (
              <MetricChart
                title=""
                description=""
                data={bmpData}
                type="bar"
                dataKeys={['effectiveness']}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No BMP data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Monitoring Metrics */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoring Metrics</h3>
          <div className="h-80">
            {monitoringData.length > 0 ? (
              <MetricChart
                title=""
                description=""
                data={monitoringData}
                type="bar"
                dataKeys={['value']}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No monitoring data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Outreach Activities */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Outreach Activities</h3>
          <div className="h-80">
            {outreachData.length > 0 ? (
              <MetricChart
                title=""
                description=""
                data={outreachData}
                type="bar"
                dataKeys={['reach']}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No outreach activities data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}