import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import SetInfoPage from "./pages/SetInfoPage";
import AdminExpenseStatement from "./pages/AdminExpenseStatement";
import EditInfoPage from "./pages/EditInfoPage";
import ShowUserInfo from "./pages/ShowUserInfo"; // adjust path as needed
import ExpenseStatement from "./pages/ExpenseStatement";
import ModeSelector from "./pages/ModeSelector";
import FieldWorkPage from "./pages/FieldWorkPage";
import NonFieldWorkPage from "./pages/NonFieldWorkPage";
import NonWorkingDayPage from "./pages/NonWorkingDayPage";
import OtherExpensesPage from "./pages/OtherExpensespage";

// Temporary User Dashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/set-info" element={<SetInfoPage />} />
        <Route path="/admin/statement/:username" element={<AdminExpenseStatement />} />
        <Route path="/edit-info/:username" element={<EditInfoPage />} />
        <Route path="/show-info" element={<ShowUserInfo />} />
        <Route path="/expense-statement" element={<ExpenseStatement />} />
        <Route path="/mode-selector" element={<ModeSelector />} />
        <Route path="/field-work" element={<FieldWorkPage />} />
        <Route path="/non-field-work" element={<NonFieldWorkPage />} />
        <Route path="/non-working-day" element={<NonWorkingDayPage />} />
        <Route path="/other-expenses" element={<OtherExpensesPage />} />

      </Routes>
    </Router>
  );
}

export default App;
