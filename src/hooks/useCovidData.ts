import { useState, useEffect } from 'react';
import { fetchCovidData, processData, ProcessedCovidData } from '../services/covidData';

export interface CovidData {
  date: Date;
  state: string;
  fips: string;
  cases: number;
  deaths: number;
}

export interface CovidDataHook {
  data: ProcessedCovidData[];
  loading: boolean;
  error: string | null;
  selectedState: string;
  setSelectedState: (state: string) => void;
  brushRange: [Date, Date] | null;
  setBrushRange: (range: [Date, Date] | null) => void;
  getStates: () => string[];
}

export const useCovidData = (): CovidDataHook => {
  const [data, setData] = useState<CovidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('all');
  const [brushRange, setBrushRange] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchCovidData();
        setData(fetchedData);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const processedData: ProcessedCovidData[] = processData(data, selectedState);

  const getStates = (): string[] => {
    return [...new Set(data.map(d => d.state))].sort();
  };

  return {
    data: processedData,
    loading,
    error,
    selectedState,
    setSelectedState,
    brushRange,
    setBrushRange,
    getStates
  };
}; 