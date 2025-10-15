// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Layout from "../components/Layout";

// const API = process.env.REACT_APP_BACKEND_URL;

// function AdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const [expenseTotals, setExpenseTotals] = useState({});
//   const [monthlyTotals, setMonthlyTotals] = useState({});
//   const [lastReported, setLastReported] = useState({});

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate("/");
//           return;
//         }

//         const payload = JSON.parse(atob(token.split(".")[1]));
//         const adminUsername = payload.username;
//         const headers = { headers: { Authorization: `Bearer ${token}` } };

//         // Fetch all users created by this admin
//         const usersRes = await axios.get(`${API}/api/admin/users`, headers);
//         const filteredUsers = usersRes.data.filter(
//           (user) => user.createdBy === adminUsername
//         );
//         setUsers(filteredUsers);

//         if (filteredUsers.length === 0) return;

//         // Fetch normal and other expenses for each user
//         const expensePromises = filteredUsers.map((user) => {
//           const normalExpensesPromise = axios.get(
//             `${API}/api/admin/normal-expenses/${user.username}`,
//             headers
//           );
//           const otherExpensesPromise = axios.get(
//             `${API}/api/admin/other-expenses/${user.username}`,
//             headers
//           );
//           return Promise.all([normalExpensesPromise, otherExpensesPromise]);
//         });

//         const allUsersExpenses = await Promise.all(expensePromises);

//         const totals = {};
//         const lastReportedMap = {};
//         const monthlyTotalsMap = {};

//         const monthNames = [
//           "JAN",
//           "FEB",
//           "MAR",
//           "APR",
//           "MAY",
//           "JUN",
//           "JUL",
//           "AUG",
//           "SEP",
//           "OCT",
//           "NOV",
//           "DEC",
//         ];

//         filteredUsers.forEach((user, i) => {
//           const [normalExpensesRes, otherExpensesRes] = allUsersExpenses[i];
//           const normalExpenses = normalExpensesRes.data || [];
//           const otherExpenses = otherExpensesRes.data || [];

//           // --- Total expense = normal + other ---
//           const normalTotal = normalExpenses.reduce(
//             (sum, exp) => sum + (exp.total || 0),
//             0
//           );
//           const otherTotal = otherExpenses.reduce(
//             (sum, exp) => sum + (exp.total || 0),
//             0
//           );
//           totals[user.username] = normalTotal + otherTotal;

//           // --- Monthly totals ---
//           const allExpenses = [...normalExpenses, ...otherExpenses];
//           const monthlyTotalsCalc = {};

//           allExpenses.forEach((exp) => {
//             if (!exp.date) return;
//             const [day, mon, yr] = exp.date.split("/");
//             const monthName = monthNames[Number(mon) - 1];
//             const key = `${monthName}`;
//             monthlyTotalsCalc[key] =
//               (monthlyTotalsCalc[key] || 0) + (exp.total || 0);
//           });

//           // ✅ Use user.months array to override or show approval
//           const monthlyTotalsDisplay = {};
//           const monthlyStatus = {};

//           Object.entries(monthlyTotalsCalc).forEach(([monthKey, calcTotal]) => {
//             const monthEntry = (user.months || []).find(
//               (m) => m.month === monthKey
//             );

//             if (monthEntry) {
//               monthlyStatus[monthKey] = "tick";
//               monthlyTotalsDisplay[monthKey] =
//                 monthEntry.total ?? calcTotal;
//             } else {
//               monthlyStatus[monthKey] = "cross";
//               monthlyTotalsDisplay[monthKey] = calcTotal;
//             }
//           });

//           monthlyTotalsMap[user.username] = {
//             totals: monthlyTotalsDisplay,
//             status: monthlyStatus,
//           };

//           // --- Find last reported date ---
//           const normalDates = normalExpenses
//             .map((exp) => exp.date)
//             .filter(Boolean);

