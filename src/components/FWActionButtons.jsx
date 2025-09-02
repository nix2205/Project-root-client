import React from "react";

const ActionButtons = ({
  userInfo,
  transport,
  setTransport,
  handleRecord,
  handleApplyTransport,
  handleMultiplePlacesRecord,
  currentCity,
}) => {
  const isHQ = currentCity === userInfo.hq;

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      {/* Record Button */}
      <button
        onClick={handleRecord}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-200"
      >
        ✅ Record Current Place
      </button>

      {/* Transport Section (only if not HQ) */}
      {!isHQ && (
  <div className="flex gap-3 items-center">
    <select
      value={transport}
      onChange={(e) => setTransport(e.target.value)}
      className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
    >
      <option value="">Select MOT</option>
      <option value="-">-</option>
      <option value="bike">Bike</option>
      <option value="bus">Bus</option>
      <option value="train">Train</option>
    </select>

    <button
      onClick={handleApplyTransport}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-200"
    >
      🚗 Confirm MOT
    </button>
  </div>
)}


      {/* HQ Info */}
      {isHQ && (
        <span className="text-gray-600 font-medium italic">
          🏠 HQ detected: No transport needed
        </span>
      )}

      {/* Multi-Place Button */}
      <button
        onClick={handleMultiplePlacesRecord}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-200"
      >
        ➕ Record Multiple Places
      </button>
    </div>
  );
};

export default ActionButtons;
