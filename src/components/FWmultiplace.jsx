import React from "react";

// Utility functions
const capitalizeWords = (str) =>
  str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(" ");
  if (parts.length === 2) {
    return `${parts[0]} ${parts[1].toUpperCase()}`; // e.g., "12:03:09 AM"
  }
  return timeStr;
};

const MultiPlaceForm = ({ data, setData, onSave }) => {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      {/* Title */}
      <h3 className="text-xl font-extrabold text-[#2C3E65] mb-4">
        Multi-Place Entry
      </h3>

      {/* Date & Time */}
      <div className="flex flex-wrap gap-4 mb-4 text-gray-700">
        <p>
          <span className="font-semibold text-gray-500">DATE:</span>{" "}
          {data.date}
        </p>
        <p>
          <span className="font-semibold text-gray-500">TIME:</span>{" "}
          {formatTimeAMPM(data.time)}
        </p>
      </div>

      {/* Place Info */}
      <div className="flex flex-wrap gap-4 mb-6 text-gray-700">
        <p>
          <span className="font-semibold text-gray-500">Place:</span>{" "}
          {capitalizeWords(data.location)}
        </p>
        <p>
          <span className="font-semibold text-gray-500">Zone:</span>{" "}
          {data.zone}
        </p>
        <p>
          <span className="font-semibold text-gray-500">KM's:</span>{" "}
          {data.km}
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* MOT */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Mode of Transport
          </label>
          <select
            value={data.transport}
            onChange={(e) => setData({ ...data, transport: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            <option value="">Select MOT</option>
            <option value="bike">Bike</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
          </select>
        </div>

        {/* Fare */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            TA (Fare)
          </label>
          <input
            type="number"
            placeholder="Enter TA"
            value={data.fare}
            onChange={(e) => setData({ ...data, fare: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        {/* DA */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            DA
          </label>
          <input
            type="number"
            placeholder="Enter DA"
            value={data.da}
            onChange={(e) => setData({ ...data, da: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          placeholder="Enter description..."
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
          rows={3}
        ></textarea>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 w-full md:w-auto"
      >
        Submit Multi-Place Expense
      </button>
    </div>
  );
};

export default MultiPlaceForm;


