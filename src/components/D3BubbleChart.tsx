import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { stateColorScale, allStateAbbrs } from '../utils/colors';

interface DataPoint {
  [key: string]: string | number | Date | undefined;
  date?: Date;
  state?: string;
  fips?: string;
}

interface D3BubbleChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  colorKey: string;
  labelKey: string;
  selectedKey?: string;
  xLabel: string;
  yLabel: string;
  hoveredState?: string;
  setHoveredState?: (abbr: string | undefined) => void;
  height?: number;
}

const D3BubbleChart: React.FC<D3BubbleChartProps> = ({
  data,
  xKey,
  yKey,
  colorKey,
  labelKey,
  selectedKey,
  xLabel,
  yLabel,
  hoveredState,
  setHoveredState,
  height = 400
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add a filter for bubble glow
    svg.append('defs')
      .append('filter')
      .attr('id', 'bubble-glow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('stdDeviation', 5)
      .attr('flood-color', '#333')
      .attr('flood-opacity', 0.85);

    // Create scales
    const xMax = d3.max(data, d => Number(d[xKey])) || 0;
    const yMax = d3.max(data, d => Number(d[yKey])) || 0;
    const xMin = Math.min(0, d3.min(data, d => Number(d[xKey])) || 0);
    const yMin = Math.min(0, d3.min(data, d => Number(d[yKey])) || 0);
    // Add padding (5% of max)
    const xStart = xMin - 0.05 * xMax;
    const yStart = yMin - 0.05 * yMax;

    const xScale = d3.scaleLinear()
      .domain([xStart, xMax])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([yStart, yMax])
      .range([chartHeight, 0]);

    // Use the same fixed color scale as the map for states
    let colorScale: d3.ScaleOrdinal<string, string>;
    if (colorKey === 'abbr') {
      colorScale = stateColorScale;
    } else if (colorKey === 'state') {
      colorScale = d3.scaleOrdinal<string, string>()
        .domain(allStateAbbrs)
        .range(allStateAbbrs.map((_, i) => d3.interpolateRainbow(i / allStateAbbrs.length)));
    } else if (colorKey === 'color' && labelKey === 'year') {
      // Use a fixed color per year for cumulative cases
      const years = data.map(d => String(d[labelKey]));
      const fixedColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; // Fixed colors for years
      colorScale = d3.scaleOrdinal<string, string>()
        .domain(years)
        .range(fixedColors.slice(0, years.length));
    } else {
      colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    }

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('.2s')));
    // X axis label (below chart, but inside SVG)
    svg.append('text')
      .attr('x', margin.left + width / 2)
      .attr('y', chartHeight + margin.top + margin.bottom / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('fill', '#374151')
      .text(xLabel);

    svg.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')));
    // Y axis label (left of chart)
    svg.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -(margin.top + chartHeight / 2))
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('fill', '#374151')
      .text(yLabel);

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'fixed')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '100')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('min-width', '120px')
      .style('max-width', '240px');

    // Add bubbles with update/exit/enter pattern
    const bubbleSel = svg.selectAll<SVGCircleElement, DataPoint>('circle')
      .data(data, (d: DataPoint) => String(d[colorKey]));

    // Exit animation
    bubbleSel.exit()
      .transition()
      .duration(400)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    // Add labels to bubbles
    if (colorKey === 'color' && labelKey === 'year') {
      svg.selectAll('text.bubble-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bubble-label')
        .attr('x', d => xScale(Number(d[xKey])))
        .attr('y', d => yScale(Number(d[yKey])) + 20)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('font-size', 12)
        .attr('fill', '#111')
        .text(d => String(d[labelKey]));
    }

    // Enter + update
    bubbleSel.enter()
      .append('circle')
      .merge(bubbleSel as any)
      .attr('cx', d => xScale(Number(d[xKey])))
      .attr('cy', d => yScale(Number(d[yKey])))
      .attr('r', d => String(d[colorKey]) === selectedKey ? 12 : 8)
      .attr('fill', d => colorScale(String(d[colorKey])))
      .attr('opacity', d => {
        if (selectedKey) {
          return String(d[colorKey]) === selectedKey ? 1 : 0.15;
        }
        if (hoveredState) {
          return String(d[colorKey]) === hoveredState ? 1 : 0.15;
        }
        return 1;
      })
      .attr('stroke', d => String(d[colorKey]) === selectedKey ? '#111' : 'none')
      .attr('stroke-width', d => String(d[colorKey]) === selectedKey ? 3 : 0)
      .attr('filter', d => hoveredState && String(d[colorKey]) === hoveredState ? 'url(#bubble-glow)' : null)
      .style('cursor', 'default')
      .on('mouseover', function(event, d) {
        if (setHoveredState) setHoveredState(String(d[colorKey]));
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', String(d[colorKey]) === selectedKey ? 14 : 10);

        const excludedKeys = ['date', 'state', 'fips', xKey, yKey, colorKey, labelKey];
        const additionalInfo = Object.keys(d)
          .filter(key => !excludedKeys.includes(key))
          .map(key => `${key}: ${d[key]}`)
          .join('<br/>');

        tooltip
          .style('visibility', 'visible')
          .html(`
            ${xLabel}: ${Number(d[xKey]).toLocaleString()}<br/>
            ${yLabel}: ${Number(d[yKey]).toLocaleString()}<br/>
            ${additionalInfo}
          `)
          .style('left', `${event.clientX + 10}px`)
          .style('top', `${event.clientY - 10}px`);
      })
      .on('mouseout', function(event, d) {
        if (setHoveredState) setHoveredState(undefined);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', String(d[colorKey]) === selectedKey ? 12 : 8);
        tooltip.style('visibility', 'hidden');
      });

  }, [data, xKey, yKey, colorKey, labelKey, selectedKey, hoveredState, height, xLabel, yLabel, containerWidth, setHoveredState]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: height }} />
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          visibility: 'hidden',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          minWidth: 120,
          maxWidth: 240,
        }}
      />
    </div>
  );
};

export default D3BubbleChart; 