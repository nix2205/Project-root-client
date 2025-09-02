// // pages/ExpenseStatement.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import UserLogTable from "../components/UserLogTable";
// const API = process.env.REACT_APP_BACKEND_URL;


// const ExpenseStatement = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [otherExpenses, setOtherExpenses] = useState([]);
  

//   const [normalTotal, setNormalTotal] = useState(0);
//   const [otherTotal, setOtherTotal] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const headers = { Authorization: `Bearer ${token}` };

//         // User Info
//         const userRes = await axios.get(`${API}/api/user/info`, { headers });
//         setUserInfo(userRes.data);

//         // Normal Expenses
//         const expenseRes = await axios.get(`${API}/api/user/expenses`, { headers });
//         const data = expenseRes.data || [];

//         const formatted = data.map((e) => ({
//           id: e.id,
//           date: e.date,
//           time: e.time,
//           location: e.location,
//           zone: e.zone,
//           km: e.km || 0,
//           transport: e.transport,
//           fare: e.fare,
//           da: e.da,
//           extraTA:e.extraTA,
//           extraDA:e.extraDA,
//           total: e.total,
//           locationDesc: e.locationDesc, // ⬅️ from backend
//           taDesc: e.taDesc,             // ⬅️ from backend
//           daDesc: e.daDesc,             // ⬅️ from backend
//         }));

//         setExpenses(formatted);
//         const normalSum = formatted.reduce((sum, e) => sum + (Number(e.total) || 0), 0);
//         setNormalTotal(normalSum);

//         // Other Expenses
//         const otherRes = await axios.get(`${API}/api/user/other-expenses`, { headers });
//         const otherData = otherRes.data || [];

//         setOtherExpenses(otherData);
//         const otherSum = otherData.reduce((sum, entry) => sum + (entry.amount || 0), 0);
//         setOtherTotal(otherSum);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   // ---- FUNCTIONS ----
//   const showDateDesc = (date) => {
//   const dayEntries = expenses.filter(
//     (e) => e.date.slice(0, 10) === date.slice(0, 10)
//   );
//   if (dayEntries.length > 0 && dayEntries[0].locationDesc) {
//     alert(`Date: ${date}\n\n${dayEntries[0].locationDesc}`);
//   } else {
//     alert(`No description found for ${date}`);
//   }
// };

//   const showTADesc = (expenseId) => {
//     const entry = expenses.find((e) => e.id === expenseId);
//     if (entry && entry.taDesc) {
//       alert(`TA Description:\n\n${entry.taDesc}`);
//     } else {
//       alert("No TA description found.");
//     }
//   };

//   const showDADesc = (expenseId) => {
//     const entry = expenses.find((e) => e.id === expenseId);
//     if (entry && entry.daDesc) {
//       alert(`DA Description:\n\n${entry.daDesc}`);
//     } else {
//       alert("No DA description found.");
//     }
//   };

//   // ---- UI ----
//   const currentMonth = new Date().toLocaleString("default", {
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h1 className="text-2xl font-bold mb-1">Expense Statement</h1>
//           {userInfo && (
//             <div className="text-gray-700 text-sm">
//               <p><strong>Username:</strong> {userInfo.username}</p>
//               <p><strong>HQ:</strong> {userInfo.hq}</p>
//               <p><strong>Month:</strong> {currentMonth}</p>
//             </div>
//           )}
//         </div>
//         <div className="text-right">
//           <h2 className="text-xl font-bold text-green-700">
//             Grand Total: ₹{normalTotal + otherTotal}
//           </h2>
//         </div>
//       </div>

//       {/* Normal Expense Table */}
//       <div className="mb-12">
//         <h2 className="text-lg font-semibold mb-2">General Expenses</h2>
//         <UserLogTable
//           expenses={expenses}
//           showDateDesc={showDateDesc}
//           showTADesc={showTADesc}
//           showDADesc={showDADesc}
//         />
//         {expenses.length > 0 && (
//           <div className="text-right font-bold mt-2">
//             Subtotal: ₹{normalTotal}
//           </div>
//         )}
//       </div>

