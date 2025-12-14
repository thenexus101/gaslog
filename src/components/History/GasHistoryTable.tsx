import { useMemo, useState } from 'react';
import { GasEntry } from '../../types/gasEntry';
import { formatDateTime } from '../../utils/dateUtils';

interface GasHistoryTableProps {
  entries: GasEntry[];
  vehicles: { id: string; name: string }[];
}

type SortField = 'date_gas_added' | 'total_cost' | 'price_per_gallon' | 'gallons';
type SortDirection = 'asc' | 'desc';

export function GasHistoryTable({ entries, vehicles }: GasHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('date_gas_added');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date_gas_added') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [entries, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    };

  const getVehicleName = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.name || 'Unknown';
  };

  const formatFuelType = (fuelType: string) => {
    // Convert fuel type codes to readable format
    const fuelMap: Record<string, string> = {
      'regular-87': 'Regular (87)',
      'mid-grade-89': 'Mid-Grade (89)',
      'premium-91': 'Premium (91)',
      'premium-93': 'Premium (93)',
      'diesel': 'Diesel',
      'E85': 'E85',
      'E15': 'E15',
      'E10': 'E10',
    };
    return fuelMap[fuelType] || fuelType;
  };

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-500">No gas entries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table View */}
      <table className="hidden md:table w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-3 font-semibold text-gray-700">
              <button
                onClick={() => handleSort('date_gas_added')}
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <span>Date</span>
                {sortField === 'date_gas_added' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left p-3 font-semibold text-gray-700">Vehicle</th>
            <th className="text-left p-3 font-semibold text-gray-700">Station</th>
            <th className="text-left p-3 font-semibold text-gray-700">City</th>
            <th className="text-left p-3 font-semibold text-gray-700">Fuel</th>
            <th className="text-right p-3 font-semibold text-gray-700">
              <button
                onClick={() => handleSort('price_per_gallon')}
                className="flex items-center space-x-1 hover:text-blue-600 ml-auto"
              >
                <span>Price/Gal</span>
                {sortField === 'price_per_gallon' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-right p-3 font-semibold text-gray-700">Gallons</th>
            <th className="text-right p-3 font-semibold text-gray-700">
              <button
                onClick={() => handleSort('total_cost')}
                className="flex items-center space-x-1 hover:text-blue-600 ml-auto"
              >
                <span>Total</span>
                {sortField === 'total_cost' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-right p-3 font-semibold text-gray-700">MPG</th>
            <th className="text-center p-3 font-semibold text-gray-700">Empty</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr key={entry.id} className="border-b hover:bg-gray-50">
              <td className="p-3 text-sm">{formatDateTime(entry.date_gas_added)}</td>
              <td className="p-3 text-sm">{getVehicleName(entry.vehicle_id)}</td>
              <td className="p-3 text-sm">{entry.gas_station}</td>
              <td className="p-3 text-sm">{entry.gas_station_city}</td>
              <td className="p-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {formatFuelType(entry.fuel_type)}
                </span>
              </td>
              <td className="p-3 text-sm text-right">${entry.price_per_gallon.toFixed(3)}</td>
              <td className="p-3 text-sm text-right">{entry.gallons.toFixed(2)}</td>
              <td className="p-3 text-sm text-right font-semibold">${entry.total_cost.toFixed(2)}</td>
              <td className="p-3 text-sm text-right">{entry.mpg_before.toFixed(1)}</td>
              <td className="p-3 text-center">
                {entry.added_from_empty ? (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">{entry.gas_station}</p>
                <p className="text-sm text-gray-500">{entry.gas_station_city}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {formatFuelType(entry.fuel_type)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{formatDateTime(entry.date_gas_added)}</p>
              </div>
              <div>
                <p className="text-gray-500">Vehicle</p>
                <p className="font-medium">{getVehicleName(entry.vehicle_id)}</p>
              </div>
              <div>
                <p className="text-gray-500">Price/Gallon</p>
                <p className="font-medium">${entry.price_per_gallon.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-gray-500">Gallons</p>
                <p className="font-medium">{entry.gallons.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Cost</p>
                <p className="font-semibold text-lg">${entry.total_cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">MPG</p>
                <p className="font-medium">{entry.mpg_before.toFixed(1)}</p>
              </div>
            </div>
            
            {entry.added_from_empty && (
              <div className="mt-3 pt-3 border-t">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  Filled from empty
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
