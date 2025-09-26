// rrd imports
import { redirect } from "react-router-dom";

// library
import { toast } from "react-toastify";

export async function logoutAction() {
  // Remove current user session
  localStorage.removeItem('currentUser');
  toast.success("You've been logged out successfully!");

  // Force immediate redirect and refresh
  setTimeout(() => {
    window.location.href = '/welcome';
  }, 500);

  return redirect("/welcome");
}

// Separate action for deleting account and all data
export async function deleteAccountAction() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Remove user from users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter(user => user.id !== currentUser.id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Remove user's data
    localStorage.removeItem('currentUser');
    localStorage.removeItem(`budgets_${currentUser.id}`);
    localStorage.removeItem(`expenses_${currentUser.id}`);
    localStorage.removeItem(`recurringExpenses_${currentUser.id}`);
    
    toast.success("Your account and all data have been deleted!");
  } catch (error) {
    console.error('Error during account deletion:', error);
    toast.error("An error occurred while deleting your account");
  }
  
  return redirect("/welcome");
}