//       {/* Other Expenses Table */}
//       <div>
//         <h2 className="text-lg font-semibold mb-2">Other Expenses</h2>
//         {otherExpenses.length === 0 ? (
//           <p className="text-gray-500">No other expenses recorded.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border border-gray-300 text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-4 py-2 border">Date</th>
//                   <th className="px-4 py-2 border">Amounts (₹)</th>
//                   <th className="px-4 py-2 border">Descriptions</th>
//                   <th className="px-4 py-2 border">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(
//                   otherExpenses.reduce((acc, entry) => {
//                     if (!acc[entry.date]) acc[entry.date] = [];
//                     acc[entry.date].push(entry);
//                     return acc;
//                   }, {})
//                 ).map(([date, entries], idx) => {
//                   const total = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
//                   return (
//                     <tr key={idx} className="border-t align-top">
//                       <td className="px-4 py-2 border">{date}</td>
//                       <td className="px-4 py-2 border">
//                         {entries.map((e, i) => (
//                           <div key={i}>₹{e.amount}</div>
//                         ))}
//                       </td>
//                       <td className="px-4 py-2 border">
//                         {entries.map((e, i) => (
//                           <div key={i}>{e.description}</div>
//                         ))}
//                       </td>
//                       <td className="px-4 py-2 border font-semibold">₹{total}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//               <tfoot>
//                 <tr>
//                   <td colSpan={3} className="text-right font-bold px-4 py-2 border">
//                     Subtotal
//                   </td>
//                   <td className="font-bold px-4 py-2 border">₹{otherTotal}</td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         )}
//       </div>

//       <button
//         className="mt-6 px-4 py-2 bg-gray-300 text-black rounded"
//         onClick={() => navigate(`/mode-selector`)}
//       >
//         ← Back
//       </button>
//     </div>
//   );
// };

// export default ExpenseStatement;








// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Layout from "../components/Layout";
// import UserLogTable from "../components/UserLogTable";

// const API = process.env.REACT_APP_BACKEND_URL;

// const ExpenseStatement = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [otherExpenses, setOtherExpenses] = useState([]);
//   const [normalTotal, setNormalTotal] = useState(0);
//   const [otherTotal, setOtherTotal] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const headers = { Authorization: `Bearer ${token}` };

//         // User Info
//         const userRes = await axios.get(`${API}/api/user/info`, { headers });
//         setUserInfo(userRes.data);

//         // Normal Expenses
//         const expenseRes = await axios.get(`${API}/api/user/expenses`, { headers });
//         const data = expenseRes.data || [];
//         const formatted = data.map((e) => ({
//           id: e.id,
//           date: e.date,
//           time: e.time,
//           location: e.location,
//           zone: e.zone,
//           km: e.km || 0,
//           transport: e.transport,
//           fare: e.fare,
//           da: e.da,
//           extraTA: e.extraTA,
//           extraDA: e.extraDA,
//           total: e.total,
//           locationDesc: e.locationDesc,
//           taDesc: e.taDesc,
//           daDesc: e.daDesc,
//           isNw: e.isNW,
//         }));
//         setExpenses(formatted);
//         setNormalTotal(formatted.reduce((sum, e) => sum + (Number(e.total) || 0), 0));

//         // Other Expenses
//         const otherRes = await axios.get(`${API}/api/user/other-expenses`, { headers });
//         const otherData = otherRes.data || [];
//         setOtherExpenses(otherData);
//         setOtherTotal(otherData.reduce((sum, entry) => sum + (entry.amount || 0), 0));
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//       }
//     };
//     fetchData();
//   }, []);

//   // ---- Functions ----
//   const showDateDesc = (date) => {
//     const dayEntries = expenses.filter((e) => e.date.slice(0, 10) === date.slice(0, 10));
//     if (dayEntries.length > 0 && dayEntries[0].locationDesc) {
//       alert(`Date: ${date}\n\n${dayEntries[0].locationDesc}`);
//     } else {
//       alert(`No description found for ${date}`);
//     }
//   };

//   const showTADesc = (expenseId) => {
//     const entry = expenses.find((e) => e.id === expenseId);
//     if (entry && entry.taDesc) alert(`TA Description:\n\n${entry.taDesc}`);
//     else alert("No TA description found.");
//   };

//   const showDADesc = (expenseId) => {
//     const entry = expenses.find((e) => e.id === expenseId);
//     if (entry && entry.daDesc) alert(`DA Description:\n\n${entry.daDesc}`);
//     else alert("No DA description found.");
//   };

//   const currentMonth = new Date().toLocaleString("default", {
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <Layout title="Expense Statement" backTo="/mode-selector">
//       <div className="space-y-8 max-w-6xl mx-auto">
//         {/* Header Card */}
//         <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
//           <div>
//             <h1 className="text-2xl font-bold mb-2">Expense Statement</h1>
//             {userInfo && (
//               <div className="text-gray-700 text-sm space-y-1">
//                 <p><strong>Username:</strong> {userInfo.username}</p>
//                 <p><strong>HQ:</strong> {userInfo.hq}</p>
//                 <p><strong>Month:</strong> {currentMonth}</p>
//               </div>
//             )}
//           </div>
//           <div className="mt-4 md:mt-0 text-right">
//             <h2 className="text-xl font-bold text-green-700">
//               Grand Total: ₹{normalTotal + otherTotal}
//             </h2>
//           </div>
//         </div>

