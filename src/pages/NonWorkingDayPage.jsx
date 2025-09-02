import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const NonWorkingDayPage = () => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const API = process.env.REACT_APP_BACKEND_URL;

  const handleSave = async () => {
    if (!reason || (reason === "Others" && !customReason.trim())) {
      alert("Please select or enter a reason");
      return;
    }

    const selectedReason = reason === "Others" ? customReason : reason;
    const date = new Date().toLocaleDateString("en-GB");
    const time = new Date().toLocaleTimeString("en-GB");

    const expenseEntry = {
      date,
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

      setSubmitted(true);
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
          {submitted ? (
            <p className="text-green-600 font-semibold text-lg text-center">
              ✅ Your non-working day has been recorded.
            </p>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4 text-center">
                Mark Non-Working Day
              </h2>

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
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSave}
                  className="bg-[#2C3E65] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#1F2A49] transition"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NonWorkingDayPage;
