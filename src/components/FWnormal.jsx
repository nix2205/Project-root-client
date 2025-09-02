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

const FieldWorkTable = ({ logs, onSave }) => {
  if (logs.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <th className="px-4 py-2 text-left text-sm font-semibold">DATE</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">TIME</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">PLACE OF WORK</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">EX/HQ/OS</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">KM's</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">MOT</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">TA</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">DA</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">TOTAL</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {logs.map((log, idx) => (
              <tr
                key={idx}
                className={`${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-purple-50 transition`}
              >
                <td className="px-4 py-2 text-gray-700">{log.date}</td>
                <td className="px-4 py-2 text-gray-700">
                  {formatTimeAMPM(log.time)}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {capitalizeWords(log.location)}
                </td>
                <td className="px-4 py-2 text-gray-700">{log.zone}</td>
                <td className="px-4 py-2 text-gray-700">{log.km}</td>
                <td className="px-4 py-2 text-gray-700">
                  {capitalizeWords(log.transport)}
                </td>
                <td className="px-4 py-2 text-gray-700">{log.fare}</td>
                <td className="px-4 py-2 text-gray-700">{log.da}</td>
                <td className="px-4 py-2 font-semibold text-gray-900">
                  {log.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      {!logs[0].isSaved && (
        <div className="mt-6 text-center">
          <button
            onClick={onSave}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300"
          >
            Submit Normal Expenses
          </button>
        </div>
      )}
    </div>
  );
};

export default FieldWorkTable;
