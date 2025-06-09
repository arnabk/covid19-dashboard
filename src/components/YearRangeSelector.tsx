import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface YearRangeSelectorProps {
  years: number[];
  onRangeChange: (range: [number, number]) => void;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const YearRangeSelector: React.FC<YearRangeSelectorProps> = ({ years, onRangeChange, height, margin = { top: 20, right: 20, bottom: 20, left: 20 } }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [range, setRange] = useState<[number, number]>([years[0], years[years.length - 1]]);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced callback
  const debouncedOnRangeChange = (newRange: [number, number]) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      onRangeChange(newRange);
    }, 200);
  };

  // Set up the brush and SVG only when years, height, or margin change
  useEffect(() => {
    if (!svgRef.current || years.length === 0) return;
    d3.select(svgRef.current).selectAll('*').remove();
    const width = 60;
    const innerHeight = height - margin.top - margin.bottom;
    const yScale = d3.scaleLinear()
      .domain([years[0], years[years.length - 1]])
      .range([0, innerHeight]);

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw year ticks
    svg.selectAll('text.year-label')
      .data(years)
      .enter()
      .append('text')
      .attr('class', 'year-label')
      .attr('x', width / 2)
      .attr('y', d => yScale(d))
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#374151')
      .text(d => d);

    // Brush for range selection
    const brush = d3.brushY()
      .extent([[0, 0], [width, innerHeight]])
      .on('brush end', (event) => {
        if (!event.selection) return;
        const [y0, y1] = event.selection;
        const startYear = Math.round(yScale.invert(y0));
        const endYear = Math.round(yScale.invert(y1));
        const newRange: [number, number] = [Math.min(startYear, endYear), Math.max(startYear, endYear)];
        setRange(newRange);
        debouncedOnRangeChange(newRange);
      });

    svg.append('g')
      .attr('class', 'brush')
      .call(brush)
      .selectAll('rect')
      .attr('width', width);
  }, [years, height, margin]);

  // Keep the brush position in sync with range
  useEffect(() => {
    if (!svgRef.current) return;
    const width = 60;
    const marginTop = margin.top || 20;
    const marginBottom = margin.bottom || 20;
    const innerHeight = height - marginTop - marginBottom;
    const yScale = d3.scaleLinear()
      .domain([years[0], years[years.length - 1]])
      .range([0, innerHeight]);
    const svg = d3.select(svgRef.current).select('g');
    if (!svg.empty()) {
      const y0 = yScale(range[0]);
      const y1 = yScale(range[1]);
      svg.select<SVGGElement>('.brush').call((d3.brushY() as any).move, [y0, y1]);
    }
  }, [range, years, height, margin]);

  return <svg ref={svgRef}></svg>;
};

export default YearRangeSelector; 