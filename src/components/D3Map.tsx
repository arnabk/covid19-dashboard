import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { getStateColor } from '../utils/colors';
// @ts-ignore
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

const defaultWidth = 600;
const defaultHeight = 380;
const largeWidth = 900;
const largeHeight = 570;

interface D3MapProps {
  selectedState?: string;
  hoveredState?: string;
  setHoveredState?: (abbr: string | undefined) => void;
}

const D3Map: React.FC<D3MapProps> = ({ selectedState, hoveredState, setHoveredState }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });

  // Responsive resize observer
  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth >= 1024) {
        setDimensions({ width: largeWidth, height: largeHeight });
      } else {
        setDimensions({ width: defaultWidth, height: defaultHeight });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Projection and path
    const projection = d3.geoAlbersUsa().fitSize([width, height], { type: 'Sphere' });
    const path = d3.geoPath().projection(projection);

    // Extract GeoJSON features
    const states = feature(usMapData as unknown as Topology, usMapData.objects.states).features as GeoJSON.Feature[];

    // Add drop shadow filter for 3D effect
    svg.append('defs')
      .append('filter')
      .attr('id', 'drop-shadow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 5)
      .attr('flood-color', '#333')
      .attr('flood-opacity', 0.85);

    // Draw states
    svg.append('g')
      .selectAll<SVGPathElement, GeoJSON.Feature>('path')
      .data(states)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', d => {
        const abbr = stateAbbr[d.id as string] || '';
        return getStateColor(abbr);
      })
      .attr('stroke', 'none')
      .attr('cursor', 'default')
      .attr('opacity', d => {
        const abbr = stateAbbr[d.id as string] || '';
        if (hoveredState) {
          return abbr === hoveredState ? 1 : 0.2;
        }
        return 1;
      })
      .attr('filter', d => {
        const abbr = stateAbbr[d.id as string] || '';
        return hoveredState && abbr === hoveredState ? 'url(#drop-shadow)' : null;
      })
      .on('mouseenter', function (this: SVGPathElement, event: MouseEvent, d: GeoJSON.Feature) {
        // Move hovered state to top and apply glow immediately
        if (this.parentNode) this.parentNode.appendChild(this);
        d3.select(this)
          .attr('filter', 'url(#drop-shadow)');
        const abbr = stateAbbr[d.id as string] || '';
        if (setHoveredState) setHoveredState(abbr);
        const tooltip = svg.select('.d3map-tooltip');
        tooltip
          .style('display', 'block')
          .text(d.properties && (d.properties as any).name)
          .attr('x', event.offsetX)
          .attr('y', event.offsetY - 10);
      })
      .on('mousemove', function (this: SVGPathElement, event: MouseEvent, d: GeoJSON.Feature) {
        // Just update tooltip position
        const tooltip = svg.select('.d3map-tooltip');
        tooltip
          .style('display', 'block')
          .text(d.properties && (d.properties as any).name)
          .attr('x', event.offsetX)
          .attr('y', event.offsetY - 10);
      })
      .on('mouseleave', function (this: SVGPathElement, _event: MouseEvent, d: GeoJSON.Feature) {
        d3.select(this)
          .attr('filter', null);
        const abbr = stateAbbr[d.id as string] || '';
        d3.select(this).attr('fill', getStateColor(abbr));
        if (setHoveredState) setHoveredState(undefined);
        svg.select('.d3map-tooltip').style('display', 'none');
      });

    // Draw state abbreviations
    svg.append('g')
      .selectAll<SVGTextElement, GeoJSON.Feature>('text')
      .data(states)
      .enter()
      .append('text')
      .attr('x', (d: GeoJSON.Feature) => path.centroid(d)[0])
      .attr('y', (d: GeoJSON.Feature) => path.centroid(d)[1])
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('font-size', 12)
      .attr('fill', '#374151')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d: GeoJSON.Feature) => stateAbbr[d.id as string] || '');

    // Tooltip
    svg.append('text')
      .attr('class', 'd3map-tooltip')
      .attr('display', 'none')
      .attr('fill', '#111')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .style('display', 'none');
  }, [dimensions, selectedState, hoveredState, setHoveredState]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto relative min-h-[400px] flex items-center justify-center">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default D3Map; 