// Bank API Service for Real Transaction Fetching
export class BankApiService {
  constructor() {
    this.studentMode = import.meta.env.VITE_STUDENT_MODE === 'true';
    this.finvuClientId = import.meta.env.VITE_FINVU_CLIENT_ID;
    this.finvuClientSecret = import.meta.env.VITE_FINVU_CLIENT_SECRET;
    this.baseUrl = this.studentMode ? 'https://sandbox-api.finvu.in/v1' : 'https://api.finvu.in/v1';
  }

  // Step 1: Get user consent for account access
  async initiateAccountLinking(userId) {
    const response = await fetch(`${this.baseUrl}/consent/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'X-Client-ID': this.finvuClientId
      },
      body: JSON.stringify({
        userId: userId,
        consentTypes: ['TRANSACTIONS'],
        dataRange: {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        },
        frequency: 'REALTIME'
      })
    });

    const data = await response.json();
    return {
      consentId: data.consentId,
      redirectUrl: data.redirectUrl
    };
  }

  // Step 2: Get access token
  async getAccessToken() {
    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.finvuClientId,
        client_secret: this.finvuClientSecret,
        grant_type: 'client_credentials'
      })
    });

    const data = await response.json();
    return data.access_token;
  }

  // Step 3: Fetch transactions (Student Mode: FREE)
  async fetchTransactions(userId, consentId) {
    if (this.studentMode) {
      // FREE mock data for students
      return this.generateMockUPITransactions();
    }
    
    const response = await fetch(`${this.baseUrl}/accounts/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'X-Consent-ID': consentId,
        'X-User-ID': userId
      }
    });

    const data = await response.json();
    return this.transformTransactions(data.transactions);
  }

  // FREE: Generate realistic UPI transactions for students
  generateMockUPITransactions() {
    const mockTransactions = [
      { desc: 'UPI-SWIGGY BANGALORE', amount: 450, cat: 'Food & Dining' },
      { desc: 'UPI-UBER TRIP', amount: 280, cat: 'Transportation' },
      { desc: 'UPI-AMAZON PAY', amount: 1200, cat: 'Shopping' },
      { desc: 'UPI-JIO RECHARGE', amount: 399, cat: 'Bills & Utilities' },
      { desc: 'UPI-NETFLIX SUBSCRIPTION', amount: 199, cat: 'Entertainment' }
    ];
    
    // Return 1-2 random transactions
    const count = Math.floor(Math.random() * 2) + 1;
    return mockTransactions.slice(0, count).map(tx => ({
      id: `student_upi_${Date.now()}_${Math.random()}`,
      date: Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
      description: tx.desc,
      amount: tx.amount,
      type: 'expense',
      category: tx.cat,
      createdAt: Date.now(),
      isAutoImported: true,
      isStudentMode: true
    }));
  }

  // Step 4: Transform API response
  transformTransactions(apiTransactions) {
    return apiTransactions.map(transaction => ({
      id: transaction.txnId || `txn_${Date.now()}_${Math.random()}`,
      date: new Date(transaction.valueDate).getTime(),
      description: transaction.narration || 'UPI Transaction',
      amount: Math.abs(parseFloat(transaction.amount)),
      type: transaction.type === 'CREDIT' ? 'income' : 'expense',
      category: this.categorizeUPITransaction(transaction.narration || ''),
      createdAt: Date.now(),
      isAutoImported: true
    }));
  }

  // Step 5: UPI categorization
  categorizeUPITransaction(narration) {
    const desc = narration.toLowerCase();
    
    const categories = {
      'Food & Dining': ['swiggy', 'zomato', 'uber eats', 'dominos'],
      'Transportation': ['uber', 'ola', 'metro', 'petrol'],
      'Shopping': ['amazon', 'flipkart', 'myntra'],
      'Bills & Utilities': ['jio', 'airtel', 'electricity'],
      'Entertainment': ['netflix', 'bookmyshow']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }
}

export default BankApiService;