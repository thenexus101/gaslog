import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useGasData } from '../../hooks/useGasData';
import { GasEntry, FuelType, Vehicle } from '../../types/gasEntry';
import { VehicleCreationModal } from '../Vehicle/VehicleCreationModal';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
  preselectedVehicleId?: string; // Optional preselected vehicle
}

interface ParsedRow {
  [key: string]: string;
}

export function CSVImportModal({
  isOpen,
  onClose,
  onImportComplete,
  preselectedVehicleId,
}: CSVImportModalProps) {
  const { addEntry, vehicles, getDefaultVehicle, refreshEntries } = useGasData();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected vehicle
  React.useEffect(() => {
    if (preselectedVehicleId) {
      setSelectedVehicleId(preselectedVehicleId);
    } else if (vehicles.length > 0) {
      const defaultVehicle = getDefaultVehicle();
      setSelectedVehicleId(defaultVehicle?.id || vehicles[0].id);
    }
  }, [preselectedVehicleId, vehicles, getDefaultVehicle]);

  if (!isOpen) return null;

  // Field name mappings - handles various CSV column name variations
  const fieldMappings: Record<string, string[]> = {
    gas_station: ['gas station', 'station', 'gas_station', 'gasstation', 'location', 'where'],
    gas_station_city: ['city', 'gas_station_city', 'station city', 'location city', 'town'],
    fuel_type: ['fuel type', 'fuel_type', 'fuel', 'gas type', 'octane'],
    mpg_before: ['mpg before', 'mpg_before', 'mpg', 'miles per gallon', 'fuel economy'],
    mileage: ['mileage', 'odometer', 'miles', 'total miles', 'odometer reading'],
    dte_before: ['dte before', 'dte_before', 'dte', 'distance to empty', 'miles to empty'],
    price_per_gallon: ['price per gallon', 'price_per_gallon', 'price', 'cost per gallon', 'ppg', 'price/gallon'],
    gallons: ['gallons', 'amount', 'quantity', 'fuel amount', 'liters'],
    total_cost: ['total cost', 'total_cost', 'total', 'cost', 'price paid', 'amount paid'],
    dte_after: ['dte after', 'dte_after', 'dte after fill', 'distance after'],
    date_gas_added: ['date', 'date_gas_added', 'date added', 'fill date', 'transaction date', 'timestamp'],
    added_from_empty: ['added from empty', 'added_from_empty', 'from empty', 'empty tank', 'low fuel'],
  };

  const normalizeFieldName = (fieldName: string): string | null => {
    const normalized = fieldName.toLowerCase().trim();
    
    // First check for exact match (handles cases like "date_gas_added", "gas_station", etc.)
    const exactMatch = Object.keys(fieldMappings).find(key => key.toLowerCase() === normalized);
    if (exactMatch) {
      return exactMatch;
    }
    
    // Then check variations
    for (const [key, variations] of Object.entries(fieldMappings)) {
      if (variations.some(v => {
        const vLower = v.toLowerCase();
        return normalized === vLower || normalized.includes(vLower) || vLower.includes(normalized);
      })) {
        return key;
      }
    }
    return null;
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Detect delimiter (tab or comma)
    const firstLine = lines[0];
    const hasTabs = firstLine.includes('\t');
    const delimiter = hasTabs ? '\t' : ',';
    
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      
      // Skip rows with mismatched column count (but allow for extra columns like _source_file)
      if (values.length < headers.length) {
        continue;
      }
      
      const row: ParsedRow = {};
      headers.forEach((header, index) => {
        // Skip columns that don't map to our fields (like _source_file)
        if (header && header !== '_source_file' && header !== 'source_file') {
          row[header] = values[index] || '';
        }
      });
      
      // Only add row if it has at least some data
      if (Object.keys(row).length > 0) {
        rows.push(row);
      }
    }

    return rows;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setPreview([]);
    setMapping({});

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setPreview(parsed.slice(0, 5)); // Show first 5 rows as preview

        // Auto-detect field mappings
        const autoMapping: Record<string, string> = {};
        const headers = Object.keys(parsed[0] || {});
        headers.forEach(header => {
          // Skip columns we don't need
          if (header === '_source_file' || header === 'source_file') {
            return;
          }
          const mapped = normalizeFieldName(header);
          if (mapped) {
            autoMapping[header] = mapped;
          }
        });
        setMapping(autoMapping);
        
        // Show toast if some fields weren't mapped
        const unmapped = headers.filter(h => !autoMapping[h] && h !== '_source_file' && h !== 'source_file');
        if (unmapped.length > 0) {
          toast(`Some fields weren't automatically mapped: ${unmapped.join(', ')}`, {
            icon: '⚠️',
            duration: 4000,
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to parse CSV';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    };
    reader.readAsText(selectedFile);
  };

  const convertToGasEntry = (row: ParsedRow, index: number): { entry: GasEntry | null; error: string | null } => {
    try {
      if (!selectedVehicleId) {
        return { entry: null, error: 'Please select a vehicle' };
      }

      // Helper to get mapped value
      const getValue = (field: string): string => {
        const mappedHeader = Object.entries(mapping).find(([_, mapped]) => mapped === field)?.[0];
        if (mappedHeader) {
          return row[mappedHeader] || '';
        }
        // Also try direct field name match
        return row[field] || '';
      };

      // Parse fuel type
      const fuelTypeStr = getValue('fuel_type').toLowerCase();
      let fuelType: FuelType = 'regular-87';
      if (fuelTypeStr.includes('87') || fuelTypeStr.includes('regular')) fuelType = 'regular-87';
      else if (fuelTypeStr.includes('89') || fuelTypeStr.includes('mid')) fuelType = 'mid-grade-89';
      else if (fuelTypeStr.includes('91') || (fuelTypeStr.includes('premium') && !fuelTypeStr.includes('93'))) fuelType = 'premium-91';
      else if (fuelTypeStr.includes('93') || fuelTypeStr.includes('super')) fuelType = 'premium-93';
      else if (fuelTypeStr.includes('diesel')) fuelType = 'diesel';
      else if (fuelTypeStr.includes('e85')) fuelType = 'E85';
      else if (fuelTypeStr.includes('e15')) fuelType = 'E15';
      else if (fuelTypeStr.includes('e10')) fuelType = 'E10';

      // Parse date - handle various formats including "2025-02-01 12:29"
      const dateStr = getValue('date_gas_added');
      let dateGasAdded = new Date();
      if (dateStr) {
        // Try parsing various date formats
        let parsed = new Date(dateStr);
        
        // If that didn't work, try YYYY-MM-DD HH:MM format (like "2025-02-01 12:29")
        if (isNaN(parsed.getTime())) {
          const dateTimeMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})/);
          if (dateTimeMatch) {
            const [, datePart, hour, minute] = dateTimeMatch;
            parsed = new Date(`${datePart}T${hour}:${minute}:00`);
          } else {
            // Try other common formats
            const altMatch = dateStr.replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})/, '$1T$2:$3:00');
            parsed = new Date(altMatch);
          }
        }
        
        if (!isNaN(parsed.getTime())) {
          dateGasAdded = parsed;
        }
      }

      // Parse boolean
      const addedFromEmptyStr = getValue('added_from_empty').toLowerCase();
      const addedFromEmpty = addedFromEmptyStr === 'true' || addedFromEmptyStr === 'yes' || 
                            addedFromEmptyStr === '1' || addedFromEmptyStr.includes('empty');

      const entry: GasEntry = {
        vehicle_id: selectedVehicleId,
        gas_station: getValue('gas_station') || `Imported Station ${index + 1}`,
        gas_station_city: getValue('gas_station_city') || 'Unknown',
        fuel_type: fuelType,
        mpg_before: parseFloat(getValue('mpg_before')) || 0,
        mileage: parseFloat(getValue('mileage')) || 0,
        dte_before: parseFloat(getValue('dte_before')) || 0,
        price_per_gallon: parseFloat(getValue('price_per_gallon')) || 0,
        gallons: parseFloat(getValue('gallons')) || 0,
        total_cost: parseFloat(getValue('total_cost')) || 0,
        dte_after: parseFloat(getValue('dte_after')) || 0,
        date_gas_added: dateGasAdded.toISOString(),
        added_from_empty: addedFromEmpty,
      };

      // Validate required fields
      if (!entry.gas_station || entry.gas_station.trim() === '') {
        return { entry: null, error: `Row ${index + 1}: Missing gas station` };
      }
      
      if (entry.mileage === 0 || isNaN(entry.mileage)) {
        return { entry: null, error: `Row ${index + 1}: Invalid or missing mileage (got: ${getValue('mileage')})` };
      }

      // Auto-calculate total_cost if missing but we have price and gallons
      if (entry.total_cost === 0 && entry.price_per_gallon > 0 && entry.gallons > 0) {
        entry.total_cost = entry.price_per_gallon * entry.gallons;
      }

      return { entry, error: null };
    } catch (err) {
      return { entry: null, error: `Row ${index + 1}: ${err instanceof Error ? err.message : 'Parse error'}` };
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) {
      toast.error('Please select a CSV file first');
      setError('Please select a CSV file first');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const allRows = parseCSV(text);
      
      if (!selectedVehicleId) {
        toast.error('Please select a vehicle before importing');
        setError('Please select a vehicle before importing');
        setImporting(false);
        return;
      }

      // Batch create entries to avoid refreshing after each one
      const entriesToCreate: GasEntry[] = [];
      let errorCount = 0;
      const errors: string[] = [];

      // First, validate and convert all rows
      for (let i = 0; i < allRows.length; i++) {
        const { entry, error } = convertToGasEntry(allRows[i], i);
        if (entry) {
          entriesToCreate.push(entry);
        } else {
          errorCount++;
          if (error) {
            errors.push(error);
            if (errors.length <= 5) {
              toast.error(error, { duration: 3000 });
            }
          }
        }
      }

      // Batch create all entries at once
      let successCount = 0;
      if (entriesToCreate.length > 0) {
        try {
          // Import entries in batch using the service directly
          const { createGasEntryBatch } = await import('../../services/gasDataService');
          await createGasEntryBatch(entriesToCreate);
          successCount = entriesToCreate.length;
          // Refresh entries once after batch import
          await refreshEntries();
        } catch (err) {
          // Fallback: create entries one by one if batch fails
          for (const entry of entriesToCreate) {
            try {
              await addEntry(entry);
              successCount++;
            } catch (entryErr) {
              errorCount++;
              const errorMsg = `Failed to save entry - ${entryErr instanceof Error ? entryErr.message : 'Unknown error'}`;
              errors.push(errorMsg);
              if (errors.length <= 5) {
                toast.error(errorMsg, { duration: 3000 });
              }
            }
          }
          // Refresh entries once after all entries are processed
          await refreshEntries();
        }
      }

      // Show summary toast
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} ${successCount === 1 ? 'entry' : 'entries'}!`, {
          duration: 4000,
        });
        if (errorCount > 0) {
          toast.error(`${errorCount} ${errorCount === 1 ? 'row' : 'rows'} failed. Check console for details.`, {
            duration: 5000,
          });
          console.error('Import errors:', errors);
        }
        setSuccess(true);
        onImportComplete(successCount);
        setTimeout(() => {
          onClose();
          setFile(null);
          setPreview([]);
          setMapping({});
          setSuccess(false);
        }, 2000);
      } else {
        const errorMsg = `Failed to import entries. ${errorCount} rows had errors.`;
        toast.error(errorMsg, { duration: 6000 });
        setError(`${errorMsg} Check the errors above for details.`);
        console.error('All import errors:', errors);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to import CSV';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Import Gas Entries from CSV
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-800 text-sm font-medium">Entries imported successfully!</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary w-full"
          >
            📁 Choose CSV File
          </button>
          {file && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
          )}
        </div>

        {preview.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Field Mapping Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                The following fields were automatically detected. Review the preview below:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(mapping).map(([csvHeader, mappedField]) => (
                  <div key={csvHeader} className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">{csvHeader}:</span>
                    <span className="badge-primary">{mappedField}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(preview[0]).map((header) => (
                      <th key={header} className="px-3 py-2 text-left font-semibold text-gray-700 border-b">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      {Object.values(row).map((value, vIdx) => (
                        <td key={vIdx} className="px-3 py-2 text-gray-600">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Showing first 5 rows. All rows will be imported.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="btn-primary"
            disabled={!file || preview.length === 0 || importing}
          >
            {importing ? 'Importing...' : `📥 Import ${preview.length > 0 ? 'All Entries' : ''}`}
          </button>
        </div>
      </div>

      {showVehicleModal && (
        <VehicleCreationModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          onVehicleCreated={async (vehicle: Vehicle) => {
            setSelectedVehicleId(vehicle.id);
            setShowVehicleModal(false);
          }}
        />
      )}
    </div>
  );
}

