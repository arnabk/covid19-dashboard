import React, { useState } from 'react';
import styles from './VerticalDualRangeSlider.module.css';

interface VerticalDualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  height?: number;
}

const VerticalDualRangeSlider: React.FC<VerticalDualRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  height = 300,
}) => {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  // Update local state on drag
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(val);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(val);
  };

  // Fire onChange only on release
  const handleRelease = () => {
    onChange([localMin, localMax]);
  };

  // Calculate positions for the highlight
  const percent = (v: number) => ((v - min) / (max - min)) * 100;
  const minPercent = percent(localMin);
  const maxPercent = percent(localMax);

  return (
    <div className="relative flex flex-col items-center" style={{ height }}>
      {/* Track */}
      <div className="absolute left-1/2 -translate-x-1/2 w-2 bg-gray-700 rounded-full" style={{ height: '100%' }} />
      {/* Range highlight */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-2 bg-white rounded-full"
        style={{
          top: `${100 - maxPercent}%`,
          height: `${maxPercent - minPercent}%`,
        }}
      />
      {/* Min handle */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localMin}
        onChange={handleMinChange}
        onMouseUp={handleRelease}
        onTouchEnd={handleRelease}
        className={styles['slider-vertical']}
        style={{ height: '100%' }}
      />
      {/* Max handle */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localMax}
        onChange={handleMaxChange}
        onMouseUp={handleRelease}
        onTouchEnd={handleRelease}
        className={styles['slider-vertical']}
        style={{ height: '100%' }}
      />
      {/* Value tooltips */}
      <div className="absolute left-full ml-2" style={{ top: `${100 - maxPercent}%` }}>
        <span className="bg-gray-900 text-white text-xs rounded px-2 py-1">{localMax}</span>
      </div>
      <div className="absolute left-full ml-2" style={{ top: `${100 - minPercent}%` }}>
        <span className="bg-gray-900 text-white text-xs rounded px-2 py-1">{localMin}</span>
      </div>
    </div>
  );
};

export default VerticalDualRangeSlider; 