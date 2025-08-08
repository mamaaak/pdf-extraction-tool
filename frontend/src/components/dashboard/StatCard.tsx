import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 group", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{title}</CardTitle>
        {icon && (
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform">{value}</div>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-2 mt-3 p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
            <div className={cn(
              "w-2 h-2 rounded-full",
              trend.positive ? "bg-green-500" : "bg-red-500"
            )}></div>
            <span className={
              cn("text-sm font-medium",
                trend.positive ? "text-green-700" : "text-red-700")
            }>
              {trend.positive ? "+" : ""}{trend.value.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">completion rate</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}