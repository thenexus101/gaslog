import React from 'react';

interface GasHistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate: Date | null;
  onStartDateChange: (value: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (value: Date | null) => void;
}

export function GasHistoryFilters({
  searchTerm,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: GasHistoryFiltersProps) {
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStartDateChange(e.target.value ? new Date(e.target.value) : null);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEndDateChange(e.target.value ? new Date(e.target.value) : null);
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by station, city..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
