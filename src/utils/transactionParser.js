// Transaction parser for bank statements
import { format, parse, isValid } from 'date-fns';

export class TransactionParser {
  constructor() {
    this.supportedFormats = ['csv', 'json', 'txt', 'xlsx', 'xls', 'tsv', 'xml'];
    this.commonDateFormats = [
      'dd/MM/yyyy',
      'MM/dd/yyyy', 
      'yyyy-MM-dd',
      'dd-MM-yyyy',
      'MM-dd-yyyy'
    ];
  }

  // Parse CSV bank statement
  parseCSV(csvText, delimiter = ',') {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    
    const transactions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter);
      if (values.length === headers.length) {
        const transaction = this.mapTransaction(headers, values);
        if (transaction) transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Map transaction from parsed data
  mapTransaction(headers, values) {
    const transaction = {};
    
    // Common field mappings
    const fieldMappings = {
      date: ['date', 'transaction date', 'txn date', 'value date'],
      description: ['description', 'narration', 'particulars', 'details', 'transaction details'],
      amount: ['amount', 'debit', 'credit', 'transaction amount'],
      balance: ['balance', 'closing balance', 'available balance'],
      type: ['type', 'transaction type', 'dr/cr', 'debit/credit']
    };

    headers.forEach((header, index) => {
      const value = values[index]?.replace(/"/g, '').trim();
      
      // Map date
      if (fieldMappings.date.some(field => header.includes(field))) {
        transaction.date = this.parseDate(value);
      }
      
      // Map description
      if (fieldMappings.description.some(field => header.includes(field))) {
        transaction.description = value;
      }
      
      // Map amount
      if (fieldMappings.amount.some(field => header.includes(field))) {
        transaction.amount = this.parseAmount(value);
      }
      
      // Map balance
      if (fieldMappings.balance.some(field => header.includes(field))) {
        transaction.balance = this.parseAmount(value);
      }
      
      // Map type
      if (fieldMappings.type.some(field => header.includes(field))) {
        transaction.type = value.toLowerCase();
      }
    });

    // Validate required fields
    if (transaction.date && transaction.description && transaction.amount !== undefined) {
      return {
        id: this.generateId(),
        date: transaction.date,
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        type: this.determineTransactionType(transaction),
        category: this.categorizeTransaction(transaction.description),
        createdAt: Date.now()
      };
    }
    
    return null;
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    for (const format of this.commonDateFormats) {
      try {
        const parsed = parse(dateString, format, new Date());
        if (isValid(parsed)) {
          return parsed.getTime();
        }
      } catch (e) {
        continue;
      }
    }
    
    // Try native Date parsing as fallback
    const nativeDate = new Date(dateString);
    return isValid(nativeDate) ? nativeDate.getTime() : null;
  }

  parseAmount(amountString) {
    if (!amountString) return 0;
    
    // Remove currency symbols and spaces
    const cleaned = amountString.replace(/[₹$€£,\s]/g, '');
    const amount = parseFloat(cleaned);
    
    return isNaN(amount) ? 0 : amount;
  }

  determineTransactionType(transaction) {
    // Check if it's a debit or credit based on various indicators
    const desc = transaction.description?.toLowerCase() || '';
    const type = transaction.type?.toLowerCase() || '';
    
    // Credit indicators
    const creditKeywords = ['credit', 'deposit', 'salary', 'refund', 'interest', 'dividend'];
    const debitKeywords = ['debit', 'withdrawal', 'payment', 'purchase', 'fee', 'charge'];
    
    if (type.includes('cr') || type.includes('credit') || 
        creditKeywords.some(keyword => desc.includes(keyword))) {
      return 'income';
    }
    
    if (type.includes('dr') || type.includes('debit') || 
        debitKeywords.some(keyword => desc.includes(keyword))) {
      return 'expense';
    }
    
    // Default to expense if amount is positive (most bank statements show debits as positive)
    return transaction.amount > 0 ? 'expense' : 'income';
  }

  categorizeTransaction(description) {
    if (!description) return 'Other';
    
    const desc = description.toLowerCase();
    
    const categories = {
      'Food & Dining': ['restaurant', 'food', 'cafe', 'pizza', 'burger', 'swiggy', 'zomato', 'uber eats'],
      'Groceries': ['grocery', 'supermarket', 'mart', 'store', 'big bazaar', 'reliance', 'dmart'],
      'Transportation': ['uber', 'ola', 'taxi', 'metro', 'bus', 'petrol', 'fuel', 'parking'],
      'Shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'purchase'],
      'Bills & Utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone', 'recharge'],
      'Healthcare': ['hospital', 'medical', 'pharmacy', 'doctor', 'clinic', 'medicine'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment'],
      'Education': ['school', 'college', 'university', 'course', 'book', 'education'],
      'ATM': ['atm', 'cash withdrawal', 'withdrawal'],
      'Transfer': ['transfer', 'neft', 'rtgs', 'imps', 'upi']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Parse different file formats
  async parseFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    try {
      switch (extension) {
        case 'csv':
        case 'tsv':
          const csvText = await this.readFileAsText(file);
          return this.parseCSV(csvText, extension === 'tsv' ? '\t' : ',');
        case 'json':
          const jsonText = await this.readFileAsText(file);
          return this.parseJSON(jsonText);
        case 'txt':
          const txtText = await this.readFileAsText(file);
          return this.parseText(txtText);
        case 'xlsx':
        case 'xls':
          return await this.parseExcel(file);
        case 'xml':
          const xmlText = await this.readFileAsText(file);
          return this.parseXML(xmlText);
        default:
          // Try to auto-detect format
          const text = await this.readFileAsText(file);
          return this.autoDetectAndParse(text);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${extension.toUpperCase()} file: ${error.message}`);
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  parseJSON(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      if (Array.isArray(data)) {
        return data.map(item => this.mapTransaction(Object.keys(item), Object.values(item)));
      }
      return [];
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  }

  parseText(text) {
    // Basic text parsing - assumes tab or space separated values
    const lines = text.trim().split('\n');
    const transactions = [];
    
    for (const line of lines) {
      const parts = line.split(/\t|\s{2,}/).filter(part => part.trim());
      if (parts.length >= 3) {
        const transaction = {
          date: this.parseDate(parts[0]),
          description: parts[1],
          amount: this.parseAmount(parts[2])
        };
        
        if (transaction.date && transaction.description && transaction.amount) {
          transactions.push({
            id: this.generateId(),
            ...transaction,
            type: this.determineTransactionType(transaction),
            category: this.categorizeTransaction(transaction.description),
            createdAt: Date.now()
          });
        }
      }
    }
    
    return transactions;
  }

  // Parse Excel files
  async parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = this.readExcelData(data);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = this.excelToJson(worksheet);
          
          if (jsonData.length === 0) {
            resolve([]);
            return;
          }
          
          const headers = Object.keys(jsonData[0]).map(h => h.toLowerCase());
          const transactions = [];
          
          jsonData.forEach(row => {
            const values = headers.map(h => row[Object.keys(row).find(k => k.toLowerCase() === h)] || '');
            const transaction = this.mapTransaction(headers, values);
            if (transaction) transactions.push(transaction);
          });
          
          resolve(transactions);
        } catch (error) {
          reject(new Error('Invalid Excel file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Simple Excel parser (basic implementation)
  readExcelData(data) {
    // This is a simplified implementation
    // In a real app, you'd use a library like xlsx
    throw new Error('Excel parsing requires xlsx library. Please convert to CSV format.');
  }

  excelToJson(worksheet) {
    // Placeholder for Excel to JSON conversion
    return [];
  }

  // Parse XML files
  parseXML(xmlText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML format');
      }
      
      const transactions = [];
      const transactionNodes = xmlDoc.getElementsByTagName('transaction') || 
                              xmlDoc.getElementsByTagName('row') ||
                              xmlDoc.getElementsByTagName('record');
      
      for (let node of transactionNodes) {
        const transaction = this.parseXMLNode(node);
        if (transaction) transactions.push(transaction);
      }
      
      return transactions;
    } catch (error) {
      throw new Error('Failed to parse XML: ' + error.message);
    }
  }

  parseXMLNode(node) {
    const data = {};
    for (let child of node.children) {
      data[child.tagName.toLowerCase()] = child.textContent;
    }
    
    const headers = Object.keys(data);
    const values = Object.values(data);
    return this.mapTransaction(headers, values);
  }

  // Auto-detect file format and parse
  autoDetectAndParse(text) {
    // Try JSON first
    try {
      return this.parseJSON(text);
    } catch (e) {}
    
    // Try CSV
    try {
      if (text.includes(',')) {
        return this.parseCSV(text, ',');
      }
    } catch (e) {}
    
    // Try TSV
    try {
      if (text.includes('\t')) {
        return this.parseCSV(text, '\t');
      }
    } catch (e) {}
    
    // Try XML
    try {
      if (text.includes('<') && text.includes('>')) {
        return this.parseXML(text);
      }
    } catch (e) {}
    
    // Fallback to text parsing
    return this.parseText(text);
  }
}

export default TransactionParser;