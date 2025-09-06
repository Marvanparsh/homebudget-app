import { useState } from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { createBudget } from "../helpers";
import { toast } from "react-toastify";

const BUDGET_TEMPLATES = [
  {
    name: "Student Budget",
    budgets: [
      { name: "Food", amount: 300, category: "food" },
      { name: "Transportation", amount: 100, category: "transport" },
      { name: "Entertainment", amount: 150, category: "entertainment" },
      { name: "Books & Supplies", amount: 200, category: "other" }
    ]
  },
  {
    name: "Family Budget",
    budgets: [
      { name: "Groceries", amount: 600, category: "food" },
      { name: "Utilities", amount: 300, category: "bills" },
      { name: "Transportation", amount: 400, category: "transport" },
      { name: "Healthcare", amount: 200, category: "health" },
      { name: "Entertainment", amount: 250, category: "entertainment" }
    ]
  },
  {
    name: "Single Professional",
    budgets: [
      { name: "Dining Out", amount: 400, category: "food" },
      { name: "Rent & Utilities", amount: 1200, category: "bills" },
      { name: "Transportation", amount: 300, category: "transport" },
      { name: "Shopping", amount: 300, category: "shopping" },
      { name: "Savings", amount: 500, category: "other" }
    ]
  }
];

const BudgetTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const applyTemplate = (template) => {
    try {
      template.budgets.forEach(budget => {
        createBudget(budget);
      });
      toast.success(`${template.name} template applied!`);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to apply template");
    }
  };

  return (
    <div className="budget-templates">
      <h3><DocumentDuplicateIcon width={20} /> Budget Templates</h3>
      <p>Quick start with pre-made budget structures</p>
      
      <div className="template-grid">
        {BUDGET_TEMPLATES.map((template, index) => (
          <div key={index} className="template-card">
            <h4>{template.name}</h4>
            <div className="template-preview">
              {template.budgets.map((budget, i) => (
                <small key={i}>{budget.name}: ₹{budget.amount}</small>
              ))}
            </div>
            <button 
              className="btn btn--outline"
              onClick={() => applyTemplate(template)}
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetTemplates;