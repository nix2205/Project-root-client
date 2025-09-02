
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; // Restored the correct import

const API = process.env.REACT_APP_BACKEND_URL;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [expenseTotals, setExpenseTotals] = useState({});
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

        const allUsersExpenses = await Promise.all(expensePromises);

        const totals = {};
        filteredUsers.forEach((user, index) => {
          const [normalExpensesRes, otherExpensesRes] = allUsersExpenses[index];
          
          const normalTotal = normalExpensesRes.data.reduce(
            (sum, exp) => sum + exp.total,
            0
          );
          const otherTotal = otherExpensesRes.data.reduce(
            (sum, exp) => sum + exp.total,
            0
          );
          
          totals[user.username] = normalTotal + otherTotal;
        });

        setExpenseTotals(totals);

      } catch (err) {
        console.error(err);
        alert("Failed to fetch user data or expenses");
      }
    };

    fetchAllData();
  }, [navigate]);

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
                      (HQ: {user.hq || "N/A"})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Exp</p>
                    <p className="text-lg font-bold text-green-600">
                      {expenseTotals[user.username] !== undefined
                        ? `₹${expenseTotals[user.username].toLocaleString("en-IN")}`
                        : "..."}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/edit-info/${user.username}`)}
                      className="bg-blue-600 text-white px-4 py-1 rounded-md shadow-sm hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/statement/${user.username}`)}
                      className="bg-gray-700 text-white px-4 py-1 rounded-md shadow-sm hover:bg-gray-800 text-sm"
                    >
                      Show Exp
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No users created by you have been found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;

