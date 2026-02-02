// Test file to verify monthly salary budget functionality
import { createMonthlySalaryBudget, fetchUserData, setUserData, BUDGET_CATEGORIES } from '../helpers.js';

// Mock localStorage for testing
const mockLocalStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  clear: function() {
    this.data = {};
  }
};

// Replace localStorage with mock
global.localStorage = mockLocalStorage;

// Mock current user
localStorage.setItem('currentUser', JSON.stringify({ id: 'test-user-123' }));

// Test function
function testMonthlySalaryBudget() {
  console.log('🧪 Testing Monthly Salary Budget Functionality...\n');
  
  try {
    // Clear existing data
    localStorage.clear();
    localStorage.setItem('currentUser', JSON.stringify({ id: 'test-user-123' }));
    
    // Test 1: Create monthly salary budget
    console.log('Test 1: Creating monthly salary budget...');
    const allocations = {
      food: 15000,
      transport: 8000,
      shopping: 10000,
      bills: 12000,
      other: 5000
    };
    
    createMonthlySalaryBudget({
      monthYear: '2024-01',
      totalSalary: 50000,
      allocations: allocations
    });
    
    const budgets = fetchUserData('budgets');
    console.log('✅ Created budgets:', budgets.length);
    
    // Verify budgets were created correctly
    const expectedBudgets = [
      { name: '2024-01 - Food & Dining', amount: 15000, category: 'food' },
      { name: '2024-01 - Transportation', amount: 8000, category: 'transport' },
      { name: '2024-01 - Shopping', amount: 10000, category: 'shopping' },
      { name: '2024-01 - Bills & Utilities', amount: 12000, category: 'bills' },
      { name: '2024-01 - Other', amount: 5000, category: 'other' }
    ];
    
    expectedBudgets.forEach(expected => {
      const found = budgets.find(b => b.name === expected.name);
      if (found && found.amount === expected.amount && found.category === expected.category) {
        console.log(`✅ ${expected.name}: ₹${expected.amount}`);
      } else {
        console.log(`❌ ${expected.name}: Expected ₹${expected.amount}, got ${found ? '₹' + found.amount : 'not found'}`);
      }
    });
    
    // Test 2: Verify total allocation
    const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    if (totalBudgetAmount === 50000) {
      console.log('✅ Total allocation matches salary: ₹50,000');
    } else {
      console.log(`❌ Total allocation mismatch: Expected ₹50,000, got ₹${totalBudgetAmount}`);
    }
    
    // Test 3: Test validation (should fail)
    console.log('\nTest 3: Testing validation...');
    try {
      createMonthlySalaryBudget({
        monthYear: '2024-02',
        totalSalary: 40000,
        allocations: { food: 20000, transport: 25000 } // Total > salary
      });
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Validation correctly failed:', error.message);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testMonthlySalaryBudget();
}

export { testMonthlySalaryBudget };