import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API = process.env.REACT_APP_BACKEND_URL;

export const useAdminExpenses = (username) => {
  const [hq, setHQ] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedOtherExpenseId, setSelectedOtherExpenseId] = useState(null);

  const currentMonth = dayjs().format("MMMM YYYY");

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const resUser = await axios.get(`${API}/api/admin/user/${username}`);
      setHQ(resUser.data.hq || "");
      setExpenses(resUser.data.expenses || []);

      const resOther = await axios.get(
        `${API}/api/admin/other-expenses/${username}`
      );
      setOtherExpenses(resOther.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update inline fields
  const updateExpense = async (expenseId, payload) => {
    try {
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, payload);
      setExpenses((prev) =>
        prev.map((exp) =>
          exp._id === expenseId ? { ...exp, ...payload } : exp
        )
      );
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  // Delete expenses
  const deleteExpense = async () => {
    if (!selectedRowId && !selectedOtherExpenseId) return;
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      if (selectedRowId) {
        await axios.delete(`${API}/api/admin/expense/${username}/${selectedRowId}`);
      } else if (selectedOtherExpenseId) {
        if (selectedOtherExpenseId.startsWith("group:")) {
          alert("Please expand and select an individual row to delete.");
          return;
        }
        await axios.delete(`${API}/api/admin/other-expense/${selectedOtherExpenseId}`);
      }
      fetchData();
      setSelectedRowId(null);
      setSelectedOtherExpenseId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const subtotal1 = expenses.reduce(
    (sum, e) =>
      sum + (e.fare || 0) + (e.da || 0) + (e.extraTA || 0) + (e.extraDA || 0),
    0
  );
  const subtotal2 = otherExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const grandTotal = subtotal1 + subtotal2;

  return {
    hq,
    expenses,
    otherExpenses,
    selectedRowId,
    setSelectedRowId,
    selectedOtherExpenseId,
    setSelectedOtherExpenseId,
    currentMonth,
    subtotal1,
    subtotal2,
    grandTotal,
    updateExpense,
    deleteExpense,
  };
};
