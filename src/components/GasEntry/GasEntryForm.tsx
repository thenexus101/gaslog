import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { GasEntryFormFields } from './GasEntryFormFields';
import { useGasData } from '../../hooks/useGasData';
import { GasEntry, FuelType, Vehicle } from '../../types/gasEntry';
import { VehicleCreationModal } from '../Vehicle/VehicleCreationModal';
import { CSVImportModal } from '../Import/CSVImportModal';

export function GasEntryForm() {
  const { vehicles, entries, addEntry, getDefaultVehicle, loading: dataLoading, refreshVehicles } = useGasData();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const defaultVehicle = getDefaultVehicle();
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    defaultVehicle?.id || vehicles[0]?.id || ''
  );

  // Get unique previous values for auto-populate
  const previousStations = useMemo(() => {
    const stations = new Set<string>();
    entries
      .filter(e => e.vehicle_id === selectedVehicleId)
      .forEach(e => {
        if (e.gas_station) stations.add(e.gas_station);
      });
    return Array.from(stations).sort();
  }, [entries, selectedVehicleId]);

  const previousCities = useMemo(() => {
    const cities = new Set<string>();
    entries
      .filter(e => e.vehicle_id === selectedVehicleId)
      .forEach(e => {
        if (e.gas_station_city) cities.add(e.gas_station_city);
      });
    return Array.from(cities).sort();
  }, [entries, selectedVehicleId]);

  const [gasStation, setGasStation] = useState('');
  const [gasStationCity, setGasStationCity] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('regular-87');
  const [mpgBefore, setMpgBefore] = useState('');
  const [mileage, setMileage] = useState('');
  const [dteBefore, setDteBefore] = useState('');
  const [pricePerGallon, setPricePerGallon] = useState('');
  const [gallons, setGallons] = useState('');
  const [dteAfter, setDteAfter] = useState('');
  const [dateGasAdded, setDateGasAdded] = useState<Date | null>(new Date());
  const [addedFromEmpty, setAddedFromEmpty] = useState(false);

  // Update selected vehicle when default vehicle changes
  useEffect(() => {
    if (defaultVehicle && !selectedVehicleId) {
      setSelectedVehicleId(defaultVehicle.id);
    }
  }, [defaultVehicle, selectedVehicleId]);

  // Auto-calculate total cost
  const totalCost = React.useMemo(() => {
    const price = parseFloat(pricePerGallon) || 0;
    const gallonsValue = parseFloat(gallons) || 0;
    return (price * gallonsValue).toFixed(2);
  }, [pricePerGallon, gallons]);

  // Auto-calculate added_from_empty based on dte_before
  useEffect(() => {
    const dte = parseFloat(dteBefore);
    if (!isNaN(dte)) {
      setAddedFromEmpty(dte < 35);
    }
  }, [dteBefore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedVehicleId) {
      setError('Please select a vehicle');
      return;
    }

    if (!dateGasAdded) {
      setError('Please select a date and time');
      return;
    }

    try {
      setSubmitting(true);

      const entry: GasEntry = {
        vehicle_id: selectedVehicleId,
        gas_station: gasStation,
        gas_station_city: gasStationCity,
        fuel_type: fuelType,
        mpg_before: parseFloat(mpgBefore) || 0,
        mileage: parseFloat(mileage) || 0,
        dte_before: parseFloat(dteBefore) || 0,
        price_per_gallon: parseFloat(pricePerGallon) || 0,
        gallons: parseFloat(gallons) || 0,
        total_cost: parseFloat(totalCost) || 0,
        dte_after: parseFloat(dteAfter) || 0,
        date_gas_added: dateGasAdded.toISOString(),
        added_from_empty: addedFromEmpty,
      };

      await addEntry(entry);
      toast.success('Gas entry saved successfully! 🎉');

      // Reset form
      setGasStation('');
      setGasStationCity('');
      setFuelType('regular-87');
      setMpgBefore('');
      setMileage('');
      setDteBefore('');
      setPricePerGallon('');
      setGallons('');
      setDteAfter('');
      setDateGasAdded(new Date());
      setAddedFromEmpty(false);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save entry';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
    };

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleVehicleCreated = async (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    // Refresh vehicles list to ensure it's up to date
    await refreshVehicles();
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <>
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                No vehicles found
              </h3>
              <p className="text-yellow-700">
                Please create a vehicle to start logging gas entries.
              </p>
            </div>
            <button
              onClick={() => setShowVehicleModal(true)}
              className="btn-primary"
            >
              Create Vehicle
            </button>
          </div>
        </div>
        {showVehicleModal && (
          <VehicleCreationModal
            isOpen={showVehicleModal}
            onClose={() => setShowVehicleModal(false)}
            onVehicleCreated={handleVehicleCreated}
          />
        )}
      </>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Log Gas Entry
        </h1>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="btn-secondary text-sm py-2 px-4"
          >
            📥 Import from CSV
          </button>
          <button
            type="button"
            onClick={() => setShowVehicleModal(true)}
            className="btn-secondary text-sm py-2 px-4"
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 ml-4"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Gas entry saved successfully!</span>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-green-600 hover:text-green-800 ml-4"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <GasEntryFormFields
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleChange={setSelectedVehicleId}
          gasStation={gasStation}
          onGasStationChange={setGasStation}
          gasStationCity={gasStationCity}
          onGasStationCityChange={setGasStationCity}
          previousStations={previousStations}
          previousCities={previousCities}
          fuelType={fuelType}
          onFuelTypeChange={setFuelType}
          mpgBefore={mpgBefore}
          onMpgBeforeChange={setMpgBefore}
          mileage={mileage}
          onMileageChange={setMileage}
          dteBefore={dteBefore}
          onDteBeforeChange={setDteBefore}
          pricePerGallon={pricePerGallon}
          onPricePerGallonChange={setPricePerGallon}
          gallons={gallons}
          onGallonsChange={setGallons}
          totalCost={totalCost}
          dteAfter={dteAfter}
          onDteAfterChange={setDteAfter}
          dateGasAdded={dateGasAdded}
          onDateGasAddedChange={setDateGasAdded}
          addedFromEmpty={addedFromEmpty}
          onAddedFromEmptyChange={setAddedFromEmpty}
        />

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setGasStation('');
              setGasStationCity('');
              setFuelType('regular-87');
              setMpgBefore('');
              setMileage('');
              setDteBefore('');
              setPricePerGallon('');
              setGallons('');
              setDteAfter('');
              setDateGasAdded(new Date());
              setAddedFromEmpty(false);
            }}
            className="btn-secondary"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              '💾 Save Entry'
            )}
          </button>
        </div>
      </form>

      {showVehicleModal && (
        <VehicleCreationModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          onVehicleCreated={handleVehicleCreated}
        />
      )}
      {showImportModal && (
        <CSVImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={async (count) => {
            // Refresh is handled automatically
          }}
          preselectedVehicleId={selectedVehicleId}
        />
      )}
    </div>
  );
}

