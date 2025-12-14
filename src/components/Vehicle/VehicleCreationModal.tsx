import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGasData } from '../../hooks/useGasData';
import { Vehicle } from '../../types/gasEntry';

interface VehicleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleCreated: (vehicle: Vehicle) => Promise<void>;
}

export function VehicleCreationModal({
  isOpen,
  onClose,
  onVehicleCreated,
}: VehicleCreationModalProps) {
  const { addVehicle } = useGasData();
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [expectedMpg, setExpectedMpg] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vehicle name is required');
      return;
    }

    try {
      setSubmitting(true);
      const vehicle =       await addVehicle({
        name: name.trim(),
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        year: year ? parseInt(year) : undefined,
        expected_mpg: expectedMpg ? parseFloat(expectedMpg) : undefined,
        is_default: isDefault,
      });

      toast.success(`Vehicle "${name.trim()}" created successfully! 🚗`);

      // Reset form
      setName('');
      setMake('');
      setModel('');
      setYear('');
      setExpectedMpg('');
      setIsDefault(true);
      
      // Call the callback which will refresh vehicles
      await onVehicleCreated(vehicle);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create vehicle';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="card w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">
          Create New Vehicle
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g., My Car, 2020 Honda Civic"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="input-field"
                  placeholder="Honda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-field"
                  placeholder="Civic"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="input-field"
                  placeholder="2020"
                  min="1900"
                  max="2100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected MPG
                </label>
                <input
                  type="number"
                  value={expectedMpg}
                  onChange={(e) => setExpectedMpg(e.target.value)}
                  className="input-field"
                  placeholder="30"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default vehicle
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

