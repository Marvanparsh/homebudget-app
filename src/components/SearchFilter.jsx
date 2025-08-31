import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

const SearchFilter = ({ onSearch, onFilter, budgets = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [dateRange, setDateRange] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilter = (budget, date) => {
    onFilter({ budget, date });
  };

  return (
    <div className="search-filter">
      <div className="search-box">
        <MagnifyingGlassIcon width={20} />
        <input
          id="expense-search"
          type="search"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      <div className="filters">
        <select
          value={selectedBudget}
          onChange={(e) => {
            setSelectedBudget(e.target.value);
            handleFilter(e.target.value, dateRange);
          }}
        >
          <option value="">All Budgets</option>
          {budgets.map(budget => (
            <option key={budget.id} value={budget.id}>{budget.name}</option>
          ))}
        </select>
        
        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            handleFilter(selectedBudget, e.target.value);
          }}
        >
          <option value="">All Time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;