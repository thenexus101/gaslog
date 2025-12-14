# Vehicle Storage in Google Sheets

## How Vehicles Are Saved

Yes, **vehicles ARE being saved** to Google Sheets! Here's how it works:

### Storage Structure

When you first log in, the app creates a Google Spreadsheet with **two sheets**:

1. **"Gas Log"** - Contains all your gas entries
2. **"Vehicles"** - Contains all your vehicle information

### Vehicle Data Saved

Each vehicle is saved with the following information:
- `id` - Unique identifier
- `name` - Vehicle name (e.g., "My Car", "2020 Honda Civic")
- `make` - Vehicle make (optional)
- `model` - Vehicle model (optional)
- `year` - Vehicle year (optional)
- `expected_mpg` - Expected MPG for efficiency calculations (optional)
- `is_default` - Whether this is the default vehicle

### When Vehicles Are Created

1. **On First Login**: A default vehicle named "My Vehicle" is automatically created
2. **When You Create a Vehicle**: Using the "Create Vehicle" button, the vehicle is saved to the "Vehicles" sheet
3. **When You Add a Vehicle**: Using the "+ Add Vehicle" button in the form

### How to Verify

1. Log into your Google account
2. Go to Google Drive
3. Look for a spreadsheet named "Gas Log"
4. Open it and check the "Vehicles" sheet tab
5. You should see all your vehicles listed there

### Troubleshooting

If vehicles aren't showing up:
1. Check that you're logged in with the correct Google account
2. Verify the spreadsheet exists in your Google Drive
3. Check the browser console for any errors
4. Try logging out and logging back in

