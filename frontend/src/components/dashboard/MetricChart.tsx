import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';

// Enhanced color palette with softer, more professional colors
const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#10b981', // green
  '#f97316', // orange
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#6366f1', // indigo
  '#ec4899'  // pink
];

interface MetricChartProps {
  title: string;
  description?: string;
  data: any[];
  type: 'bar' | 'pie' | 'line';
  dataKeys: string[];
  className?: string;
}

export function MetricChart({ 
  title, 
  description, 
  data, 
  type, 
  dataKeys,
  className 
}: MetricChartProps) {
  // Make sure data is an array to prevent errors
  const chartData = Array.isArray(data) ? data : [];

  // Debugging
  if (!Array.isArray(data) || data.length === 0) {
    console.warn(`MetricChart: data is not an array or is empty for ${title}`, data);
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full p-4" style={{ minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px',
                  }} 
                  cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontSize: '12px',
                  }}
                />
                {dataKeys.map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={COLORS[index % COLORS.length]} 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                ))}
              </BarChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey={dataKeys[0]}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px',
                  }} 
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom"
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px',
                  }} 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontSize: '12px',
                  }}
                />
                {dataKeys.map((key, index) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={2}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    dot={{ stroke: COLORS[index % COLORS.length], strokeWidth: 2, fill: '#ffffff', r: 4 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}