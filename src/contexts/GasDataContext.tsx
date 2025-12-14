import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GasEntry, Vehicle } from '../types/gasEntry';
import {
  createGasEntry,
  fetchGasEntries,
  fetchVehicles,
  createNewVehicle,
  updateVehicleInfo,
} from '../services/gasDataService';

interface GasDataContextType {
  entries: GasEntry[];
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  addEntry: (entry: GasEntry) => Promise<void>;
  refreshEntries: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  getDefaultVehicle: () => Vehicle | null;
}

const GasDataContext = createContext<GasDataContextType | undefined>(undefined);

export function GasDataProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<GasEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGasEntries();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVehicles = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    }
  }, []);

  useEffect(() => {
    refreshEntries();
    refreshVehicles();
  }, [refreshEntries, refreshVehicles]);

  const addEntry = useCallback(async (entry: GasEntry) => {
    try {
      setError(null);
      await createGasEntry(entry);
      await refreshEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
      throw err;
    }
  }, [refreshEntries]);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      setError(null);
      const newVehicle = await createNewVehicle(vehicle);
      await refreshVehicles();
      return newVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vehicle');
      throw err;
    }
  }, [refreshVehicles]);

  const updateVehicle = useCallback(async (vehicle: Vehicle) => {
    try {
      setError(null);
      await updateVehicleInfo(vehicle);
      await refreshVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
      throw err;
    }
  }, [refreshVehicles]);

  const getDefaultVehicle = useCallback(() => {
    return vehicles.find(v => v.is_default) || vehicles[0] || null;
  }, [vehicles]);

  return (
    <GasDataContext.Provider
      value={{
        entries,
        vehicles,
        loading,
        error,
        addEntry,
        refreshEntries,
        refreshVehicles,
        addVehicle,
        updateVehicle,
        getDefaultVehicle,
      }}
    >
      {children}
    </GasDataContext.Provider>
  );
}

export function useGasData() {
  const context = useContext(GasDataContext);
  if (context === undefined) {
    throw new Error('useGasData must be used within a GasDataProvider');
  }
  return context;
}

