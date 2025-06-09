// @ts-ignore
declare function require(path: string): any;
import { geoCentroid } from 'd3-geo';
import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, GeographyFeature } from 'react-simple-maps';
import { feature } from 'topojson-client';
import { useDashboard } from '../context/DashboardContext';
import usMapData from '../data/states-10m.json';

// Map state FIPS to abbreviations
const stateAbbr: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
  '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL',
  '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE',
  '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
  '55': 'WI', '56': 'WY'
};

const USMap: React.FC = () => {
  const { selectedState, setSelectedState, loading } = useDashboard();
  const [tooltip, setTooltip] = useState<string | null>(null);

  // Extract GeoJSON features from TopoJSON
  const states = useMemo(() => {
    const features = feature(usMapData as unknown as Topology, usMapData.objects.states).features as GeographyFeature[];
    return features.map((feature, index) => ({
      ...feature,
      rsmKey: `state-${index}`,
    }));
  }, []);

  if (!states || states.length === 0) {
    return <div className="text-red-500">No map data found. Check TopoJSON import and extraction.</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative min-h-[400px] flex items-center justify-center">
      {loading ? (
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {tooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 px-3 py-1 bg-black text-white text-xs rounded shadow pointer-events-none">
              {tooltip}
            </div>
          )}
          <ComposableMap projection="geoAlbersUsa" width={600} height={380}>
            <Geographies geography={{ type: 'FeatureCollection', features: states }}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name;
                  const stateId = geo.id as string;
                  // @ts-ignore - geoCentroid works with the actual data structure despite type mismatch
                  const centroid = geoCentroid(geo);
                  const isSelected = selectedState === stateName;
                  return (
                    <g key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        onClick={() => setSelectedState(stateName)}
                        onMouseEnter={() => setTooltip(stateName)}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: {
                            fill: isSelected ? '#2563eb' : '#e0e7ef',
                            outline: 'none',
                            stroke: '#fff',
                            cursor: 'pointer',
                          },
                          hover: {
                            fill: '#60a5fa',
                            outline: 'none',
                            cursor: 'pointer',
                          },
                          pressed: {
                            fill: '#1d4ed8',
                            outline: 'none',
                            cursor: 'pointer',
                          },
                        }}
                      />
                      {/* State abbreviation label */}
                      {centroid && stateId && stateAbbr[stateId] && (
                        <text
                          x={centroid[0]}
                          y={centroid[1]}
                          textAnchor="middle"
                          alignmentBaseline="central"
                          fontSize={12}
                          fill={isSelected ? '#fff' : '#374151'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          pointerEvents="none"
                          style={{ textShadow: '0 1px 2px #fff, 0 -1px 2px #fff' }}
                        >
                          {stateAbbr[stateId]}
                        </text>
                      )}
                    </g>
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </>
      )}
    </div>
  );
};

export default USMap; 