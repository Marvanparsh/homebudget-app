import { toast } from "react-toastify";

export const exportData = () => {
  try {
    const data = {
      userName: localStorage.getItem("userName"),
      budgets: JSON.parse(localStorage.getItem("budgets") || "[]"),
      expenses: JSON.parse(localStorage.getItem("expenses") || "[]"),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  } catch (error) {
    toast.error("Failed to export data");
  }
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.userName) localStorage.setItem("userName", data.userName);
        if (data.budgets) localStorage.setItem("budgets", JSON.stringify(data.budgets));
        if (data.expenses) localStorage.setItem("expenses", JSON.stringify(data.expenses));
        
        toast.success("Data imported successfully!");
        resolve();
      } catch (error) {
        toast.error("Invalid file format");
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};