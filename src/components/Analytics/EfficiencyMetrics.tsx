import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { GasEntry, Vehicle } from '../../types/gasEntry';
import {
  calculateAverageMPG,
  calculateEfficiencyScore,
  getActualMPG,
} from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';

interface EfficiencyMetricsProps {
  entries: GasEntry[];
  vehicles: Vehicle[];
}

export function EfficiencyMetrics({ entries, vehicles }: EfficiencyMetricsProps) {
  const avgMPG = calculateAverageMPG(entries);

  // Calculate actual MPG and efficiency scores
  const efficiencyData = useMemo(() => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date_gas_added).getTime() - new Date(b.date_gas_added).getTime()
    );

    return sortedEntries
      .map((entry, index) => {
        if (index === 0) return null;
        const previousEntry = sortedEntries[index - 1];
        const actualMPG = getActualMPG(entry, previousEntry);
        if (!actualMPG) return null;

        const vehicle = vehicles.find(v => v.id === entry.vehicle_id);
        const efficiencyScore = vehicle?.expected_mpg
          ? calculateEfficiencyScore(actualMPG, vehicle.expected_mpg)
          : null;

        return {
          date: formatDate(entry.date_gas_added),
          actualMPG: parseFloat(actualMPG.toFixed(1)),
          efficiencyScore: efficiencyScore ? parseFloat(efficiencyScore.toFixed(1)) : null,
          expectedMPG: vehicle?.expected_mpg || null,
        };
      })
      .filter(Boolean) as Array<{
        date: string;
        actualMPG: number;
        efficiencyScore: number | null;
        expectedMPG: number | null;
      }>;
  }, [entries, vehicles]);

  const avgEfficiencyScore = useMemo(() => {
    const scores = efficiencyData
      .map(d => d.efficiencyScore)
      .filter((s): s is number => s !== null);
    if (scores.length === 0) return null;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [efficiencyData]);

  const hasExpectedMPG = vehicles.some(v => v.expected_mpg);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card relative group">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <span>Average MPG</span>
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
                    Average miles per gallon across all entries. Calculated from the mpg_before values.
                    <div className="absolute top-full left-4 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
            </div>
          </h3>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl shadow-md">
              🚗
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900">{avgMPG.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Miles per Gallon</p>
            </div>
          </div>
        </div>

        {hasExpectedMPG && avgEfficiencyScore !== null && (
          <div className="card relative group">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <span>Driving Efficiency Score</span>
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
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl w-64 whitespace-normal">
                    Compares your actual MPG to the expected MPG for your vehicle. 100% means you're meeting expectations, above 100% is better than expected.
                    <div className="absolute top-full left-4 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 bg-gradient-to-br ${
                avgEfficiencyScore >= 90 
                  ? 'from-green-500 to-green-600' 
                  : avgEfficiencyScore >= 80
                  ? 'from-yellow-500 to-yellow-600'
                  : 'from-red-500 to-red-600'
              } rounded-xl flex items-center justify-center text-4xl shadow-md`}>
                {avgEfficiencyScore >= 90 ? '✅' : avgEfficiencyScore >= 80 ? '⚠️' : '❌'}
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900">{avgEfficiencyScore.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">
                  {avgEfficiencyScore >= 90
                    ? 'Excellent efficiency'
                    : avgEfficiencyScore >= 80
                    ? 'Good efficiency'
                    : 'Below expected efficiency'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {!hasExpectedMPG && (
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-blue-800">
              Set expected MPG for your vehicles to see driving efficiency scores.
            </p>
          </div>
        </div>
      )}

      {efficiencyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">MPG Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actualMPG"
                  stroke="#1976d2"
                  name="Actual MPG"
                />
                {hasExpectedMPG && (
                  <Line
                    type="monotone"
                    dataKey="expectedMPG"
                    stroke="#2e7d32"
                    strokeDasharray="5 5"
                    name="Expected MPG"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
        </div>
      )}

      {hasExpectedMPG && efficiencyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Efficiency Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 120]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={90} stroke="#d32f2f" strokeDasharray="5 5" label="90% Threshold" />
                <Line
                  type="monotone"
                  dataKey="efficiencyScore"
                  stroke="#9c27b0"
                  name="Efficiency Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

