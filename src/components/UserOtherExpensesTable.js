

// src/components/UserOtherExpensesTable.js

import React, { useState } from "react";

const UserOtherExpensesTable = ({ otherExpenses = [] }) => {
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Toggles the visibility of the extra description row
  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group expenses by date for a cleaner layout
  const groupedByDate = otherExpenses.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});

  let serialNumber = 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm bg-white">
        <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
          <tr>
            <th className="border p-3 w-12 text-center">Sl.No</th>
            <th className="border p-3 w-32 text-center">Date</th>
            <th className="border p-3 w-auto text-left">Description</th>
            <th className="border p-3 w-48 text-center">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByDate).map(([date, entries]) =>
            entries.map((entry, index) => (
              <React.Fragment key={entry._id}>
                <tr className="hover:bg-gray-50 align-top">
                  <td className="border p-2 text-center">{serialNumber++}</td>
                  
                  {index === 0 && (
                    <td
                      rowSpan={entries.length}
                      className="border p-2 text-center font-semibold align-middle"
                    >
                      {date}
                    </td>
                  )}

                  <td className="border p-2">
                    <p>{entry.description}</p>
                  </td>

                  <td className="border p-2 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <span>{entry.amount.toLocaleString("en-IN")}</span>
                      
                      {/* ✅ Show extra amount on the same line */}
                      {entry.extraamount > 0 && (
                        <span className="font-semibold text-blue-600">
                          + {entry.extraamount.toLocaleString("en-IN")}
                        </span>
                      )}

                      {/* ✅ Show orange 'D' button only if there's an extra description */}
                      {entry.extradescription && (
                        <button 
                          onClick={() => toggleDescription(entry._id)}
                          className="px-2 py-1 text-xs rounded-md bg-orange-500 text-white hover:bg-orange-600"
                        >
                          D
                        </button>
                      )}
                    </div>
                    
                  </td>
                </tr>

                {/* ✅ Conditionally render the extra description row */}
                {expandedDescriptions[entry._id] && (
                  <tr className="bg-orange-500">
                    <td colSpan="4" className="border p-2 px-4 text-center text-gray-100 italic">
                      <strong>Note:</strong> {entry.extradescription}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserOtherExpensesTable;