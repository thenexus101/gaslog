import { useState, useMemo } from 'react';
import { CostMetrics } from '../components/Analytics/CostMetrics';
import { EfficiencyMetrics } from '../components/Analytics/EfficiencyMetrics';
import { UsageMetrics } from '../components/Analytics/UsageMetrics';
import { TrendCharts } from '../components/Analytics/TrendCharts';
import { useGasData } from '../hooks/useGasData';

export function AnalyticsPage() {
  const { entries, vehicles, loading } = useGasData();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');

  // Filter entries by selected vehicle
  const filteredEntries = useMemo(() => {
    if (selectedVehicleId === 'all') {
      return entries;
    }
    return entries.filter(entry => entry.vehicle_id === selectedVehicleId);
  }, [entries, selectedVehicleId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Analytics</h1>
        {vehicles.length > 1 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by Vehicle:</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedVehicleId !== 'all' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing analytics for: <strong>{vehicles.find(v => v.id === selectedVehicleId)?.name}</strong>
          </p>
        </div>
      )}

      <div className="mt-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Cost Metrics</h2>
        <CostMetrics entries={filteredEntries} />
      </div>

      <div className="mt-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Efficiency Metrics</h2>
        <EfficiencyMetrics entries={filteredEntries} vehicles={vehicles} />
      </div>

      <div className="mt-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Usage Metrics</h2>
        <UsageMetrics entries={filteredEntries} />
      </div>

      <div className="mt-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Trends & Comparisons</h2>
        <TrendCharts entries={filteredEntries} />
      </div>
    </div>
  );
}