//         {/* General Expenses Table */}
//         <div className="bg-white shadow-lg rounded-2xl p-6">
//           <h2 className="text-xl font-semibold mb-4">General Expenses</h2>
//           <UserLogTable
//             expenses={expenses}
//             showDateDesc={showDateDesc}
//             showTADesc={showTADesc}
//             showDADesc={showDADesc}
//           />
//           {expenses.length > 0 && (
//             <div className="text-right font-bold mt-3">
//               Subtotal: ₹{normalTotal}
//             </div>
//           )}
//         </div>

//         {/* Other Expenses Table */}
//         <div className="bg-white shadow-lg rounded-2xl p-6">
//           <h2 className="text-xl font-semibold mb-4">Other Expenses</h2>
//           {otherExpenses.length === 0 ? (
//             <p className="text-gray-500">No other expenses recorded.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full border border-gray-300 text-sm">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="px-4 py-2 border">Date</th>
//                     <th className="px-4 py-2 border">Amounts (₹)</th>
//                     <th className="px-4 py-2 border">Descriptions</th>
//                     <th className="px-4 py-2 border">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Object.entries(
//                     otherExpenses.reduce((acc, entry) => {
//                       if (!acc[entry.date]) acc[entry.date] = [];
//                       acc[entry.date].push(entry);
//                       return acc;
//                     }, {})
//                   ).map(([date, entries], idx) => {
//                     const total = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
//                     return (
//                       <tr key={idx} className="border-t align-top">
//                         <td className="px-4 py-2 border">{date}</td>
//                         <td className="px-4 py-2 border">
//                           {entries.map((e, i) => (
//                             <div key={i}>₹{e.amount}</div>
//                           ))}
//                         </td>
//                         <td className="px-4 py-2 border">
//                           {entries.map((e, i) => (
//                             <div key={i}>{e.description}</div>
//                           ))}
//                         </td>
//                         <td className="px-4 py-2 border font-semibold">₹{total}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//                 <tfoot>
//                   <tr>
//                     <td colSpan={3} className="text-right font-bold px-4 py-2 border">
//                       Subtotal
//                     </td>
//                     <td className="font-bold px-4 py-2 border">₹{otherTotal}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ExpenseStatement;









// pages/ExpenseStatement.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import UserLogTable from "../components/UserLogTable";
import UserOtherExpensesTable from "../components/UserOtherExpensesTable"; // ✅ Import the new component

const API = process.env.REACT_APP_BACKEND_URL;

const ExpenseStatement = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // User Info
        const userRes = await axios.get(`${API}/api/user/info`, { headers });
        setUserInfo(userRes.data);

        // Normal Expenses
        const expenseRes = await axios.get(`${API}/api/user/expenses`, { headers });
        setExpenses(expenseRes.data || []);

        // Other Expenses
        const otherRes = await axios.get(`${API}/api/user/other-expenses`, { headers });
        setOtherExpenses(otherRes.data || []);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);
  
  // ✅ Calculate totals directly from the fetched data
  const normalTotal = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const otherTotal = otherExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const grandTotal = normalTotal + otherTotal;


  // ---- Description alert functions (no change) ----
  const showDateDesc = (date) => { /* ... */ };
  const showTADesc = (expenseId) => { /* ... */ };
  const showDADesc = (expenseId) => { /* ... */ };

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

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
                <p><strong>Username:</strong> {userInfo.username}</p>
                <p><strong>HQ:</strong> {userInfo.hq}</p>
                <p><strong>Month:</strong> {currentMonth}</p>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <h2 className="text-xl font-bold text-green-700">
              Grand Total: ₹{grandTotal.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* General Expenses Table */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">General Expenses</h2>
          <UserLogTable
            expenses={expenses}
            showDateDesc={showDateDesc}
            showTADesc={showTADesc}
            showDADesc={showDADesc}
          />
          {expenses.length > 0 && (
            <div className="text-right font-bold text-lg mt-4 border-t pt-2">
              Subtotal: ₹{normalTotal.toLocaleString("en-IN")}
            </div>
          )}
        </div>

        {/* Other Expenses Table */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Other Expenses</h2>
          {otherExpenses.length === 0 ? (
            <p className="text-gray-500">No other expenses recorded.</p>
          ) : (
            <>
              {/* ✅ Use the new component */}
              <UserOtherExpensesTable otherExpenses={otherExpenses} />
              <div className="text-right font-bold text-lg mt-4 border-t pt-2">
                Subtotal: ₹{otherTotal.toLocaleString("en-IN")}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExpenseStatement;