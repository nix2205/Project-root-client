import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Layout from "../components/Layout"; // adjust path if needed

dayjs.extend(isSameOrBefore);

const API = process.env.REACT_APP_BACKEND_URL;

const OtherExpensesPage = () => {
  const today = dayjs();
  const firstAllowedDate = today.subtract(1, "month").startOf("month"); 
  const lastAllowedDate = today; 

  const [date, setDate] = useState(today.format("YYYY-MM-DD"));
  const [entries, setEntries] = useState([{ amount: "", description: "",billNo: "" }]);
  const [message, setMessage] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => setEntries([...entries, { amount: "", description: "", billNo: "" }]);
  const calculateTotal = () => entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const validateDate = (selectedDate) => {
    const dateObj = dayjs(selectedDate);
    return dateObj.isAfter(firstAllowedDate) && dateObj.isSameOrBefore(lastAllowedDate);
  };

  const handleSave = async () => {
    if (!validateDate(date)) {
      setMessage("❌ Cannot save expense for this date. Allowed range: previous month to today.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const formattedDate = dayjs(date).format("DD/MM/YYYY");

      const validEntries = entries.filter(
        (e) => e.amount && !isNaN(e.amount) && e.description.trim() && e.billNo.trim() !== ""
      );

      if (validEntries.length === 0) {
        setMessage("Please enter at least one valid expense.");
        return;
      }

      await axios.post(
        `${API}/api/user/other-expenses`,
        { date: formattedDate, entries: validEntries },
        { headers }
      );

      setMessage("✅ Saved successfully!");
      setEntries([{ amount: "", description: "" }]);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.msg || "Error saving expenses");
    }
  };

  return (
    <Layout title="Other Expenses" backTo="/mode-selector">
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Add Other Expenses</h2>

          {/* Date Picker */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Select Date:</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={firstAllowedDate.format("YYYY-MM-DD")}
              max={lastAllowedDate.format("YYYY-MM-DD")}
            />
          </div>

          {/* Dynamic Entries */}
          {entries.map((entry, idx) => (
            <div key={idx} className="mb-3 border rounded-xl p-3 bg-gray-50">
              <div className="mb-2">
                <label className="block mb-1 font-medium">Amount:</label>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
                  value={entry.amount}
                  onChange={(e) => handleChange(idx, "amount", e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description:</label>
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
                  value={entry.description}
                  onChange={(e) => handleChange(idx, "description", e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              <div>
    <label className="block mb-1 font-medium">Bill No:</label>
    <input
      type="text"
      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
      value={entry.billNo}
      onChange={(e) => handleChange(idx, "billNo", e.target.value)}
      placeholder="Enter bill number"
    />
  </div>
            </div>
          ))}

          <button
            onClick={addEntry}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            + Add Other Expense
          </button>

          <div className="mt-4 font-semibold text-lg">
            Total: ₹{calculateTotal()}
          </div>

          {message && (
            <div className={`mt-4 text-center font-medium ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OtherExpensesPage;
