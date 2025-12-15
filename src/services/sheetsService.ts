import { GasEntry, Vehicle } from '../types/gasEntry';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Verify that the access token is valid for Sheets API
 */
export async function verifyToken(accessToken: string): Promise<boolean> {
  try {
    // Try a simple API call to verify the token
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    // Check if token has the required scope
    return data.scope && data.scope.includes('https://www.googleapis.com/auth/spreadsheets');
  } catch {
    return false;
  }
}

/**
 * Create a new spreadsheet for the user
 */
export async function createSpreadsheet(accessToken: string, userEmail?: string): Promise<SpreadsheetInfo> {
  console.log('Creating spreadsheet with token:', accessToken.substring(0, 20) + '...');
  
  // Use user-specific name if email is provided
  const spreadsheetTitle = userEmail ? `Gas Log - ${userEmail}` : 'Gas Log';
  
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle,
      },
      sheets: [
        {
          properties: {
            title: 'Gas Log',
          },
        },
        {
          properties: {
            title: 'Vehicles',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    const errorMessage = errorData.error?.message || 'Unknown error';
    console.error('Spreadsheet creation failed:', errorMessage, errorData);
    
    // Provide more helpful error messages
    if (errorMessage.includes('invalid authentication') || errorMessage.includes('invalid credentials')) {
      throw new Error('Invalid authentication. Please log out and log back in to refresh your token.');
    }
    
    throw new Error(`Failed to create spreadsheet: ${errorMessage}`);
  }

  const data = await response.json();
  
  // Initialize headers for Gas Log sheet
  await initializeGasLogSheet(data.spreadsheetId, accessToken);
  
  // Initialize headers for Vehicles sheet and create default vehicle
  await initializeVehiclesSheet(data.spreadsheetId, accessToken);

  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

/**
 * Initialize the Gas Log sheet with headers
 */
async function initializeGasLogSheet(spreadsheetId: string, accessToken: string): Promise<void> {
  const headers = [
    'id',
    'vehicle_id',
    'gas_station',
    'gas_station_city',
    'fuel_type',
    'mpg_before',
    'mileage',
    'dte_before',
    'price_per_gallon',
    'gallons',
    'total_cost',
    'dte_after',
    'date_gas_added',
    'added_from_empty',
  ];

  await updateSheetRange(
    spreadsheetId,
    'Gas Log!A1:N1',
    [headers],
    accessToken
  );
}

/**
 * Initialize the Vehicles sheet with headers and default vehicle
 */
async function initializeVehiclesSheet(spreadsheetId: string, accessToken: string): Promise<void> {
  const headers = ['id', 'name', 'make', 'model', 'year', 'expected_mpg', 'is_default'];
  
  await updateSheetRange(
    spreadsheetId,
    'Vehicles!A1:G1',
    [headers],
    accessToken
  );

  // No default vehicle - user must create their first vehicle
}

/**
 * Update a range in the spreadsheet
 */
async function updateSheetRange(
  spreadsheetId: string,
  range: string,
  values: any[][],
  accessToken: string
): Promise<void> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}?valueInputOption=RAW`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update sheet: ${error.error?.message || 'Unknown error'}`);
  }
}

/**
 * Append values to a sheet
 */
export async function appendSheetValues(
  spreadsheetId: string,
  sheetName: string,
  values: any[][],
  accessToken: string
): Promise<void> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=RAW`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to append to sheet: ${error.error?.message || 'Unknown error'}`);
  }
}

/**
 * Read values from a sheet
 */
async function readSheetValues(
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<any[][]> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to read sheet: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Create a gas entry
 */
export async function createGasEntry(
  spreadsheetId: string,
  entry: GasEntry,
  accessToken: string
): Promise<void> {
  const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const row = [
    entryId,
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
  ];

  await appendSheetValues(spreadsheetId, 'Gas Log', [row], accessToken);
}

/**
 * Get all gas entries
 */
export async function getGasEntries(
  spreadsheetId: string,
  accessToken: string
): Promise<GasEntry[]> {
  const values = await readSheetValues(spreadsheetId, 'Gas Log!A2:N', accessToken);
  
  if (values.length === 0) return [];

  return values.map((row, index) => ({
    id: row[0] || `entry_${index}`,
    vehicle_id: row[1] || '',
    gas_station: row[2] || '',
    gas_station_city: row[3] || '',
    fuel_type: (row[4] || 'regular-87') as GasEntry['fuel_type'],
    mpg_before: parseFloat(row[5] || '0'),
    mileage: parseFloat(row[6] || '0'),
    dte_before: parseFloat(row[7] || '0'),
    price_per_gallon: parseFloat(row[8] || '0'),
    gallons: parseFloat(row[9] || '0'),
    total_cost: parseFloat(row[10] || '0'),
    dte_after: parseFloat(row[11] || '0'),
    date_gas_added: row[12] || new Date().toISOString(),
    added_from_empty: row[13] === 'true',
  }));
}

/**
 * Create a vehicle
 */
export async function createVehicle(
  spreadsheetId: string,
  vehicle: Vehicle,
  accessToken: string
): Promise<void> {
  const row = [
    vehicle.id,
    vehicle.name,
    vehicle.make || '',
    vehicle.model || '',
    vehicle.year?.toString() || '',
    vehicle.expected_mpg?.toString() || '',
    vehicle.is_default.toString(),
  ];

  await appendSheetValues(spreadsheetId, 'Vehicles', [row], accessToken);
}

/**
 * Get all vehicles
 */
export async function getVehicles(
  spreadsheetId: string,
  accessToken: string
): Promise<Vehicle[]> {
  const values = await readSheetValues(spreadsheetId, 'Vehicles!A2:G', accessToken);
  
  if (values.length === 0) return [];

  return values.map(row => ({
    id: row[0] || '',
    name: row[1] || 'Unknown Vehicle',
    make: row[2] || undefined,
    model: row[3] || undefined,
    year: row[4] ? parseInt(row[4]) : undefined,
    expected_mpg: row[5] ? parseFloat(row[5]) : undefined,
    is_default: row[6] === 'true',
  }));
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
  spreadsheetId: string,
  vehicle: Vehicle,
  accessToken: string
): Promise<void> {
  // Get all vehicles to find the row
  const vehicles = await getVehicles(spreadsheetId, accessToken);
  const vehicleIndex = vehicles.findIndex(v => v.id === vehicle.id);
  
  if (vehicleIndex === -1) {
    throw new Error('Vehicle not found');
  }

  // Read all rows to update the specific one
  const allValues = await readSheetValues(spreadsheetId, 'Vehicles!A:G', accessToken);
  const rowIndex = vehicleIndex + 2; // +2 because of header and 0-based index
  
  allValues[rowIndex] = [
    vehicle.id,
    vehicle.name,
    vehicle.make || '',
    vehicle.model || '',
    vehicle.year?.toString() || '',
    vehicle.expected_mpg?.toString() || '',
    vehicle.is_default.toString(),
  ];

  // Update the entire range
  await updateSheetRange(spreadsheetId, 'Vehicles!A:G', allValues, accessToken);
}

