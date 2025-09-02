

import React, { useState } from "react";

const UserLogTable = ({ expenses = [] }) => {
  const [expandedDates, setExpandedDates] = useState({});
  const [expandedDescs, setExpandedDescs] = useState({});

  if (expenses.length === 0) {
    return <p className="text-gray-500 italic">No normal expenses recorded.</p>;
  }

  // Group by date
  const grouped = expenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {});

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const toggleDesc = (rowId, type) => {
    setExpandedDescs((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [type]: !prev[rowId]?.[type],
      },
    }));
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
      <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
        <thead className="bg-blue-50 text-blue-700 uppercase font-semibold">
          <tr>
            <th className="px-4 py-3 border">Date</th>
            <th className="px-4 py-3 border">Time</th>
            <th className="px-4 py-3 border">Place Of Work</th>
            <th className="px-4 py-3 border">HQ/EX/OS</th>
            <th className="px-4 py-3 border">KM's</th>
            <th className="px-4 py-3 border">M.O.T</th>
            <th className="px-4 py-3 border">TA</th>
            <th className="px-4 py-3 border">DA</th>
            <th className="px-4 py-3 border font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([date, logs]) => {
            const subtotal = logs.reduce((sum, e) => sum + (Number(e.total) || 0), 0);
            const isMultiple = logs.length > 1;
            const isExpanded = expandedDates[date];

            // Check for conditions only on the single log if not multiple
            const hasNW = !isMultiple && logs.some((log) => log.isNW);
            const isSunday = !isMultiple && logs.some((log) => log.location?.toLowerCase() === "sunday");

            // ✅ MODIFIED: Summary row is only red if it's a SINGLE entry for a Sunday or No Work day.
            const summaryRowClass = isMultiple
              ? "bg-gray-100 text-gray-800"
              : hasNW || isSunday
              ? "bg-red-50 text-red-700"
              : "bg-gray-50 text-gray-800";

            return (
              <React.Fragment key={date}>
                {/* Summary Row */}
                <tr className={`border-t font-medium ${summaryRowClass}`}>
                  <td className="px-4 py-2 border">{date}</td>
                  {isMultiple ? (
                    <>
                      <td className="px-4 py-2 border">-</td>
                      <td className="px-4 py-2 border">
                        <div className="flex items-center gap-2">
                          <span>MULTIPLE</span>
                          <button
                            onClick={() => toggleExpand(date)}
                            className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                          >
                            {isExpanded ? "Hide" : "Show"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 border">-</td>
                      <td className="px-4 py-2 border">-</td>
                      <td className="px-4 py-2 border">-</td>
                      <td className="px-4 py-2 border">-</td>
                      <td className="px-4 py-2 border">-</td>
                      <td className="px-4 py-2 border font-semibold text-right pr-4">{subtotal.toLocaleString('en-IN')}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 border">{logs[0].time}</td>
                      <td className="px-4 py-2 border">{logs[0].location}</td>
                      <td className="px-4 py-2 border">{logs[0].zone}</td>
                      <td className="px-4 py-2 border">{logs[0].km}</td>
                      <td className="px-4 py-2 border">{logs[0].transport}</td>
                      <td className="px-4 py-2 border">
                        {logs[0].fare} {logs[0].extraTA ? `(+${logs[0].extraTA})` : ""}
                      </td>
                      <td className="px-4 py-2 border">
                        {logs[0].da} {logs[0].extraDA ? `(+${logs[0].extraDA})` : ""}
                      </td>
                      <td className="px-4 py-2 border font-semibold text-right pr-4">
                        {logs[0].total.toLocaleString('en-IN')}
                      </td>
                    </>
                  )}
                </tr>

                {/* Expanded Rows for MULTIPLE */}
                {isMultiple &&
                  isExpanded &&
                  logs.map((log) => {
                    const rowId = log._id || log.id || `${date}-${log.time}-${log.location}`;

                    // ✅ Individual row highlighting remains correct
                    const rowClass = log.isNW
                      ? "bg-red-50 text-red-700"
                      : "bg-white hover:bg-gray-50";

                    return (
                      <React.Fragment key={rowId}>
                        <tr className={`border-t ${rowClass}`}>
                          <td className="px-4 py-2 border" />
                          <td className="px-4 py-2 border">{log.time}</td>
                          <td className="px-4 py-2 border">
                            {log.location}
                            {log.locationDesc && (
                               <button
                                onClick={() => toggleDesc(rowId, "location")}
                                className={`ml-2 px-2 py-1 text-xs rounded-md bg-green-500 text-white hover:bg-green-600`}
                              >
                                Des
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-2 border">{log.zone}</td>
                          <td className="px-4 py-2 border">{log.km}</td>
                          <td className="px-4 py-2 border">{log.transport}</td>
                          <td className="px-4 py-2 border">
                            {log.fare} {log.extraTA ? `+(${log.extraTA})` : ""}
                             {log.taDesc && (
                                <button
                                onClick={() => toggleDesc(rowId, "ta")}
                                className={`ml-2 px-2 py-1 text-xs rounded-md bg-orange-500 text-white hover:bg-orange-600`}
                              >
                                D
                              </button>
                             )}
                          </td>
                          <td className="px-4 py-2 border">
                            {log.da} {log.extraDA ? `+(${log.extraDA})` : ""}
                            {log.daDesc && (
                               <button
                                onClick={() => toggleDesc(rowId, "da")}
                                className={`ml-2 px-2 py-1 text-xs rounded-md bg-orange-500 text-white hover:bg-orange-600`}
                              >
                                D
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-2 border font-semibold text-right pr-4">
                            {log.total.toLocaleString('en-IN')}
                          </td>
                        </tr>

                        {/* Expanded Descriptions */}
                        {expandedDescs[rowId]?.location && (
                          <tr className="bg-green-500">
                            <td colSpan={9} className="px-4 py-2 border italic text-center text-gray-100">
                              <strong>Note:</strong> {log.locationDesc}
                            </td>
                          </tr>
                        )}
                        {expandedDescs[rowId]?.ta && (
                          <tr className="bg-orange-500">
                            <td colSpan={9} className="px-4 py-2 border italic text-center text-gray-100">
                             <strong>TA Note:</strong> {log.taDesc}
                            </td>
                          </tr>
                        )}
                        {expandedDescs[rowId]?.da && (
                          <tr className="bg-orange-500">
                            <td colSpan={9} className="px-4 py-2 border italic text-center text-gray-100">
                             <strong>DA Note:</strong> {log.daDesc}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserLogTable;