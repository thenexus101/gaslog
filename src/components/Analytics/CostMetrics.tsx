import { useMemo } from 'react';
import { GasEntry } from '../../types/gasEntry';
import {
  calculateTotalSpending,
  calculateAverageCostPerFillUp,
  calculateAveragePricePerGallon,
} from '../../utils/calculations';
import { isInCurrentMonth, isInCurrentYear } from '../../utils/dateUtils';
import { parseISO, format } from 'date-fns';

interface CostMetricsProps {
  entries: GasEntry[];
}

export function CostMetrics({ entries }: CostMetricsProps) {
  const allTimeSpending = calculateTotalSpending(entries);
  const monthlySpending = calculateTotalSpending(
    entries.filter(e => isInCurrentMonth(e.date_gas_added))
  );
  const yearlySpending = calculateTotalSpending(
    entries.filter(e => isInCurrentYear(e.date_gas_added))
  );
  const avgCostPerFillUp = calculateAverageCostPerFillUp(entries);
  const avgPricePerGallon = calculateAveragePricePerGallon(entries);

  // Find earliest entry date
  const earliestDate = useMemo(() => {
    if (entries.length === 0) return null;
    const dates = entries.map(e => parseISO(e.date_gas_added));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    return format(earliest, 'MMM yyyy');
  }, [entries]);

  const metrics = [
    {
      title: 'All Time Spending',
      value: `$${allTimeSpending.toFixed(2)}`,
      subtitle: earliestDate ? `Since ${earliestDate}` : '',
      icon: '💰',
      gradient: 'from-blue-500 to-blue-600',
      tooltip: 'Total amount spent on gas across all time periods',
    },
    {
      title: 'This Month',
      value: `$${monthlySpending.toFixed(2)}`,
      icon: '📅',
      gradient: 'from-green-500 to-green-600',
      tooltip: 'Total amount spent on gas in the current month',
    },
    {
      title: 'This Year',
      value: `$${yearlySpending.toFixed(2)}`,
      icon: '📊',
      gradient: 'from-orange-500 to-orange-600',
      tooltip: 'Total amount spent on gas in the current year',
    },
    {
      title: 'Avg Cost per Fill-up',
      value: `$${avgCostPerFillUp.toFixed(2)}`,
      icon: '⛽',
      gradient: 'from-purple-500 to-purple-600',
      tooltip: 'Average amount spent per gas fill-up across all entries',
    },
    {
      title: 'Avg Price per Gallon',
      value: `$${avgPricePerGallon.toFixed(3)}`,
      icon: '💵',
      gradient: 'from-red-500 to-red-600',
      tooltip: 'Average price paid per gallon of fuel across all entries',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="card-hover relative group">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
              {metric.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
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
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl w-56 whitespace-normal">
                      {metric.tooltip}
                      <div className="absolute top-full left-4 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
              {metric.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{metric.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
