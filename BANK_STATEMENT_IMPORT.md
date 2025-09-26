# Bank Statement Import Feature

## Overview
The budget app now supports automatic transaction import from bank statements, eliminating the need to manually enter each expense. This feature includes:

- **Bank Statement Upload**: Upload CSV, JSON, or TXT files
- **Auto Transaction Sync**: Periodic automatic syncing with bank APIs (simulated)
- **Smart Categorization**: Automatic expense categorization
- **Duplicate Detection**: Prevents importing the same transaction twice

## How to Use

### 1. Bank Statement Upload

1. **Prepare Your Bank Statement**
   - Download your bank statement in CSV format from your bank's website
   - Ensure it contains columns for Date, Description, Amount, and Type
   - Use the provided `sample-bank-statement.csv` file to test the feature

2. **Upload Process**
   - Navigate to your dashboard
   - Find the "Import Bank Statement" section
   - Click the upload area or drag and drop your file
   - Review the parsed transactions
   - Select which transactions to import
   - Click "Import Selected Transactions"

### 2. Auto Transaction Sync

1. **Enable Auto Sync**
   - Go to the "Auto Transaction Sync" section
   - Toggle "Enable Auto Sync"
   - Choose your preferred sync interval (5 minutes to daily)

2. **Manual Sync**
   - Click "Sync Now" to manually check for new transactions
   - The system will automatically categorize and import new expenses

## Supported File Formats

### CSV Format
```csv
Date,Description,Amount,Type,Balance
2024-01-15,SWIGGY BANGALORE,450,Debit,25000
2024-01-14,UBER TRIP BANGALORE,280,Debit,25450
```

### JSON Format
```json
[
  {
    "date": "2024-01-15",
    "description": "SWIGGY BANGALORE",
    "amount": 450,
    "type": "Debit",
    "balance": 25000
  }
]
```

### Text Format (Tab or space separated)
```
2024-01-15    SWIGGY BANGALORE    450
2024-01-14    UBER TRIP BANGALORE    280
```

## Automatic Categorization

The system automatically categorizes transactions based on keywords:

- **Food & Dining**: Swiggy, Zomato, Restaurant, Cafe
- **Transportation**: Uber, Ola, Petrol, Metro
- **Groceries**: Grocery, Supermarket, DMart
- **Shopping**: Amazon, Flipkart, Mall
- **Bills & Utilities**: Electricity, Water, Mobile, Internet
- **Healthcare**: Hospital, Medical, Pharmacy
- **Entertainment**: Netflix, Movie, Cinema

## Security & Privacy

- **No Credentials Stored**: Banking credentials are never stored
- **Read-Only Access**: Uses secure, read-only bank APIs
- **Local Processing**: Transaction parsing happens locally
- **Encrypted Communication**: All API calls are encrypted

## Troubleshooting

### File Upload Issues
- Ensure file is in CSV, JSON, or TXT format
- Check that the file contains required columns (Date, Description, Amount)
- File size should be under 10MB

### Sync Issues
- Check internet connection
- Verify bank API credentials (in real implementation)
- Try manual sync first

### Categorization Issues
- Transactions are categorized based on description keywords
- You can manually recategorize after import
- Add custom keywords in settings (future feature)

## Bank Compatibility

Currently supports statement formats from:
- State Bank of India (SBI)
- HDFC Bank
- ICICI Bank
- Axis Bank
- Kotak Mahindra Bank
- And most other major Indian banks

## Future Enhancements

- **Direct Bank Integration**: Connect directly to bank APIs
- **Custom Categories**: Add your own categorization rules
- **Recurring Transaction Detection**: Identify and handle recurring payments
- **Multi-Account Support**: Import from multiple bank accounts
- **Advanced Analytics**: Spending pattern analysis from imported data

## Sample Data

Use the provided `sample-bank-statement.csv` file to test the import feature:
1. Download the file from the public folder
2. Upload it using the bank statement uploader
3. Review the automatically categorized transactions
4. Import selected transactions to see them in your budget

## Support

For issues or questions about the bank statement import feature:
1. Check this documentation first
2. Verify your file format matches the supported formats
3. Try the sample CSV file to ensure the feature works
4. Contact support if issues persist

---

**Note**: The auto-sync feature currently uses simulated data for demonstration. In a production environment, this would connect to actual bank APIs through services like Plaid, Yodlee, or Open Banking APIs.