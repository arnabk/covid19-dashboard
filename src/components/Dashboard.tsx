import { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { loadNationalYearlyData, loadStateYearlyData, NationalYearlyData, StateYearlyData } from '../utils/dataLoader';
import D3BubbleChart from './D3BubbleChart';
import D3Map from './D3Map';
import { allStateAbbrs } from '../utils/colors';

// Map state names to abbreviations for bubble labels
const stateAbbr: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA',
  Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT',
  Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  'District of Columbia': 'DC'
};

interface DataPoint {
  [key: string]: string | number | Date | undefined;
  date?: Date;
  state?: string;
  fips?: string;
  cases?: number;
  deaths?: number;
  year?: number;
  abbr?: string;
  color?: number;
}

const Dashboard = () => {
  const { loading, error } = useDashboard();
  const [selectedState] = useState<string>('all');
  const [yearlyData, setYearlyData] = useState<StateYearlyData[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [nationalYearlyData, setNationalYearlyData] = useState<NationalYearlyData[]>([]);
  const [hoveredState, setHoveredState] = useState<string>('');

  useEffect(() => {
    loadStateYearlyData().then(data => {
      setYearlyData(data.map(d => ({ ...d, abbr: stateAbbr[d.state] || d.state })));
      // Set default selected years to all available years
      const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
      setSelectedYears(years);
    });
    loadNationalYearlyData().then(setNationalYearlyData);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Filter yearly data by selected years
  const filteredYearlyData = selectedYears.length > 0
    ? yearlyData.filter(d => selectedYears.includes(d.year))
    : yearlyData;

  // Helper to prevent all years from being deselected
  const handleYearCheckbox = (year: number, checked: boolean) => {
    if (checked) {
      setSelectedYears(prev => [...prev, year]);
    } else {
      setSelectedYears(prev => prev.length > 1 ? prev.filter(y => y !== year) : prev);
    }
  };

  const handleHoveredState = (abbr: string | undefined) => {
    setHoveredState(abbr || '');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">COVID-19 Dashboard</h1>
        <div className="mb-8 flex flex-wrap items-end gap-x-4 gap-y-4">
          <D3Map selectedState={selectedState} hoveredState={hoveredState} setHoveredState={handleHoveredState} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-4">
            {/* Year checkboxes (move inside the card, above the chart title) */}
            {yearlyData.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <span className="font-semibold min-w-[110px]">Select Years:</span>
                {Array.from(new Set(yearlyData.map(d => d.year))).sort((a, b) => a - b).map(year => (
                  <label key={year} className="relative flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedYears.includes(year)}
                      onChange={e => handleYearCheckbox(year, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="w-6 h-6 flex items-center justify-center rounded-md border-2 border-gray-400 bg-white transition-all duration-150 peer-checked:bg-blue-600 peer-checked:border-blue-600 shadow-sm">
                      {/* Custom checkmark SVG, centered */}
                      {selectedYears.includes(year) && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="ml-1 text-base font-medium text-gray-800 peer-checked:text-blue-700 transition-colors">{year}</span>
                  </label>
                ))}
              </div>
            )}
            <h2 className="text-lg font-semibold mb-2">Yearly Cases vs Deaths (by State)</h2>
            <D3BubbleChart
              data={filteredYearlyData as DataPoint[]}
              xKey="cases"
              yKey="deaths"
              colorKey="abbr"
              labelKey="abbr"
              selectedKey={allStateAbbrs.includes(selectedState) ? selectedState : undefined}
              hoveredState={hoveredState}
              setHoveredState={handleHoveredState}
              xLabel="Cases (Yearly Aggregate)"
              yLabel="Deaths (Yearly Aggregate)"
              height={400}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Cumulative Cases vs Deaths</h2>
            <D3BubbleChart
              data={nationalYearlyData.map(d => ({ ...d, color: d.year })) as DataPoint[]}
              xKey="cases"
              yKey="deaths"
              colorKey="color"
              labelKey="year"
              selectedKey={undefined}
              xLabel="Cumulative Cases"
              yLabel="Cumulative Deaths"
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 