import React from 'react';
import { format } from 'date-fns';
import { shadows } from '../styles/theme';

interface DateRangeSliderProps {
  dateRange: [Date, Date];
  onDateRangeChange: (range: [Date, Date]) => void;
}

const DateRangeSlider: React.FC<DateRangeSliderProps> = ({ dateRange, onDateRangeChange }) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateRangeChange([newDate, dateRange[1]]);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateRangeChange([dateRange[0], newDate]);
  };

  return (
    <div className={`bg-white rounded-lg p-4 ${shadows.card}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={format(dateRange[0], 'yyyy-MM-dd')}
            onChange={handleStartDateChange}
            max={format(dateRange[1], 'yyyy-MM-dd')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={format(dateRange[1], 'yyyy-MM-dd')}
            onChange={handleEndDateChange}
            min={format(dateRange[0], 'yyyy-MM-dd')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSlider; 