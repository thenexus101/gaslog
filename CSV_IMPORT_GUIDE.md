# CSV Import Guide

## How to Import Gas Entries from CSV

The Gas Log app supports importing gas entries from CSV files with automatic field detection and mapping.

## CSV Format

Your CSV file should have a header row with column names. The app will automatically detect common field name variations.

### Supported Field Names

The app recognizes various field name formats. Here are examples:

**Gas Station:**
- `gas station`, `station`, `gas_station`, `gasstation`, `location`, `where`

**City:**
- `city`, `gas_station_city`, `station city`, `location city`, `town`

**Fuel Type:**
- `fuel type`, `fuel_type`, `fuel`, `gas type`, `octane`
- Values: `regular`, `87`, `mid-grade`, `89`, `premium`, `91`, `93`, `diesel`, `E85`, `E15`, `E10`

**MPG Before:**
- `mpg before`, `mpg_before`, `mpg`, `miles per gallon`, `fuel economy`

**Mileage:**
- `mileage`, `odometer`, `miles`, `total miles`, `odometer reading`

**DTE Before:**
- `dte before`, `dte_before`, `dte`, `distance to empty`, `miles to empty`

**Price per Gallon:**
- `price per gallon`, `price_per_gallon`, `price`, `cost per gallon`, `ppg`, `price/gallon`

**Gallons:**
- `gallons`, `amount`, `quantity`, `fuel amount`, `liters`

**Total Cost:**
- `total cost`, `total_cost`, `total`, `cost`, `price paid`, `amount paid`

**DTE After:**
- `dte after`, `dte_after`, `dte after fill`, `distance after`

**Date:**
- `date`, `date_gas_added`, `date added`, `fill date`, `transaction date`, `timestamp`
- Format: Any standard date format (YYYY-MM-DD, MM/DD/YYYY, etc.)

**Added from Empty:**
- `added from empty`, `added_from_empty`, `from empty`, `empty tank`, `low fuel`
- Values: `true`, `false`, `yes`, `no`, `1`, `0`

## Example CSV

```csv
date,gas station,city,fuel type,mpg before,mileage,dte before,price per gallon,gallons,total cost,dte after,added from empty
2024-01-06,Costco,City of Industry,regular,35.4,6075,214,3.999,6.643,26.59,491,false
2024-01-15,Shell,Los Angeles,premium,36.2,6250,180,4.299,8.5,36.54,520,true
```

## How to Import

1. **Go to History Page**
   - Click on "History" in the navigation
   - Click the "📥 Import from CSV" button

2. **Select Your CSV File**
   - Click "Choose CSV File"
   - Select your CSV file from your computer

3. **Review Field Mapping**
   - The app will automatically detect and map your CSV columns
   - Review the preview table to ensure fields are mapped correctly
   - The preview shows the first 5 rows

4. **Import**
   - Click "Import All Entries"
   - The app will import all rows from your CSV
   - You'll see a success message with the number of entries imported

## Important Notes

- **Vehicle Assignment**: All imported entries will be assigned to your default vehicle (or first vehicle if no default is set)
- **Required Fields**: At minimum, your CSV should have `gas station` and `mileage` fields
- **Date Format**: The app accepts various date formats and will try to parse them automatically
- **Fuel Type**: If fuel type isn't recognized, it will default to Regular (87 octane)
- **Validation**: Rows with missing required data will be skipped during import

## Troubleshooting

### Import Fails
- Check that your CSV file is properly formatted (comma-separated)
- Ensure the header row contains recognizable field names
- Verify that required fields (gas station, mileage) are present

### Fields Not Detected
- Try using one of the supported field name variations listed above
- The app uses fuzzy matching, so similar names should work

### Date Parsing Issues
- Use standard date formats: YYYY-MM-DD or MM/DD/YYYY
- Include time if available: YYYY-MM-DD HH:MM

### Wrong Vehicle Assigned
- Imported entries are assigned to your default vehicle
- You can manually edit entries after import if needed

