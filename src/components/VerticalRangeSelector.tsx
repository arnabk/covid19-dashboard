import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VerticalRangeSelectorProps {
  data: { date: Date }[];
  onRangeChange: (range: [Date, Date] | null) => void;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const VerticalRangeSelector: React.FC<VerticalRangeSelectorProps> = ({
  data,
  onRangeChange,
  height,
  margin = { top: 20, right: 20, bottom: 20, left: 20 }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const brushRef = useRef<d3.BrushBehavior<unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 40;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scale
    const yScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerHeight]);

    // Add axis
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yScale).ticks(5))
      .selectAll('text')
      .style('font-size', '10px');

    // Create brush
    brushRef.current = d3.brushY()
      .extent([[0, 0], [width, innerHeight]])
      .on('end', (event) => {
        if (!event.selection) {
          onRangeChange(null);
          return;
        }

        const [y0, y1] = event.selection;
        const range: [Date, Date] = [
          yScale.invert(y0),
          yScale.invert(y1)
        ];
        onRangeChange(range);
      });

    // Add brush
    svg.append('g')
      .attr('class', 'brush')
      .call(brushRef.current)
      .selectAll('rect')
      .attr('width', width);

  }, [data, height, margin, onRangeChange]);

  return <svg ref={svgRef}></svg>;
};

export default VerticalRangeSelector; 