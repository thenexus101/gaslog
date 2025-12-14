export type FuelType = 
  | 'regular-87' 
  | 'mid-grade-89' 
  | 'premium-91' 
  | 'premium-93' 
  | 'diesel' 
  | 'E85' 
  | 'E15' 
  | 'E10';

export interface GasEntry {
  id?: string; // Row ID in Google Sheets
  vehicle_id: string; // Reference to vehicle
  gas_station: string;
  gas_station_city: string;
  fuel_type: FuelType;
  mpg_before: number;
  mileage: number;
  dte_before: number;
  price_per_gallon: number;
  gallons: number;
  total_cost: number;
  dte_after: number;
  date_gas_added: string; // ISO 8601 format
  added_from_empty: boolean; // Auto-calculated (dte_before < 35) with manual override
}

export interface Vehicle {
  id: string;
  name: string; // e.g., "My Car", "2020 Honda Civic"
  make?: string;
  model?: string;
  year?: number;
  expected_mpg?: number; // For efficiency score calculation
  is_default: boolean;
}

