import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { GasEntry } from '../../types/gasEntry';
import { format, parseISO, startOfMonth, subMonths, startOfYear, isAfter, isBefore } from 'date-fns';

interface TrendChartsProps {
  entries: GasEntry[];
}

type TimePeriod = '1m' | '3m' | '6m' | 'ytd' | 'year' | 'all';

export function TrendCharts({ entries }: TrendChartsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  // Filter entries based on selected time period
  const filteredEntries = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date | null = null;

    switch (timePeriod) {
      case '1m':
        cutoffDate = subMonths(now, 1);
        break;
      case '3m':
        cutoffDate = subMonths(now, 3);
        break;
      case '6m':
        cutoffDate = subMonths(now, 6);
        break;
      case 'ytd':
        cutoffDate = startOfYear(now);
        break;
      case 'year':
        cutoffDate = subMonths(now, 12);
        break;
      case 'all':
      default:
        return entries;
    }

    return entries.filter(entry => {
      const entryDate = parseISO(entry.date_gas_added);
      return isAfter(entryDate, cutoffDate!) || entryDate.getTime() === cutoffDate!.getTime();
    });
  }, [entries, timePeriod]);

  // Price per gallon over time
  const priceOverTime = useMemo(() => {
    const sortedEntries = [...filteredEntries].sort(
      (a, b) => new Date(a.date_gas_added).getTime() - new Date(b.date_gas_added).getTime()
    );

    return sortedEntries.map(entry => {
      const entryDate = parseISO(entry.date_gas_added);
      return {
        date: format(entryDate, 'MMM dd, yyyy'),
        dateShort: format(entryDate, 'MMM dd'),
        price: parseFloat(entry.price_per_gallon.toFixed(3)),
        cost: parseFloat(entry.total_cost.toFixed(2)),
        gallons: parseFloat(entry.gallons.toFixed(2)),
      };
    });
  }, [filteredEntries]);

  // Spending by month
  const spendingByMonth = useMemo(() => {
    const monthlyData: Record<string, number> = {};

    filteredEntries.forEach(entry => {
      const monthKey = format(startOfMonth(parseISO(entry.date_gas_added)), 'MMM yyyy');
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + entry.total_cost;
    });

    return Object.entries(monthlyData)
      .map(([month, total]) => ({
        month,
        total: parseFloat(total.toFixed(2)),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredEntries]);

  // Average price by gas station
  const priceByStation = useMemo(() => {
    const stationData: Record<string, { total: number; count: number }> = {};

    filteredEntries.forEach(entry => {
      const key = `${entry.gas_station} - ${entry.gas_station_city}`;
      if (!stationData[key]) {
        stationData[key] = { total: 0, count: 0 };
      }
      stationData[key].total += entry.price_per_gallon;
      stationData[key].count += 1;
    });

    return Object.entries(stationData)
      .map(([station, data]) => ({
        station,
        avgPrice: parseFloat((data.total / data.count).toFixed(3)),
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 10); // Top 10 stations
  }, [filteredEntries]);

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'year', label: '1 Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Time Period:</span>
        {timePeriods.map((period) => (
          <button
            key={period.value}
            onClick={() => setTimePeriod(period.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timePeriod === period.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Price per Gallon Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              name="Price per Gallon ($)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Total Cost Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string, props: any) => {
                if (name === 'Total Cost ($)') {
                  return [
                    <div key="tooltip">
                      <div className="font-semibold">${value}</div>
                      <div className="text-xs text-gray-400 mt-1">Gallons: {props.payload.gallons}</div>
                    </div>,
                    name
                  ];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#10b981"
              name="Total Cost ($)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Spending by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spendingByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8b5cf6" name="Monthly Spending ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {priceByStation.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Average Price by Gas Station</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceByStation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="station" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgPrice" fill="#ef4444" name="Avg Price per Gallon ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
