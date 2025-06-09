import { CovidData } from '../hooks/useCovidData';
import { loadStateDailyData } from '../utils/dataLoader';

export interface ProcessedCovidData extends CovidData {
  dailyCases: number;
  dailyDeaths: number;
  rollingAverage: number;
  growthRate: number;
}

export const fetchCovidData = async (): Promise<CovidData[]> => {
  return loadStateDailyData();
};

export const processData = (
  data: CovidData[],
  selectedState: string,
  dateRange?: [Date, Date]
): ProcessedCovidData[] => {
  if (!data.length) return [];

  let filtered = [...data];
  
  // Filter by state
  if (selectedState !== 'all') {
    filtered = filtered.filter(d => d.state === selectedState);
  }

  // Filter by date range if provided
  if (dateRange) {
    filtered = filtered.filter(d => 
      d.date >= dateRange[0] && d.date <= dateRange[1]
    );
  }

  // Sort by date
  filtered.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate daily changes and rolling averages
  return filtered.map((d, i) => {
    const prevDay = i > 0 ? filtered[i - 1] : null;
    const dailyCases = prevDay ? d.cases - prevDay.cases : 0;
    const dailyDeaths = prevDay ? d.deaths - prevDay.deaths : 0;

    // Calculate 7-day rolling average
    const rollingWindow = filtered.slice(Math.max(0, i - 6), i + 1);
    const rollingAverage = rollingWindow.length > 0
      ? rollingWindow.reduce((sum, day) => {
          const prevDayInWindow = rollingWindow.indexOf(day) > 0 ? rollingWindow[rollingWindow.indexOf(day) - 1] : null;
          return sum + (day.cases - (prevDayInWindow?.cases ?? 0));
        }, 0) / rollingWindow.length
      : 0;

    // Calculate growth rate
    const growthRate = prevDay && prevDay.cases > 0
      ? ((dailyCases / prevDay.cases) * 100)
      : 0;

    return {
      ...d,
      dailyCases,
      dailyDeaths,
      rollingAverage: Math.round(rollingAverage),
      growthRate: Number(growthRate.toFixed(2))
    };
  });
}; 