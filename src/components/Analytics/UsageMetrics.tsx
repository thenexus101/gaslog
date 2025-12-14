import React from 'react';
import { GasEntry } from '../../types/gasEntry';
import {
  calculateAverageGallonsPerFillUp,
  calculateEmptyTankFrequency,
} from '../../utils/calculations';

interface UsageMetricsProps {
  entries: GasEntry[];
}

export function UsageMetrics({ entries }: UsageMetricsProps) {
  const totalFillUps = entries.length;
  const avgGallonsPerFillUp = calculateAverageGallonsPerFillUp(entries);
  const emptyTankFrequency = calculateEmptyTankFrequency(entries);

  // Calculate average distance between fill-ups
  const avgDistanceBetweenFillUps = React.useMemo(() => {
    if (entries.length < 2) return 0;
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date_gas_added).getTime() - new Date(b.date_gas_added).getTime()
    );

    let totalDistance = 0;
    let count = 0;
    for (let i = 1; i < sortedEntries.length; i++) {
      const distance = sortedEntries[i].mileage - sortedEntries[i - 1].mileage;
      if (distance > 0) {
        totalDistance += distance;
        count++;
      }
    }

    return count > 0 ? totalDistance / count : 0;
  }, [entries]);

  const metrics = [
    {
      title: 'Total Fill-ups',
      value: totalFillUps.toString(),
      icon: '⛽',
      gradient: 'from-blue-500 to-blue-600',
      tooltip: 'Total number of gas fill-ups recorded',
    },
    {
      title: 'Avg Gallons per Fill-up',
      value: `${avgGallonsPerFillUp.toFixed(2)} gal`,
      icon: '🛢️',
      gradient: 'from-green-500 to-green-600',
      tooltip: 'Average amount of fuel purchased per fill-up',
    },
    {
      title: 'Avg Distance Between Fill-ups',
      value: `${avgDistanceBetweenFillUps.toFixed(0)} miles`,
      icon: '🛣️',
      gradient: 'from-orange-500 to-orange-600',
      tooltip: 'Average miles driven between gas fill-ups',
    },
    {
      title: 'Empty Tank Frequency',
      value: `${emptyTankFrequency.toFixed(1)}%`,
      icon: '⚠️',
      gradient: emptyTankFrequency > 50 ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600',
      tooltip: 'Percentage of fill-ups where the tank was nearly empty (DTE < 35 miles)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="card-hover text-center relative group">
          <div className={`w-16 h-16 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-md`}>
            {metric.icon}
          </div>
          <div className="flex items-center justify-center space-x-1 mb-1">
            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            <div className="relative">
              <svg
                className="h-4 w-4 text-gray-400 cursor-help"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl w-56 whitespace-normal">
                  {metric.tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
        </div>
      ))}
    </div>
  );
}
