import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const NonWorkingDayPage = () => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submittedDate, setSubmittedDate] = useState(null); // store submitted date
  const API = process.env.REACT_APP_BACKEND_URL;

  const today = new Date();

  // start of previous month
  const minDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  // end of current month
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // format a Date object as yyyy-mm-dd in LOCAL time (no toISOString)
  const formatForInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // parse yyyy-mm-dd as a LOCAL date
  const parseLocalDate = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const [date, setDate] = useState(formatForInput(today));

  const handleSave = async () => {
    if (!reason || (reason === "Others" && !customReason.trim())) {
      alert("Please select or enter a reason");
      return;
    }

    if (!date) {
      alert("Please select or enter a date");
      return;
    }

    // Validate entered date (local)
    const enteredDate = parseLocalDate(date);

    if (enteredDate < minDate || enteredDate > maxDate) {
      alert("Date must be within current or previous month.");
      return;
    }

    const selectedReason = reason === "Others" ? customReason : reason;

    // Format date & time for saving
    const formattedDate = enteredDate.toLocaleDateString("en-GB"); // dd/mm/yyyy
    const time = new Date().toLocaleTimeString("en-GB");

    const expenseEntry = {
      date: formattedDate,
      time,
      location: selectedReason,
      zone: "-",
      km: 0,
      transport: "-",
      fare: 0,
      da: 0,
      otherExp: 0,
      total: 0,
      description: "-",
      isNW: true,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/user/add-expense`, expenseEntry, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmittedDate(formattedDate); // store date for showing message
    } catch (err) {
      console.error("Error saving non-working day:", err);
      if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        alert("Failed to save. Please try again.");
      }
    }
  };

  return (
    <Layout title="NON-WORKING DAY" backTo="/mode-selector">
      <div className="flex justify-center items-center mt-6">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Mark Non-Working Day
          </h2>

          {/* Date Selector */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Select date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={formatForInput(minDate)}
              max={formatForInput(maxDate)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
            />
          </div>

          {/* Reason Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Select reason:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
            >
              <option value="">-- Choose --</option>
              <option value="Sunday">Sunday</option>
              <option value="Week Off">Week Off</option>
              <option value="Leave">Leave</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Custom Reason */}
          {reason === "Others" && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleSave}
              className="bg-[#2C3E65] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#1F2A49] transition"
            >
              Submit
            </button>

            {/* Show submitted message if any */}
            {submittedDate && (
              <p className="text-green-600 font-semibold mt-2 text-center">
                ✅ Submitted for {submittedDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NonWorkingDayPage;
