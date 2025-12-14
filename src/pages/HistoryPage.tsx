import React, { useState, useMemo } from 'react';
import { GasHistoryTable } from '../components/History/GasHistoryTable';
import { GasHistoryFilters } from '../components/History/GasHistoryFilters';
import { CSVImportModal } from '../components/Import/CSVImportModal';
import { useGasData } from '../hooks/useGasData';
import { parseISO, isAfter, isBefore } from 'date-fns';

export function HistoryPage() {
  const { entries, vehicles, loading, refreshEntries } = useGasData();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          entry.gas_station.toLowerCase().includes(searchLower) ||
          entry.gas_station_city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date filters
      const entryDate = parseISO(entry.date_gas_added);
      if (startDate && isBefore(entryDate, startDate)) return false;
      if (endDate && isAfter(entryDate, endDate)) return false;

      return true;
    });
  }, [entries, searchTerm, startDate, endDate]);

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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4 md:mb-0">
          Gas History
        </h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="btn-primary"
        >
          📥 Import from CSV
        </button>
      </div>
      <div className="card">
        <div className="mb-6">
          <GasHistoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          />
        </div>
        <GasHistoryTable
          entries={filteredEntries}
          vehicles={vehicles.map(v => ({ id: v.id, name: v.name }))}
        />
      </div>

      {showImportModal && (
        <CSVImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={async (count) => {
            // Refresh is handled automatically by the context
          }}
        />
      )}
    </div>
  );
}
