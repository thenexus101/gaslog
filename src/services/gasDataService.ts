import { GasEntry, Vehicle } from '../types/gasEntry';
import { getSpreadsheetId, getAuthUser, isTokenExpired, saveSpreadsheetId } from './authService';
import {
  createGasEntry as createEntry,
  getGasEntries as getEntries,
  getVehicles,
  createVehicle,
  updateVehicle,
  createSpreadsheet,
  appendSheetValues,
} from './sheetsService';

/**
 * Search for an existing Gas Log spreadsheet using Drive API
 */
async function findExistingSpreadsheet(_userEmail: string, accessToken: string): Promise<string | null> {
  try {
    // Search for spreadsheets with the name pattern "Gas Log" owned by the user
    // Using Drive API v3 to search for files
    const searchQuery = `name='Gas Log' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,createdTime)&orderBy=createdTime desc`;
    
    const response = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('Drive API search failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      // Return the most recently created one (first in the list since we sorted by createdTime desc)
      const spreadsheetId = data.files[0].id;
      console.log('Found existing Gas Log spreadsheet:', spreadsheetId);
      return spreadsheetId;
    }

    return null;
  } catch (error) {
    console.warn('Error searching for existing spreadsheet:', error);
    return null;
  }
}

export async function ensureSpreadsheetExists(): Promise<string> {
  const user = getAuthUser();
  if (!user) {
    throw new Error('User not authenticated. Please log in again.');
  }

  if (isTokenExpired(user)) {
    throw new Error('Session expired. Please log in again.');
  }

  // Step 1: Try to get spreadsheet ID from localStorage (current device)
  let spreadsheetId = getSpreadsheetId(user.email);
  
  // Step 2: If found locally, verify it still exists and is accessible
  if (spreadsheetId) {
    try {
      const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
      const metadataResponse = await fetch(metadataUrl, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });

      if (metadataResponse.ok) {
        // Spreadsheet exists and is accessible
        saveSpreadsheetId(spreadsheetId, user.email);
        console.log('✓ Using spreadsheet from local storage:', spreadsheetId);
        return spreadsheetId;
      } else {
        // Spreadsheet not found or no access, clear it and search
        console.warn('Stored spreadsheet ID is invalid, searching for existing one...');
        spreadsheetId = null;
      }
    } catch (error) {
      console.warn('Error verifying stored spreadsheet:', error);
      spreadsheetId = null;
    }
  }

  // Step 3: If no local ID or it's invalid, search for existing spreadsheet in Drive
  // This allows cross-device access - if user logged in on another device,
  // we can find their existing spreadsheet
  if (!spreadsheetId) {
    console.log('Searching for existing Gas Log spreadsheet in Google Drive...');
    spreadsheetId = await findExistingSpreadsheet(user.email, user.accessToken);
    
    if (spreadsheetId) {
      // Verify it's actually a valid spreadsheet we can access
      try {
        const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
        const metadataResponse = await fetch(metadataUrl, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
          },
        });

        if (metadataResponse.ok) {
          // Found and verified existing spreadsheet
          saveSpreadsheetId(spreadsheetId, user.email);
          console.log('✓ Found and using existing spreadsheet from Drive:', spreadsheetId);
          return spreadsheetId;
        } else {
          console.warn('Found spreadsheet but cannot access it, will create new one');
          spreadsheetId = null;
        }
      } catch (error) {
        console.warn('Error verifying found spreadsheet:', error);
        spreadsheetId = null;
      }
    }
  }

  // Step 4: Create new spreadsheet if none exists
  console.log('No existing spreadsheet found, creating new one...');
  const info = await createSpreadsheet(user.accessToken);
  saveSpreadsheetId(info.spreadsheetId, user.email);
  console.log('✓ Created new spreadsheet:', info.spreadsheetId);
  return info.spreadsheetId;
}

export async function createGasEntry(entry: GasEntry): Promise<void> {
  const spreadsheetId = await ensureSpreadsheetExists();
  const user = getAuthUser();
  if (!user || isTokenExpired(user)) {
    throw new Error('User not authenticated. Please log in again.');
  }
  await createEntry(spreadsheetId, entry, user.accessToken);
}

/**
 * Batch create multiple gas entries at once (more efficient than creating one by one)
 */
export async function createGasEntryBatch(entries: GasEntry[]): Promise<void> {
  if (entries.length === 0) return;
  
  const spreadsheetId = await ensureSpreadsheetExists();
  const user = getAuthUser();
  if (!user || isTokenExpired(user)) {
    throw new Error('User not authenticated. Please log in again.');
  }

  // Convert entries to rows
  const rows = entries.map(entry => [
    `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entry.vehicle_id,
    entry.gas_station,
    entry.gas_station_city,
    entry.fuel_type,
    entry.mpg_before.toString(),
    entry.mileage.toString(),
    entry.dte_before.toString(),
    entry.price_per_gallon.toString(),
    entry.gallons.toString(),
    entry.total_cost.toString(),
    entry.dte_after.toString(),
    entry.date_gas_added,
    entry.added_from_empty.toString(),
  ]);

  // Batch append all rows at once
  await appendSheetValues(spreadsheetId, 'Gas Log', rows, user.accessToken);
}

export async function fetchGasEntries(): Promise<GasEntry[]> {
  const spreadsheetId = await ensureSpreadsheetExists();
  const user = getAuthUser();
  if (!user || isTokenExpired(user)) {
    throw new Error('User not authenticated. Please log in again.');
  }
  return await getEntries(spreadsheetId, user.accessToken);
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const spreadsheetId = await ensureSpreadsheetExists();
  const user = getAuthUser();
  if (!user || isTokenExpired(user)) {
    throw new Error('User not authenticated. Please log in again.');
  }
  return await getVehicles(spreadsheetId, user.accessToken);
}

export async function createNewVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const spreadsheetId = await ensureSpreadsheetExists();
  const user = getAuthUser();
  if (!user || isTokenExpired(user)) {
    throw new Error('User not authenticated. Please log in again.');
  }

  // Check if this is the first vehicle - if so, make it default
  const existingVehicles = await getVehicles(spreadsheetId, user.accessToken);
  const isFirstVehicle = existingVehicles.length === 0;

  const vehicleId = `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newVehicle: Vehicle = {
    ...vehicle,
    id: vehicleId,
    is_default: isFirstVehicle || vehicle.is_default, // First vehicle is always default
  };

  await createVehicle(spreadsheetId, newVehicle, user.accessToken);
  return newVehicle;
}

export async function updateVehicleInfo(vehicle: Vehicle): Promise<void> {
  const spreadsheetId = await ensureSpreadsheetExists();
  const user = getAuthUser();
  if (!user || isTokenExpired(user)) {
    throw new Error('User not authenticated. Please log in again.');
  }
  await updateVehicle(spreadsheetId, vehicle, user.accessToken);
}
