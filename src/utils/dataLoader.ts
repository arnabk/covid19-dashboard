import * as d3 from 'd3';

export interface StateDailyData {
  date: Date;
  state: string;
  fips: string;
  cases: number;
  deaths: number;
}

export interface NationalCumulativeData {
  date: Date;
  cases: number;
  deaths: number;
}

export interface StateYearlyData {
  year: number;
  state: string;
  fips: string;
  cases: number;
  deaths: number;
}

export interface NationalYearlyData {
  year: number;
  cases: number;
  deaths: number;
}

const NYT_DATA_BASE_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master';

let stateDailyDataCache: StateDailyData[] | null = null;
let nationalCumulativeDataCache: NationalCumulativeData[] | null = null;

export async function loadStateDailyData(): Promise<StateDailyData[]> {
  if (stateDailyDataCache) return stateDailyDataCache;
  const rawData = await d3.csv(`${NYT_DATA_BASE_URL}/us-states.csv`);
  const data: StateDailyData[] = rawData.map(d => ({
    date: new Date(d.date as string),
    state: d.state as string,
    fips: d.fips as string,
    cases: Number(d.cases as string),
    deaths: Number(d.deaths as string),
  }));
  stateDailyDataCache = data;
  return data;
}

export async function loadNationalCumulativeData(): Promise<NationalCumulativeData[]> {
  if (nationalCumulativeDataCache) return nationalCumulativeDataCache;
  const rawData = await d3.csv(`${NYT_DATA_BASE_URL}/us.csv`);
  const data: NationalCumulativeData[] = rawData.map(d => ({
    date: new Date(d.date as string),
    cases: Number(d.cases as string),
    deaths: Number(d.deaths as string),
  }));
  nationalCumulativeDataCache = data;
  return data;
}

export async function getLatestStateData(): Promise<StateDailyData[]> {
  const all = await loadStateDailyData();
  const latestDate = d3.max(all, d => d.date);
  return all.filter(d => d.date.getTime() === latestDate?.getTime());
}

export async function loadStateYearlyData(): Promise<StateYearlyData[]> {
  const daily = await loadStateDailyData();
  // Map: year-state -> latest row for that year/state
  const latestMap = new Map<string, StateDailyData>();

  daily.forEach(d => {
    const year = d.date.getFullYear();
    const key = `${year}-${d.state}`;
    if (!latestMap.has(key) || d.date > (latestMap.get(key)!.date)) {
      latestMap.set(key, d);
    }
  });

  return Array.from(latestMap.values()).map(d => ({
    year: d.date.getFullYear(),
    state: d.state,
    fips: d.fips,
    cases: d.cases,
    deaths: d.deaths,
  }));
}

export async function loadNationalYearlyData(): Promise<NationalYearlyData[]> {
  const daily = await loadNationalCumulativeData();
  const latestMap = new Map<number, NationalCumulativeData>();
  daily.forEach(d => {
    const year = d.date.getFullYear();
    if (!latestMap.has(year) || d.date > (latestMap.get(year)!.date)) {
      latestMap.set(year, d);
    }
  });
  return Array.from(latestMap.entries()).map(([year, d]) => ({
    year,
    cases: d.cases,
    deaths: d.deaths,
  }));
} 