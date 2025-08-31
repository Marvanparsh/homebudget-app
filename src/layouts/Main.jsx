// rrd imports
import { Outlet, useLoaderData, useLocation } from "react-router-dom";
import { useMemo } from "react";

// assets
import wave from "../assets/wave.svg";

// components
import Nav from "../components/Nav";
import AchievementSystem from "../components/AchievementSystem";

//  helper functions
import { fetchData, fetchUserData } from "../helpers"

// loader
export function mainLoader() {
  const currentUser = fetchData("currentUser");
  const budgets = fetchUserData("budgets");
  const expenses = fetchUserData("expenses");
  return { currentUser, budgets, expenses }
}

const Main = () => {
  const { currentUser, budgets, expenses } = useLoaderData()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Memoize fallback arrays to prevent unnecessary re-renders
  const memoizedExpenses = useMemo(() => expenses || [], [expenses]);
  const memoizedBudgets = useMemo(() => budgets || [], [budgets]);

  return (
    <div className="layout">
      <Nav currentUser={currentUser} />
      <main>
        <Outlet />
      </main>
      {currentUser && isHomePage && (
        <div className="achievements-overlay">
          <AchievementSystem expenses={memoizedExpenses} budgets={memoizedBudgets} />
        </div>
      )}
      <img src={wave} alt="Decorative wave pattern" />
    </div>
  )
}
export default Main