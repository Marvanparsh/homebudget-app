import { toast } from "react-toastify";
import { fetchData, fetchUserData, setUserData } from "../helpers";

export const exportData = () => {
  try {
    const currentUser = fetchData("currentUser");
    if (!currentUser) {
      toast.error("No user logged in");
      return;
    }
    
    const data = {
      user: currentUser,
      budgets: fetchUserData("budgets") || [],
      expenses: fetchUserData("expenses") || [],
      recurringExpenses: fetchUserData("recurringExpenses") || [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-data-${currentUser.fullName}-${new Date().toISOString().split('T')[0]}.json`;
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
        
        const currentUser = fetchData("currentUser");
        if (!currentUser) {
          toast.error("No user logged in");
          reject(new Error("No user logged in"));
          return;
        }
        
        if (data.budgets) setUserData("budgets", data.budgets);
        if (data.expenses) setUserData("expenses", data.expenses);
        if (data.recurringExpenses) setUserData("recurringExpenses", data.recurringExpenses);
        
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