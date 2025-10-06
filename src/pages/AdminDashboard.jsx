
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const API = process.env.REACT_APP_BACKEND_URL;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [expenseTotals, setExpenseTotals] = useState({});
  const [monthlyTotals, setMonthlyTotals] = useState({});
  const [lastReported, setLastReported] = useState({});


  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const adminUsername = payload.username;

        const headers = { headers: { Authorization: `Bearer ${token}` } };

        const usersRes = await axios.get(`${API}/api/admin/users`, headers);

        const filteredUsers = usersRes.data.filter(
          (user) => user.createdBy === adminUsername
        );
        setUsers(filteredUsers);

        if (filteredUsers.length === 0) return;

        const expensePromises = filteredUsers.map((user) => {
          const normalExpensesPromise = axios.get(
            `${API}/api/admin/normal-expenses/${user.username}`,
            headers
          );
          const otherExpensesPromise = axios.get(
            `${API}/api/admin/other-expenses/${user.username}`,
            headers
          );
          return Promise.all([normalExpensesPromise, otherExpensesPromise]);
        });

//         const lastReportedPromises = filteredUsers.map((user) =>
//   axios.get(`${API}/api/admin/last-reported/${user.username}`, headers)
// );

// const lastReportedResults = await Promise.all(lastReportedPromises);

// const lastReportedMap = {};
// filteredUsers.forEach((user, i) => {
//   lastReportedMap[user.username] = lastReportedResults[i].data.lastReported;
// });

// setLastReported(lastReportedMap);


        // const allUsersExpenses = await Promise.all(expensePromises);

        // const totals = {};
        // filteredUsers.forEach((user, index) => {
        //   const [normalExpensesRes, otherExpensesRes] = allUsersExpenses[index];

        //   const normalTotal = normalExpensesRes.data.reduce(
        //     (sum, exp) => sum + exp.total,
        //     0
        //   );
        //   const otherTotal = otherExpensesRes.data.reduce(
        //     (sum, exp) => sum + exp.total,
        //     0
        //   );

        //   totals[user.username] = normalTotal + otherTotal;
        // });

        // setExpenseTotals(totals);
        const allUsersExpenses = await Promise.all(expensePromises);

const totals = {};
const lastReportedMap = {};

// filteredUsers.forEach((user, index) => {
//   const [normalExpensesRes, otherExpensesRes] = allUsersExpenses[index];
//   const normalExpenses = normalExpensesRes.data || [];
//   const otherExpenses = otherExpensesRes.data || [];

//   // --- Total expense = normal + other ---
//   const normalTotal = normalExpenses.reduce((sum, exp) => sum + exp.total, 0);
//   const otherTotal = otherExpenses.reduce((sum, exp) => sum + exp.total, 0);
//   totals[user.username] = normalTotal + otherTotal;


// Inside useEffect after fetching users
const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const monthlyTotalsMap = {};

// For each user
filteredUsers.forEach((user, i) => {
  const [normalExpensesRes, otherExpensesRes] = allUsersExpenses[i];
  const normalExpenses = normalExpensesRes.data || [];
  const otherExpenses = otherExpensesRes.data || [];

  // Group expenses by month-year
  const allExpenses = [...normalExpenses, ...otherExpenses];

  const monthlyTotals = {};

  allExpenses.forEach((exp) => {
    if (!exp.date) return;
    // convert dd/mm/yyyy to "MMM-YYYY"
    const [day, mon, yr] = exp.date.split("/");
    const monthName = monthNames[Number(mon) - 1];
    const key = `${monthName}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + (exp.total || 0);
  });

  // For tick/cross, check user.months for approval
  const monthlyStatus = {};
  Object.entries(monthlyTotals).forEach(([monthKey, total]) => {
    const approvedMonth = (user.months || []).find(
      (m) => m.month === monthKey && m.total === total && m.approved
    );
    monthlyStatus[monthKey] = approvedMonth ? "tick" : "cross";
  });

  monthlyTotalsMap[user.username] = { totals: monthlyTotals, status: monthlyStatus };




  // --- Find last reported date (only from normal expenses) ---
  const normalDates = normalExpenses.map((exp) => exp.date).filter(Boolean);

  if (normalDates.length > 0) {
    const latestDate = normalDates.reduce((latest, current) => {
      const latestTime = new Date(latest.split("/").reverse().join("-")).getTime();
      const currentTime = new Date(current.split("/").reverse().join("-")).getTime();
      return currentTime > latestTime ? current : latest;
    });
    lastReportedMap[user.username] = latestDate;
  } else {
    lastReportedMap[user.username] = null;
  }
});

setMonthlyTotals(monthlyTotalsMap);
setExpenseTotals(totals);
setLastReported(lastReportedMap);

      } catch (err) {
        console.error(err);
        alert("Failed to fetch user data or expenses");
      }
    };

    fetchAllData();
  }, [navigate]);

  

  // --- NEW: DELETE HANDLER FUNCTION ---
  const handleDeleteUser = async (username) => {
    // 1. Confirm the action with the admin
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${username}"?`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      // 2. Send the delete request to the API
      await axios.delete(`${API}/api/admin/user/${username}`, { headers });

      // 3. Update the UI instantly by removing the user from the state
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.username !== username)
      );
      
      alert("User deleted successfully.");

    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Error deleting user.");
    }
  };

  return (
    <Layout title="Admin Dashboard" backTo="/">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate("/set-info")}
          className="bg-[#1f3b64] text-white px-6 py-2 rounded-lg shadow hover:bg-[#3E518E] transition"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-[#1f3b64] mb-4 border-b pb-2">
          User List
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={user._id}
                className="bg-gray-100 shadow-sm rounded-lg p-4 transition flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#1f3b64] font-bold">{index + 1}.</span>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1f3b64]">
                      {user.username}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {user.hq || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
  Last Reported: {lastReported[user.username] || "N/A"}
</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
  <p className="text-xs text-gray-500 uppercase font-semibold">Monthly Exp</p>
  {monthlyTotals[user.username] ? (
    Object.entries(monthlyTotals[user.username].totals).map(([month, total]) => (
      <p key={month} className="text-sm">
        {month}: ₹{total.toLocaleString("en-IN")}{" "}
        {monthlyTotals[user.username].status[month] === "tick" ? "✅" : "❌"}
      </p>
    ))
  ) : (
    <p>...</p>
  )}
</div>


                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/statement/${user.username}`)
                      }
                      className="bg-gray-700 text-white px-4 py-1 rounded-md shadow-sm hover:bg-gray-800 text-sm"
                    >
                      Show Exp
                    </button>
                    <button
                      onClick={() => navigate(`/edit-info/${user.username}`)}
                      className="bg-blue-600 text-white px-4 py-1 rounded-md shadow-sm hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    
                    {/* --- NEW: DELETE BUTTON --- */}
                    <button
                      onClick={() => handleDeleteUser(user.username)}
                      className="bg-red-600 text-white px-4 py-1 rounded-md shadow-sm hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No users created by you have been found.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;