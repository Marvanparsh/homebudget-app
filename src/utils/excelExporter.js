// Excel Export Utility
export class ExcelExporter {
  constructor() {
    this.workbook = null;
  }

  // Export data to Excel format
  exportToExcel(budgets, expenses, filename = 'budget-data') {
    try {
      // Create workbook data
      const workbookData = this.createWorkbookData(budgets, expenses);
      
      // Create and download Excel file
      this.downloadExcelFile(workbookData, filename);
      
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error('Failed to export Excel file: ' + error.message);
    }
  }

  createWorkbookData(budgets, expenses) {
    const workbook = {
      SheetNames: ['Budgets', 'Expenses', 'Summary'],
      Sheets: {}
    };

    // Create Budgets sheet
    workbook.Sheets['Budgets'] = this.createBudgetsSheet(budgets, expenses);
    
    // Create Expenses sheet
    workbook.Sheets['Expenses'] = this.createExpensesSheet(expenses, budgets);
    
    // Create Summary sheet
    workbook.Sheets['Summary'] = this.createSummarySheet(budgets, expenses);

    return workbook;
  }

  createBudgetsSheet(budgets, expenses) {
    const data = [
      ['Budget Name', 'Allocated Amount', 'Spent Amount', 'Remaining', 'Percentage Used', 'Status']
    ];

    budgets.forEach(budget => {
      const budgetExpenses = expenses.filter(expense => expense.budgetId === budget.id);
      const spent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount * 100).toFixed(1) : 0;
      const status = spent > budget.amount ? 'Over Budget' : 
                    spent > budget.amount * 0.8 ? 'Near Limit' : 'On Track';

      data.push([
        budget.name,
        budget.amount,
        spent,
        remaining,
        percentage + '%',
        status
      ]);
    });

    return this.arrayToSheet(data);
  }

  createExpensesSheet(expenses, budgets) {
    const data = [
      ['Date', 'Expense Name', 'Amount', 'Budget Category', 'Month', 'Year']
    ];

    expenses
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(expense => {
        const budget = budgets.find(b => b.id === expense.budgetId);
        const date = new Date(expense.createdAt);
        
        data.push([
          date.toLocaleDateString(),
          expense.name,
          expense.amount,
          budget ? budget.name : 'Unknown',
          date.toLocaleDateString('en-US', { month: 'long' }),
          date.getFullYear()
        ]);
      });

    return this.arrayToSheet(data);
  }

  createSummarySheet(budgets, expenses) {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalRemaining = totalBudget - totalSpent;

    // Monthly breakdown
    const monthlyData = this.getMonthlyBreakdown(expenses);
    
    // Category breakdown
    const categoryData = this.getCategoryBreakdown(budgets, expenses);

    const data = [
      ['BUDGET SUMMARY'],
      [''],
      ['Total Budget Allocated', totalBudget],
      ['Total Amount Spent', totalSpent],
      ['Total Remaining', totalRemaining],
      ['Overall Usage', totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) + '%' : '0%'],
      [''],
      ['MONTHLY BREAKDOWN'],
      ['Month', 'Amount Spent'],
      ...monthlyData,
      [''],
      ['CATEGORY BREAKDOWN'],
      ['Category', 'Budget', 'Spent', 'Remaining'],
      ...categoryData,
      [''],
      ['Report Generated', new Date().toLocaleString()],
      ['Total Budgets', budgets.length],
      ['Total Expenses', expenses.length]
    ];

    return this.arrayToSheet(data);
  }

  getMonthlyBreakdown(expenses) {
    const monthly = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthly[monthYear] = (monthly[monthYear] || 0) + expense.amount;
    });

    return Object.entries(monthly)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([month, amount]) => [month, amount]);
  }

  getCategoryBreakdown(budgets, expenses) {
    return budgets.map(budget => {
      const budgetExpenses = expenses.filter(expense => expense.budgetId === budget.id);
      const spent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remaining = budget.amount - spent;
      
      return [budget.name, budget.amount, spent, remaining];
    });
  }

  arrayToSheet(data) {
    const sheet = {};
    const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    for (let R = 0; R < data.length; R++) {
      for (let C = 0; C < data[R].length; C++) {
        if (range.s.r > R) range.s.r = R;
        if (range.s.c > C) range.s.c = C;
        if (range.e.r < R) range.e.r = R;
        if (range.e.c < C) range.e.c = C;

        const cell = { v: data[R][C] };
        
        if (cell.v == null) continue;
        
        const cellRef = this.encodeCell({ c: C, r: R });
        
        if (typeof cell.v === 'number') {
          cell.t = 'n';
        } else if (typeof cell.v === 'boolean') {
          cell.t = 'b';
        } else {
          cell.t = 's';
        }
        
        sheet[cellRef] = cell;
      }
    }
    
    if (range.s.c < 10000000) sheet['!ref'] = this.encodeRange(range);
    return sheet;
  }

  encodeCell(cell) {
    return this.encodeCol(cell.c) + this.encodeRow(cell.r);
  }

  encodeCol(col) {
    let s = '';
    for (++col; col; col = Math.floor((col - 1) / 26)) {
      s = String.fromCharCode(((col - 1) % 26) + 65) + s;
    }
    return s;
  }

  encodeRow(row) {
    return (row + 1).toString();
  }

  encodeRange(range) {
    return this.encodeCell(range.s) + ':' + this.encodeCell(range.e);
  }

  downloadExcelFile(workbook, filename) {
    // Convert workbook to CSV format (simplified Excel export)
    const csvData = this.workbookToCSV(workbook);
    
    // Create blob and download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename + '.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  workbookToCSV(workbook) {
    let csvContent = '';
    
    workbook.SheetNames.forEach((sheetName, index) => {
      if (index > 0) csvContent += '\n\n';
      csvContent += `=== ${sheetName} ===\n`;
      csvContent += this.sheetToCSV(workbook.Sheets[sheetName]);
    });
    
    return csvContent;
  }

  sheetToCSV(sheet) {
    const range = this.decodeRange(sheet['!ref'] || 'A1:A1');
    let csv = '';
    
    for (let R = range.s.r; R <= range.e.r; R++) {
      let row = '';
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = this.encodeCell({ c: C, r: R });
        const cell = sheet[cellRef];
        const value = cell ? cell.v : '';
        
        if (C > range.s.c) row += ',';
        row += this.escapeCSV(value);
      }
      csv += row + '\n';
    }
    
    return csv;
  }

  decodeRange(range) {
    const parts = range.split(':');
    return {
      s: this.decodeCell(parts[0]),
      e: this.decodeCell(parts[1] || parts[0])
    };
  }

  decodeCell(cell) {
    const match = cell.match(/^([A-Z]+)(\d+)$/);
    return {
      c: this.decodeCol(match[1]),
      r: parseInt(match[2]) - 1
    };
  }

  decodeCol(col) {
    let result = 0;
    for (let i = 0; i < col.length; i++) {
      result = result * 26 + (col.charCodeAt(i) - 64);
    }
    return result - 1;
  }

  escapeCSV(value) {
    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }
}

export default ExcelExporter;