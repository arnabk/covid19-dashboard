import React, { createContext, useContext, ReactNode } from 'react';
import { useCovidData } from '../hooks/useCovidData';
import { ProcessedCovidData } from '../services/covidData';

export interface DashboardContextType {
  data: ProcessedCovidData[];
  loading: boolean;
  error: string | null;
  selectedState: string;
  setSelectedState: (state: string) => void;
  getStates: () => string[];
  brushRange: [Date, Date] | null;
  setBrushRange: (range: [Date, Date] | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dashboardData = useCovidData();

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
}; 