import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

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
  labelKey?: string;
  selectedKey?: string;
  onSelect?: (key: string) => void;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
}

const defaultWidth = 420;
const defaultHeight = 420;

const D3BubbleChart: React.FC<D3BubbleChartProps> = ({
  data,
  xKey,
  yKey,
  colorKey,
  labelKey,
  selectedKey,
  onSelect,
  xLabel,
  yLabel,
  width = defaultWidth,
  height = defaultHeight,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => Number(d[xKey])) || 1])
      .range([0, innerWidth]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Number(d[yKey])) || 1])
      .range([innerHeight, 0]);

    // Color by colorKey (state or date)
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(data.map(d => String(d[colorKey])));

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    g.append('g')
      .call(d3.axisLeft(y));

    // Axis labels
    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', 16)
        .text(xLabel);
    }
    if (yLabel) {
      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', 16)
        .text(yLabel);
    }

    // Bubbles
    const bubble = g.selectAll<SVGGElement, DataPoint>('g.bubble')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', d => `translate(${x(Number(d[xKey]))},${y(Number(d[yKey]))})`)
      .style('cursor', onSelect ? 'pointer' : 'default')
      .on('click', (event, d) => {
        if (onSelect) onSelect(String(d[colorKey]));
      });

    bubble.append('circle')
      .attr('r', d => selectedKey && String(d[colorKey]) === selectedKey ? 22 : 16)
      .attr('fill', d => color(String(d[colorKey])) as string)
      .attr('stroke', d => selectedKey && String(d[colorKey]) === selectedKey ? '#111' : 'white')
      .attr('stroke-width', d => selectedKey && String(d[colorKey]) === selectedKey ? 3 : 1);

    bubble.append('text')
      .text(d => labelKey ? String(d[labelKey]) : String(d[colorKey]))
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('font-size', d => selectedKey && String(d[colorKey]) === selectedKey ? 15 : 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');
  }, [data, xKey, yKey, colorKey, labelKey, selectedKey, onSelect, xLabel, yLabel, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
};

export default D3BubbleChart; 