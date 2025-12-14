import React from 'react';
import { FuelType, Vehicle } from '../../types/gasEntry';

interface GasEntryFormFieldsProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
  gasStation: string;
  onGasStationChange: (value: string) => void;
  gasStationCity: string;
  onGasStationCityChange: (value: string) => void;
  previousStations: string[];
  previousCities: string[];
  fuelType: FuelType;
  onFuelTypeChange: (value: FuelType) => void;
  mpgBefore: string;
  onMpgBeforeChange: (value: string) => void;
  mileage: string;
  onMileageChange: (value: string) => void;
  dteBefore: string;
  onDteBeforeChange: (value: string) => void;
  pricePerGallon: string;
  onPricePerGallonChange: (value: string) => void;
  gallons: string;
  onGallonsChange: (value: string) => void;
  totalCost: string;
  dteAfter: string;
  onDteAfterChange: (value: string) => void;
  dateGasAdded: Date | null;
  onDateGasAddedChange: (value: Date | null) => void;
  addedFromEmpty: boolean;
  onAddedFromEmptyChange: (value: boolean) => void;
}

export function GasEntryFormFields({
  vehicles,
  selectedVehicleId,
  onVehicleChange,
  gasStation,
  onGasStationChange,
  gasStationCity,
  onGasStationCityChange,
  previousStations,
  previousCities,
  fuelType,
  onFuelTypeChange,
  mpgBefore,
  onMpgBeforeChange,
  mileage,
  onMileageChange,
  dteBefore,
  onDteBeforeChange,
  pricePerGallon,
  onPricePerGallonChange,
  gallons,
  onGallonsChange,
  totalCost,
  dteAfter,
  onDteAfterChange,
  dateGasAdded,
  onDateGasAddedChange,
  addedFromEmpty,
  onAddedFromEmptyChange,
}: GasEntryFormFieldsProps) {
  const formatDateTimeLocal = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onDateGasAddedChange(new Date(value));
    } else {
      onDateGasAddedChange(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vehicle <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedVehicleId}
          onChange={(e) => onVehicleChange(e.target.value)}
          className="input-field"
          required
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gas Station <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            list="gas-stations"
            value={gasStation}
            onChange={(e) => onGasStationChange(e.target.value)}
            className="input-field"
            placeholder="Type or select from previous"
            required
          />
          {previousStations.length > 0 && (
            <datalist id="gas-stations">
              {previousStations.map((station, idx) => (
                <option key={idx} value={station} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            list="cities"
            value={gasStationCity}
            onChange={(e) => onGasStationCityChange(e.target.value)}
            className="input-field"
            placeholder="Type or select from previous"
            required
          />
          {previousCities.length > 0 && (
            <datalist id="cities">
              {previousCities.map((city, idx) => (
                <option key={idx} value={city} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fuel Type
        </label>
        <select
          value={fuelType}
          onChange={(e) => onFuelTypeChange(e.target.value as FuelType)}
          className="input-field"
        >
          <option value="regular-87">Regular (87 octane)</option>
          <option value="mid-grade-89">Mid-Grade (89 octane)</option>
          <option value="premium-91">Premium (91 octane)</option>
          <option value="premium-93">Premium (93 octane)</option>
          <option value="diesel">Diesel</option>
          <option value="E85">E85 (Ethanol)</option>
          <option value="E15">E15 (Ethanol)</option>
          <option value="E10">E10 (Ethanol)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          MPG Before <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={mpgBefore}
          onChange={(e) => onMpgBeforeChange(e.target.value)}
          step="0.1"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mileage <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={mileage}
          onChange={(e) => onMileageChange(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DTE Before <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={dteBefore}
          onChange={(e) => onDteBeforeChange(e.target.value)}
          className="input-field"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Distance to Empty before fill-up</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price per Gallon ($) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={pricePerGallon}
          onChange={(e) => onPricePerGallonChange(e.target.value)}
          step="0.001"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gallons <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={gallons}
          onChange={(e) => onGallonsChange(e.target.value)}
          step="0.001"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Cost ($)
        </label>
        <input
          type="text"
          value={totalCost}
          disabled
          className="input-field bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">Auto-calculated from price × gallons</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DTE After <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={dteAfter}
          onChange={(e) => onDteAfterChange(e.target.value)}
          className="input-field"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Distance to Empty after fill-up</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={formatDateTimeLocal(dateGasAdded)}
          onChange={handleDateTimeChange}
          className="input-field"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={addedFromEmpty}
            onChange={(e) => onAddedFromEmptyChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Added from Empty</span>
            <p className="text-xs text-gray-500">
              {parseFloat(dteBefore) < 35
                ? 'Auto-detected: DTE before is less than 35'
                : 'Manually override'}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
