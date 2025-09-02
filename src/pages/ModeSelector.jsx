

import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; // Import your Layout component

const ModeSelector = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Attendance Punching & Monthly Expenses" backTo="/">
      {/* Main Container */}
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)] p-6">
        <div className="bg-white/50 p-8 rounded-xl shadow-lg flex flex-col items-center w-[650px]">
          {/* Two-column layout */}
          <div className="flex justify-between w-full gap-12">
            {/* Left Side: Main Actions */}
            <div className="flex flex-col gap-4 flex-1 items-center">
              <button
                className={primaryButtonClass}
                onClick={() => navigate("/field-work")}
              >
                🟩 Field Work
              </button>
              <button
                className={primaryButtonClass}
                onClick={() => navigate("/non-field-work")}
              >
                🟨 Non-Field Work
              </button>
              <button
                className={primaryButtonClass}
                onClick={() => navigate("/non-working-day")}
              >
                🟥 Non-Working Day
              </button>
              <button
                className={primaryButtonClass}
                onClick={() => navigate("/other-expenses")}
              >
                Add Other Expenses
              </button>
            </div>

            {/* Right Side: View & Show Info */}
            <div className="flex flex-col gap-4 flex-1 items-center">
              <button
                className={secondaryButtonClass}
                onClick={() => navigate("/expense-statement")}
              >
                View Submitted Expenses
              </button>
              <button
                className={secondaryButtonClass}
                onClick={() => navigate("/show-info")}
              >
                SRC
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ✅ Tailwind classes for buttons
const primaryButtonClass =
  "bg-[#2C3E65] text-white px-5 py-3 rounded-md text-lg font-semibold hover:bg-[#00a6c2] transition w-[200px]";

const secondaryButtonClass =
  "bg-gray-100 text-[#2C3E65] border border-[#2C3E65] px-5 py-3 rounded-md text-lg font-semibold hover:bg-[#e0e0e0] transition w-[220px]";

export default ModeSelector;
