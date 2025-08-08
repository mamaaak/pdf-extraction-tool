import { ExtractedReport } from '@/types/dashboard';

/**
 * Generates mock data for testing the dashboard
 */
export function generateMockData(): ExtractedReport {
  return {
    summary: {
      totalGoals: 4,
      totalBMPs: 6,
      completionRate: 75,
    },
    goals: [
      {
        id: "goal-1",
        title: "Reduce Nitrogen Pollution",
        description: "Decrease nitrogen runoff by 30% within 5 years",
        priority: "High"
      },
      {
        id: "goal-2",
        title: "Increase Habitat Conservation",
        description: "Protect and restore 500 acres of riparian habitat",
        priority: "Medium"
      },
      {
        id: "goal-3",
        title: "Improve Water Quality",
        description: "Meet EPA standards for dissolved oxygen levels",
        priority: "High"
      },
      {
        id: "goal-4",
        title: "Enhance Public Awareness",
        description: "Increase community engagement in watershed protection",
        priority: "Medium"
      }
    ],
    bmps: [
      {
        id: "bmp-1",
        name: "Cover Crops",
        description: "Plant cover crops to reduce soil erosion and nutrient loss",
        category: "Agricultural",
        effectiveness: 75
      },
      {
        id: "bmp-2",
        name: "Riparian Buffers",
        description: "Establish vegetation zones along waterways",
        category: "Habitat",
        effectiveness: 85
      },
      {
        id: "bmp-3",
        name: "Stormwater Retention",
        description: "Construct basins to capture and treat stormwater runoff",
        category: "Urban",
        effectiveness: 70
      },
      {
        id: "bmp-4",
        name: "Nutrient Management",
        description: "Optimize fertilizer application timing and rates",
        category: "Agricultural",
        effectiveness: 65
      },
      {
        id: "bmp-5",
        name: "Stream Restoration",
        description: "Restore natural stream channels and floodplains",
        category: "Habitat",
        effectiveness: 80
      },
      {
        id: "bmp-6",
        name: "Conservation Tillage",
        description: "Implement reduced tillage practices to minimize soil disturbance",
        category: "Agricultural",
        effectiveness: 60
      }
    ],
    implementation: [
      {
        id: "impl-1",
        name: "Cover Crop Program",
        status: "In Progress",
        progress: 70
      },
      {
        id: "impl-2",
        name: "Stream Buffer Installation",
        status: "In Progress",
        progress: 50
      },
      {
        id: "impl-3",
        name: "Urban Runoff Mitigation",
        status: "Planned",
        progress: 20
      },
      {
        id: "impl-4",
        name: "Farm Nutrient Planning",
        status: "Complete",
        progress: 100
      }
    ],
    monitoring: [
      {
        id: "mon-1",
        name: "Nitrogen Levels",
        value: 8.2,
        unit: "mg/L"
      },
      {
        id: "mon-2",
        name: "Phosphorus Levels",
        value: 0.15,
        unit: "mg/L"
      },
      {
        id: "mon-3",
        name: "Dissolved Oxygen",
        value: 6.8,
        unit: "mg/L"
      },
      {
        id: "mon-4",
        name: "Turbidity",
        value: 12.5,
        unit: "NTU"
      }
    ],
    outreach: [
      {
        id: "out-1",
        name: "Farmer Workshops",
        reach: 120,
        type: "Educational"
      },
      {
        id: "out-2",
        name: "Community Cleanup Events",
        reach: 250,
        type: "Engagement"
      },
      {
        id: "out-3",
        name: "School Programs",
        reach: 850,
        type: "Educational"
      }
    ],
    geographicAreas: [
      {
        id: "area-1",
        name: "North Creek Watershed",
        size: 4500,
        unit: "acres"
      },
      {
        id: "area-2",
        name: "South Creek Watershed",
        size: 3200,
        unit: "acres"
      }
    ]
  };
}