//           if (normalDates.length > 0) {
//             const latestDate = normalDates.reduce((latest, current) => {
//               const latestTime = new Date(
//                 latest.split("/").reverse().join("-")
//               ).getTime();
//               const currentTime = new Date(
//                 current.split("/").reverse().join("-")
//               ).getTime();
//               return currentTime > latestTime ? current : latest;
//             });
//             lastReportedMap[user.username] = latestDate;
//           } else {
//             lastReportedMap[user.username] = null;
//           }
//         });

//         setExpenseTotals(totals);
//         setMonthlyTotals(monthlyTotalsMap);
//         setLastReported(lastReportedMap);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to fetch user data or expenses");
//       }
//     };

//     fetchAllData();
//   }, [navigate]);

//   // --- DELETE HANDLER ---
//   const handleDeleteUser = async (username) => {
//     const confirmDelete = window.confirm(
//       `Are you sure you want to delete user "${username}"?`
//     );
//     if (!confirmDelete) return;

//     try {
//       const token = localStorage.getItem("token");
//       const headers = { headers: { Authorization: `Bearer ${token}` } };

//       await axios.delete(`${API}/api/admin/user/${username}`, headers);

//       setUsers((prev) => prev.filter((user) => user.username !== username));
//       alert("User deleted successfully.");
//     } catch (error) {
//       console.error("Failed to delete user", error);
//       alert("Error deleting user.");
//     }
//   };

//   // --- Helper: get prev + current months ---
//   const getPrevAndCurrentMonths = () => {
//     const now = new Date();
//     const monthNames = [
//       "JAN",
//       "FEB",
//       "MAR",
//       "APR",
//       "MAY",
//       "JUN",
//       "JUL",
//       "AUG",
//       "SEP",
//       "OCT",
//       "NOV",
//       "DEC",
//     ];
//     const currentMonth = monthNames[now.getMonth()];
//     const prevMonth =
//       now.getMonth() === 0 ? "DEC" : monthNames[now.getMonth() - 1];
//     return { currentMonth, prevMonth };
//   };

//   const { currentMonth, prevMonth } = getPrevAndCurrentMonths();

