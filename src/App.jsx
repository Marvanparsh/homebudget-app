import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Library
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import SyncIndicator from "./components/SyncIndicator";

// Contexts
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts
import Main, { mainLoader } from "./layouts/Main";

// Wrapper component for ScrollToTop
const AppWithScrollToTop = () => {
  return (
    <>
      <ScrollToTop />
      <Main />
    </>
  );
};

// Actions
import { logoutAction, deleteAccountAction } from "./actions/logout";
import { deleteBudget } from "./actions/deleteBudget";
import { loginAction, signupAction } from "./actions/authActions";

// Routes
import Dashboard, { dashboardAction, dashboardLoader } from "./pages/Dashboard";
import Error from "./pages/Error";
import BudgetPage, { budgetAction, budgetLoader } from "./pages/BudgetPage";
import ExpensesPage, {
  expensesAction,
  expensesLoader,
} from "./pages/ExpensesPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <Error />,
  },
  {
    path: "/welcome",
    element: <Landing />,
    errorElement: <Error />,
  },
  {
    path: "/login",
    element: <Login />,
    action: loginAction,
    errorElement: <Error />,
  },
  {
    path: "/signup",
    element: <Signup />,
    action: signupAction,
    errorElement: <Error />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
    errorElement: <Error />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
    errorElement: <Error />,
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppWithScrollToTop />
      </ProtectedRoute>
    ),
    loader: mainLoader,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: dashboardLoader,
        action: dashboardAction,
        errorElement: <Error />,
      },
      {
        path: "budget/:id",
        element: <BudgetPage />,
        loader: budgetLoader,
        action: budgetAction,
        errorElement: <Error />,
        children: [
          {
            path: "delete",
            action: deleteBudget,
          },
        ],
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
        loader: expensesLoader,
        action: expensesAction,
        errorElement: <Error />,
      },
      {
        path: "logout",
        action: logoutAction,
      },
      {
        path: "delete-account",
        action: deleteAccountAction,
      },

    ],
  },
], {
  basename: import.meta.env.PROD ? '/homebudget-app' : '/'
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <div className="App">
            <RouterProvider router={router} />
            <ToastContainer />
            <SyncIndicator />
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
