/**
 * Adapter functions to transform API response data into formats expected by components
 */
import { ExtractedReport, ApiResponse } from '../types/dashboard';

/**
 * Transform extracted data from the API into the format expected by the Dashboard component
 */
export function adaptToDashboardFormat(apiData: any): ExtractedReport {
  // Default empty structure
  const defaultData: ExtractedReport = {
    summary: {
      totalGoals: 0,
      totalBMPs: 0,
      completionRate: 0,
    },
    goals: [],
    bmps: [],
    implementation: [],
    monitoring: [],
    outreach: [],
    geographicAreas: [],
  };
  
  // If API doesn't return structured data in expected format,
  // attempt to populate from available fields
  if (!apiData || typeof apiData !== 'object') {
    return defaultData;
  }

  // If data is already in correct format, return it
  if (apiData.summary && apiData.goals) {
    return apiData;
  }
  
  // Handle documents data format from the documents/extract endpoint
  if (apiData.success === true && apiData.data) {
    // Debug the data structure
    console.log('Documents API response contains data object:', apiData.data);
    
    // The documents extraction endpoint returns data in a nested format
    // If the data has the expected structure, return it directly
    if (apiData.data.summary && typeof apiData.data.summary === 'object') {
      console.log('Found valid data structure with summary');
      return apiData.data;
    } else {
      // If for some reason the data isn't properly structured, attempt to build a compatible structure
      console.log('Documents data needs transformation');
      return {
        summary: {
          totalGoals: Array.isArray(apiData.data.goals) ? apiData.data.goals.length : 0,
          totalBMPs: Array.isArray(apiData.data.bmps) ? apiData.data.bmps.length : 0,
          completionRate: apiData.confidence || 0,
        },
        goals: apiData.data.goals || [],
        bmps: apiData.data.bmps || [],
        implementation: apiData.data.implementation || [],
        monitoring: apiData.data.monitoring || [],
        outreach: apiData.data.outreach || [],
        geographicAreas: apiData.data.geographicAreas || [],
      };
    }
  }
  
  // Otherwise, attempt to build a compatible structure
  const result = { ...defaultData };
  
  // Try to extract summary statistics
  if (apiData.mainTopics) {
    result.summary.totalGoals = apiData.mainTopics.filter((t: string) => 
      t.toLowerCase().includes('goal') || 
      t.toLowerCase().includes('objective')
    ).length;
  }
  
  if (apiData.keyEntities) {
    // Try to find BMP references
    const bmpKeys = Object.keys(apiData.keyEntities).filter(key => 
      key.toLowerCase().includes('bmp') || 
      key.toLowerCase().includes('practice') ||
      key.toLowerCase().includes('measure')
    );
    
    result.summary.totalBMPs = bmpKeys.length;
    
    // Create BMP entries
    result.bmps = bmpKeys.map((key, index) => ({
      id: `bmp-${index}`,
      name: key,
      description: "",
      category: "Unknown",
      effectiveness: apiData.keyEntities[key] || 50 // Use entity value or default
    }));
  }
  
  // Try to extract completion rate if available
  if (apiData.metrics && apiData.metrics.completionRate) {
    result.summary.completionRate = apiData.metrics.completionRate;
  } else {
    // Default to 50% if not available
    result.summary.completionRate = 50;
  }
  
  // Extract monitoring metrics if available
  if (apiData.metrics) {
    const metricEntries = Object.entries(apiData.metrics);
    result.monitoring = metricEntries.map(([name, value], index) => ({
      id: `metric-${index}`,
      name,
      value: typeof value === 'number' ? value : 0,
      unit: typeof value === 'string' && value.includes('%') ? '%' : ''
    }));
  }
  
  return result;
}