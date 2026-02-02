import { useState } from "react";

const MonthlySalaryDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="demo-prompt">
        <div className="demo-card">
          <h3>🎯 New Feature: Monthly Salary Budget</h3>
          <p>
            Solve the salary allocation problem! Instead of creating one budget for your entire salary, 
            now you can distribute it across multiple categories.
          </p>
          <button 
            className="btn btn--outline"
            onClick={() => setShowDemo(true)}
          >
            See How It Works
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-explanation">
      <div className="demo-header">
        <h3>How Monthly Salary Budget Works</h3>
        <button 
          className="btn btn--outline btn--small"
          onClick={() => setShowDemo(false)}
        >
          ✕ Close
        </button>
      </div>
      
      <div className="demo-steps">
        <div className="demo-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Enter Your Monthly Salary</h4>
            <p>Input your total salary amount (e.g., ₹50,000)</p>
            <div className="demo-example">
              <strong>Example:</strong> January 2024 - ₹50,000
            </div>
          </div>
        </div>
        
        <div className="demo-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Allocate Across Categories</h4>
            <p>Distribute your salary across different spending categories</p>
            <div className="demo-example">
              <div>🍽️ Food & Dining: ₹15,000</div>
              <div>🚗 Transportation: ₹8,000</div>
              <div>🛍️ Shopping: ₹10,000</div>
              <div>💡 Bills & Utilities: ₹12,000</div>
              <div>📦 Other: ₹5,000</div>
            </div>
          </div>
        </div>
        
        <div className="demo-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Individual Budgets Created</h4>
            <p>Each category becomes a separate budget you can track expenses against</p>
            <div className="demo-example">
              <div>✅ "January 2024 - Food & Dining" (₹15,000)</div>
              <div>✅ "January 2024 - Transportation" (₹8,000)</div>
              <div>✅ And so on...</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="demo-benefits">
        <h4>Benefits:</h4>
        <ul>
          <li>✅ No more "entire salary in one category" problem</li>
          <li>✅ Better expense tracking across categories</li>
          <li>✅ Clear monthly budget allocation</li>
          <li>✅ Easy to see where your money goes</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthlySalaryDemo;