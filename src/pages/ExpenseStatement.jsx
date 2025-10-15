import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import UserLogTable from "../components/UserLogTable";
import UserOtherExpensesTable from "../components/UserOtherExpensesTable";

const API = process.env.REACT_APP_BACKEND_URL;

const ExpenseStatement = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // User Info
        const userRes = await axios.get(`${API}/api/user/info`, { headers });
        setUserInfo(userRes.data);

        // Normal Expenses
        const expenseRes = await axios.get(
          `${API}/api/user/expenses?month=${selectedMonth}&year=${selectedYear}`,
          { headers }
        );
        setExpenses(expenseRes.data || []);

        // Other Expenses
        const otherRes = await axios.get(
          `${API}/api/user/other-expenses?month=${selectedMonth}&year=${selectedYear}`,
          { headers }
        );
        setOtherExpenses(otherRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Totals
  const normalTotal = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const otherTotal = otherExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const grandTotal = normalTotal + otherTotal;

  const showDateDesc = (date) => {};
  const showTADesc = (expenseId) => {};
  const showDADesc = (expenseId) => {};

  const currentMonthLabel = new Date(
    selectedYear,
    selectedMonth - 1
  ).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <Layout title="Expense Statement" backTo="/mode-selector">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Expense Statement
            </h1>
            {userInfo && (
              <div className="text-gray-700 text-sm space-y-1">
                <p>
                  <strong>Username:</strong> {userInfo.username}
                </p>
                <p>
                  <strong>HQ:</strong> {userInfo.hq}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Month:</strong>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 3 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const monthNum = date.getMonth() + 1;
                      const monthName = date.toLocaleString("default", {
                        month: "long",
                      });
                      return (
                        <option key={monthNum} value={monthNum}>
                          {monthName}
                        </option>
                      );
                    }).reverse()}
                  </select>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* General Expenses Table */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            General Expenses
          </h2>
          <UserLogTable
            expenses={expenses}
            showDateDesc={showDateDesc}
            showTADesc={showTADesc}
            showDADesc={showDADesc}
          />
          {expenses.length > 0 && (
            <div className="text-right font-bold text-lg mt-4 border-t pt-2">
              Subtotal 1: ₹{normalTotal.toLocaleString("en-IN")}
            </div>
          )}
        </div>

        {/* Other Expenses Table */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Other Expenses
          </h2>
          {otherExpenses.length === 0 ? (
            <p className="text-gray-500">No other expenses recorded.</p>
          ) : (
            <>
              <UserOtherExpensesTable otherExpenses={otherExpenses} />
              <div className="text-right font-bold text-lg mt-4 border-t pt-2">
                Subtotal 2: ₹{otherTotal.toLocaleString("en-IN")}
              </div>
            </>
          )}
        </div>

        {/* Grand Total at bottom */}
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-green-700 border-t pt-4">
            Grand Total: ₹{grandTotal.toLocaleString("en-IN")}
          </h2>
        </div>
      </div>
    </Layout>
  );
};

export default ExpenseStatement;
