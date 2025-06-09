import * as d3 from 'd3';

const allStateAbbrs = [
  "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"
];

export const stateColorScale = d3.scaleOrdinal<string, string>()
  .domain(allStateAbbrs)
  .range((d3.schemeTableau10 as string[])
    .concat(d3.schemeSet2 as string[], d3.schemeSet1 as string[], d3.schemePaired as string[])
    .slice(0, allStateAbbrs.length));

export function getStateColor(abbr: string): string {
  return stateColorScale(abbr) || '#ccc';
}

export { allStateAbbrs }; 