//   return (
//     <Layout title="ADMIN HOME PAGE" backTo="/">
//       <div className="flex justify-end mb-6">
//         <button
//           onClick={() => navigate("/set-info")}
//           className="bg-[#1f3b64] text-white px-6 py-2 rounded-lg shadow hover:bg-[#3E518E] transition"
//         >
//           + Add User
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-xl font-bold text-[#1f3b64] mb-4 border-b pb-2">
//           User List
//         </h3>

//         <div className="grid grid-cols-1 gap-4">
//           {users.length > 0 ? (
//             users.map((user, index) => {
//               const userMonthly = monthlyTotals[user.username];
//               const prev = userMonthly?.totals?.[prevMonth];
//               const curr = userMonthly?.totals?.[currentMonth];
//               const prevStatus = userMonthly?.status?.[prevMonth];
//               const currStatus = userMonthly?.status?.[currentMonth];

//               return (
//                 <div
//                   key={user._id}
//                   className="bg-gray-100 shadow-sm rounded-lg p-4 flex justify-between items-center transition"
//                 >
//                   <div className="flex items-center gap-4">
//                     <span className="text-[#1f3b64] font-bold">
//                       {index + 1}.
//                     </span>
//                     <div>
//                       <h4 className="text-lg font-semibold text-[#1f3b64]">
//                         {user.username}
//                       </h4>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {user.hq || "N/A"}
//                       </p>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Last Reported: {lastReported[user.username] || "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-6">
//                     <div className="text-right">
//                       <p className="text-xs text-gray-500 uppercase font-semibold">
//                         Monthly Exp
//                       </p>

//                       {/* --- Show previous month on top --- */}
//                       {prev && (
//                         <p className="text-sm font-bold text-[#1f3b64]">
//                           {prevMonth}: ₹{prev.toLocaleString("en-IN")}{" "}
//                           {prevStatus === "tick" ? "✅" : "❌"}
//                         </p>
//                       )}

//                       {/* --- Then current month below --- */}
//                       {curr && (
//                         <p className="text-sm text-gray-500">
//                           {currentMonth}: ₹{curr.toLocaleString("en-IN")}{" "}
//                           {currStatus === "tick" ? "✅" : "❌"}
//                         </p>
//                       )}
//                     </div>

//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <button
//                         onClick={() =>
//                           navigate(`/admin/statement/${user.username}`)
//                         }
//                         className="bg-gray-700 text-white px-4 py-1 rounded-md shadow-sm hover:bg-gray-800 text-sm"
//                       >
//                         Show Exp
//                       </button>

//                       <button
//                         onClick={() => navigate(`/edit-info/${user.username}`)}
//                         className="bg-blue-600 text-white px-4 py-1 rounded-md shadow-sm hover:bg-blue-700 text-sm"
//                       >
//                         Edit SRC
//                       </button>

//                       <button
//                         onClick={() => handleDeleteUser(user.username)}
//                         className="bg-red-600 text-white px-4 py-1 rounded-md shadow-sm hover:bg-red-700 text-sm"
//                       >
//                         Delete User
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <p className="text-center text-gray-500 py-4">
//               No users created by you have been found.
//             </p>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default AdminDashboard;


import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API = process.env.REACT_APP_BACKEND_URL;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [expenseTotals, setExpenseTotals] = useState({});
  const [monthlyTotals, setMonthlyTotals] = useState({});
  const [lastReported, setLastReported] = useState({});
  const navigate = useNavigate();
  const pdfRef = useRef();

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
        const lastReportedMap = {};
        const monthlyTotalsMap = {};

        const monthNames = [
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEP",
          "OCT",
          "NOV",
          "DEC",
        ];

        filteredUsers.forEach((user, i) => {
          const [normalExpensesRes, otherExpensesRes] = allUsersExpenses[i];
          const normalExpenses = normalExpensesRes.data || [];
          const otherExpenses = otherExpensesRes.data || [];

          const normalTotal = normalExpenses.reduce(
            (sum, exp) => sum + (exp.total || 0),
            0
          );
          const otherTotal = otherExpenses.reduce(
            (sum, exp) => sum + (exp.total || 0),
            0
          );
          totals[user.username] = normalTotal + otherTotal;

          const allExpenses = [...normalExpenses, ...otherExpenses];
          const monthlyTotalsCalc = {};

          allExpenses.forEach((exp) => {
            if (!exp.date) return;
            const [day, mon, yr] = exp.date.split("/");
            const monthName = monthNames[Number(mon) - 1];
            const key = `${monthName}`;
            monthlyTotalsCalc[key] =
              (monthlyTotalsCalc[key] || 0) + (exp.total || 0);
          });

          const monthlyTotalsDisplay = {};
          const monthlyStatus = {};

          Object.entries(monthlyTotalsCalc).forEach(([monthKey, calcTotal]) => {
            const monthEntry = (user.months || []).find(
              (m) => m.month === monthKey
            );

            if (monthEntry) {
              monthlyStatus[monthKey] = "tick";
              monthlyTotalsDisplay[monthKey] = monthEntry.total ?? calcTotal;
            } else {
              monthlyStatus[monthKey] = "cross";
              monthlyTotalsDisplay[monthKey] = calcTotal;
            }
          });

          monthlyTotalsMap[user.username] = {
            totals: monthlyTotalsDisplay,
            status: monthlyStatus,
          };

          const normalDates = normalExpenses
            .map((exp) => exp.date)
            .filter(Boolean);

          if (normalDates.length > 0) {
            const latestDate = normalDates.reduce((latest, current) => {
              const latestTime = new Date(
                latest.split("/").reverse().join("-")
              ).getTime();
              const currentTime = new Date(
                current.split("/").reverse().join("-")
              ).getTime();
              return currentTime > latestTime ? current : latest;
            });
            lastReportedMap[user.username] = latestDate;
          } else {
            lastReportedMap[user.username] = null;
          }
        });

        setExpenseTotals(totals);
        setMonthlyTotals(monthlyTotalsMap);
        setLastReported(lastReportedMap);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch user data or expenses");
      }
    };

    fetchAllData();
  }, [navigate]);

  // --- DELETE HANDLER ---
  const handleDeleteUser = async (username) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${username}"?`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`${API}/api/admin/user/${username}`, headers);
      setUsers((prev) => prev.filter((user) => user.username !== username));
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Error deleting user.");
    }
  };

  // --- Helper: get prev + current months ---
  const getPrevAndCurrentMonths = () => {
    const now = new Date();
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const currentMonth = monthNames[now.getMonth()];
    const prevMonth =
      now.getMonth() === 0 ? "DEC" : monthNames[now.getMonth() - 1];
    return { currentMonth, prevMonth };
  };

  const { currentMonth, prevMonth } = getPrevAndCurrentMonths();

  // 🔹 Download PDF
  const downloadPDF = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("AdminDashboard.pdf");
  };

  // 🔹 Download Excel
  const downloadExcel = () => {
    const rows = users.map((user, index) => {
      const userMonthly = monthlyTotals[user.username];
      const prev = userMonthly?.totals?.[prevMonth] || 0;
      const curr = userMonthly?.totals?.[currentMonth] || 0;
      const prevStatus = userMonthly?.status?.[prevMonth] === "tick" ? "✅" : "❌";
      const currStatus = userMonthly?.status?.[currentMonth] === "tick" ? "✅" : "❌";

      return {
        "S.No": index + 1,
        Username: user.username,
        HQ: user.hq || "N/A",
        "Last Reported": lastReported[user.username] || "N/A",
        [`${prevMonth} Total`]: prev,
        [`${prevMonth} Status`]: prevStatus,
        [`${currentMonth} Total`]: curr,
        [`${currentMonth} Status`]: currStatus,
        "Overall Total": expenseTotals[user.username] || 0,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdminDashboard");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "AdminDashboard.xlsx");
  };

  return (
    <Layout title="ADMIN HOME PAGE" backTo="/">
      {/* Buttons Row */}
      <div className="flex justify-end mb-6 gap-4">
        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          📄 PDF
        </button>

        <button
          onClick={downloadExcel}
          className="bg-yellow-500 text-white px-5 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
        >
          📊 Excel
        </button>

        <button
          onClick={() => navigate("/set-info")}
          className="bg-[#1f3b64] text-white px-6 py-2 rounded-lg shadow hover:bg-[#3E518E] transition"
        >
          + Add User
        </button>
      </div>

      <div ref={pdfRef} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-[#1f3b64] mb-4 border-b pb-2">
          User List
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {users.length > 0 ? (
            users.map((user, index) => {
              const userMonthly = monthlyTotals[user.username];
              const prev = userMonthly?.totals?.[prevMonth];
              const curr = userMonthly?.totals?.[currentMonth];
              const prevStatus = userMonthly?.status?.[prevMonth];
              const currStatus = userMonthly?.status?.[currentMonth];

              return (
                <div
                  key={user._id}
                  className="bg-gray-100 shadow-sm rounded-lg p-4 flex justify-between items-center transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[#1f3b64] font-bold">
                      {index + 1}.
                    </span>
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
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Monthly Exp
                      </p>
                      {prev && (
                        <p className="text-sm font-bold text-[#1f3b64]">
                          {prevMonth}: ₹{prev.toLocaleString("en-IN")}{" "}
                          {prevStatus === "tick" ? "✅" : "❌"}
                        </p>
                      )}
                      {curr && (
                        <p className="text-sm text-gray-500">
                          {currentMonth}: ₹{curr.toLocaleString("en-IN")}{" "}
                          {currStatus === "tick" ? "✅" : "❌"}
                        </p>
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
                        Edit SRC
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="bg-red-600 text-white px-4 py-1 rounded-md shadow-sm hover:bg-red-700 text-sm"
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
