

// pages/AdminExpenseStatement.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import LogTable from "../components/LogTable";
import OtherExpensesTable from "../components/AdminOtherExpensesTable"; // ✅ Corrected import name
import Layout from "../components/Layout";

const API = process.env.REACT_APP_BACKEND_URL;

const AdminExpenseStatement = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [hq, setHQ] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);

  const currentMonth = dayjs().format("MMMM YYYY");

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const resUser = await axios.get(`${API}/api/admin/user/${username}`, { headers });
      setHQ(resUser.data.hq || "");
      setExpenses(resUser.data.expenses || []);

      const resOther = await axios.get(
        `${API}/api/admin/other-expenses/${username}`, { headers }
      );
      setOtherExpenses(resOther.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Normal Expense Handlers ---
  const doSaveTA = async (expenseId, newValue) => {
    const expenseToUpdate = expenses.find((exp) => exp._id === expenseId);
    if (!expenseToUpdate) return;
    const newTotal = (expenseToUpdate.fare || 0) + (expenseToUpdate.da || 0) + (Number(newValue) || 0) + (expenseToUpdate.extraDA || 0);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { extraTA: newValue, total: newTotal }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, extraTA: newValue, total: newTotal } : exp));
    } catch (error) { console.error("Error updating extraTA:", error); }
  };

  const doSaveDA = async (expenseId, newValue) => {
    const expenseToUpdate = expenses.find((exp) => exp._id === expenseId);
    if (!expenseToUpdate) return;
    const newTotal = (expenseToUpdate.fare || 0) + (expenseToUpdate.da || 0) + (expenseToUpdate.extraTA || 0) + (Number(newValue) || 0);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { extraDA: newValue, total: newTotal }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, extraDA: newValue, total: newTotal } : exp));
    } catch (error) { console.error("Error updating extraDA:", error); }
  };

  const doSaveTADesc = async (expenseId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { taDesc: newValue }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, taDesc: newValue } : exp));
    } catch (error) { console.error("Error updating TA Desc:", error); }
  };

  const doSaveDADesc = async (expenseId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { daDesc: newValue }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, daDesc: newValue } : exp));
    } catch (error) { console.error("Error updating DA Desc:", error); }
  };

  // ✅ --- NEW: Handlers for Other Expenses ---
  const doSaveOtherExpenseExtraAmount = async (expenseId, newAmount) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API}/api/admin/other-expense/${expenseId}`, {
        extraamount: newAmount,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setOtherExpenses(prev => prev.map(exp =>
        exp._id === expenseId ? data.expense : exp
      ));
    } catch (err) {
      console.error("Error updating other expense amount:", err);
    }
  };

  const doSaveOtherExpenseExtraDescription = async (expenseId, newDescription) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API}/api/admin/other-expense/${expenseId}`, {
        extradescription: newDescription,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setOtherExpenses(prev => prev.map(exp =>
        exp._id === expenseId ? data.expense : exp
      ));
    } catch (err) {
      console.error("Error updating other expense description:", err);
    }
  };

  // Totals calculation
  const subtotal1 = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const subtotal2 = otherExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const grandTotal = subtotal1 + subtotal2;

  return (
    <Layout title={`Expense Statement - ${username}`} backTo="/admin/dashboard">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xl font-bold text-[#1f3b64] mb-2">
              Username:{" "}
              <span className="font-normal text-gray-700">{username}</span>
            </p>
            <p className="text-lg text-gray-700">
              HQ:{" "}
              <span className="font-semibold uppercase text-[#1f3b64]">
                {hq}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Month:{" "}
              <span className="font-semibold text-[#1f3b64]">{currentMonth}</span>
            </p>
            <p className="text-lg text-gray-700 mt-1">
              Grand Total:{" "}
              <span className="font-bold text-green-600 text-xl">
                ₹ {grandTotal.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
          <div className="flex gap-4">
            
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow font-medium"
              onClick={async () => {
                const confirmDelete = window.confirm(
                  `Are you sure you want to delete user "${username}"?`
                );
                if (!confirmDelete) return;

                try {
                  const token = localStorage.getItem("token");
                  const headers = { Authorization: `Bearer ${token}` };
                  await axios.delete(`${API}/api/admin/user/${username}`, {
                    headers,
                  });
                  alert("User deleted successfully.");
                  navigate("/admin/dashboard");
                } catch (error) {
                  console.error("Failed to delete user", error);
                  alert("Error deleting user.");
                }
              }}
            >
              🗑️ Delete User
            </button>
          </div>
        </div>

        {/* Normal Expenses */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-xl mb-3 text-[#1f3b64]">Normal Expenses</h2>
          <LogTable
            expenses={expenses}
            onSaveTA={doSaveTA}
            onSaveDA={doSaveDA}
            onEditTADesc={doSaveTADesc}
            onEditDADesc={doSaveDADesc}
            onEditLocationDesc={(id) =>
              console.log("Edit Location Desc for", id)
            }
          />
          <p className="mt-3 font-semibold text-right text-lg">
            Subtotal 1:{" "}
            <span className="font-bold text-blue-600">
              ₹ {subtotal1.toLocaleString("en-IN")}
            </span>
          </p>
        </div>

        {/* Other Expenses */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-xl mb-3 text-[#1f3b64]">Other Expenses</h2>
          
          <OtherExpensesTable
            otherExpenses={otherExpenses}
            onSaveExtraAmount={doSaveOtherExpenseExtraAmount}
            onSaveExtraDescription={doSaveOtherExpenseExtraDescription}
          />

          <p className="mt-3 font-semibold text-right text-lg">
            Subtotal 2:{" "}
            <span className="font-bold text-blue-600">
              ₹ {subtotal2.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminExpenseStatement;









