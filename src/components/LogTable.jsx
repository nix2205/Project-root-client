

import React, { useState } from "react";
import { Pencil } from "lucide-react";

const LogTable = ({
  expenses = [],
  onSaveTA,
  onSaveDA,
  onEditTADesc,
  onEditDADesc,
  onEditLocationDesc,
}) => {
  const [expandedDates, setExpandedDates] = useState({});
  const [editing, setEditing] = useState({ id: null, type: null });
  const [tempValue, setTempValue] = useState("");
  const [tempDesc, setTempDesc] = useState("");
  const [expandedDesc, setExpandedDesc] = useState({});

  const grouped = expenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {});

  const toggleExpand = (date) =>
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));

  const toggleLocationDesc = (id) =>
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));

  let slNo = 1;

  const renderTAcell = (log) => {
    const isEditing = editing.id === log._id && editing.type === "TA";
    const isDescEditing = editing.id === log._id && editing.type === "TA_DESC";

    return (
      <>
        {log.fare ?? 0}
        {isEditing ? (
          <input
            type="number"
            value={tempValue}
            autoFocus
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
              if (Number(tempValue) !== (log.extraTA ?? 0)) {
                onSaveTA(log._id, Number(tempValue));
              }
              setEditing({ id: null, type: null });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (Number(tempValue) !== (log.extraTA ?? 0)) {
                  onSaveTA(log._id, Number(tempValue));
                }
                setEditing({ id: null, type: null });
              }
            }}
            className="ml-2 border rounded-md px-2 text-xs w-16 h-7 text-center focus:ring focus:ring-blue-300"
          />
        ) : (
          <>
            {log.extraTA !== null && ` +(${log.extraTA})`}
            <button
              className="ml-2 p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => {
                setEditing({ id: log._id, type: "TA" });
                setTempValue(log.extraTA ?? 0);
              }}
            >
              <Pencil size={12} />
            </button>
          </>
        )}

        {/* TA Description */}
        {isDescEditing ? (
          <input
            type="text"
            value={tempDesc}
            autoFocus
            placeholder="Enter description"
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={() => {
              onEditTADesc(log._id, tempDesc);
              setEditing({ id: null, type: null });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEditTADesc(log._id, tempDesc);
                setEditing({ id: null, type: null });
              }
            }}
            className="ml-2 border rounded-md px-2 text-xs w-32 h-7 focus:ring focus:ring-blue-300"
          />
        ) : (
          <button
            className={`ml-2 px-2 py-1 text-xs rounded-md ${
              log.taDesc
                ? "bg-orange-500 text-white hover:bg-orange-600" // ✅ Changed to orange
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            }`}
            onClick={() => {
              setEditing({ id: log._id, type: "TA_DESC" });
              setTempDesc(log.taDesc ?? "");
            }}
          >
            D
          </button>
        )}
      </>
    );
  };

  const renderDAcell = (log) => {
    const isEditing = editing.id === log._id && editing.type === "DA";
    const isDescEditing = editing.id === log._id && editing.type === "DA_DESC";

    return (
      <>
        {log.da ?? 0}
        {isEditing ? (
          <input
            type="number"
            value={tempValue}
            autoFocus
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
              if (Number(tempValue) !== (log.extraDA ?? 0)) {
                onSaveDA(log._id, Number(tempValue));
              }
              setEditing({ id: null, type: null });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (Number(tempValue) !== (log.extraDA ?? 0)) {
                  onSaveDA(log._id, Number(tempValue));
                }
                setEditing({ id: null, type: null });
              }
            }}
            className="ml-2 border rounded-md px-2 text-xs w-16 h-7 text-center focus:ring focus:ring-blue-300"
          />
        ) : (
          <>
            {log.extraDA !== null && ` +(${log.extraDA})`}
            <button
              className="ml-2 p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => {
                setEditing({ id: log._id, type: "DA" });
                setTempValue(log.extraDA ?? 0);
              }}
            >
              <Pencil size={12} />
            </button>
          </>
        )}

        {/* DA Description */}
        {isDescEditing ? (
          <input
            type="text"
            value={tempDesc}
            autoFocus
            placeholder="Enter description"
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={() => {
              onEditDADesc(log._id, tempDesc);
              setEditing({ id: null, type: null });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEditDADesc(log._id, tempDesc);
                setEditing({ id: null, type: null });
              }
            }}
            className="ml-2 border rounded-md px-2 text-xs w-32 h-7 focus:ring focus:ring-blue-300"
          />
        ) : (
          <button
            className={`ml-2 px-2 py-1 text-xs rounded-md ${
              log.daDesc
                ? "bg-orange-500 text-white hover:bg-orange-600" // ✅ Changed to orange
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            }`}
            onClick={() => {
              setEditing({ id: log._id, type: "DA_DESC" });
              setTempDesc(log.daDesc ?? "");
            }}
          >
            D
          </button>
        )}
      </>
    );
  };

  const renderLocationDescRow = (log) =>
    expandedDesc[log._id] && (
      <tr key={`${log._id}-desc`} className="bg-green-500"> {/* ✅ Changed background color */}
        <td colSpan={10} className="px-4 py-2 text-center italic text-gray-100"> {/* ✅ Colspan is now 10 */}
          {log.locationDesc || "No description available"}
        </td>
      </tr>
    );

  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
      <table className="w-full border-collapse text-base bg-white rounded-lg overflow-hidden">
        <thead className="bg-blue-50 text-blue-950 uppercase font-semibold text-sm">
          <tr>
            <th className="border px-3 py-3">Sl.No</th>
            <th className="border px-3 py-3">Date</th>
            <th className="border px-3 py-3">Time</th>
            <th className="border px-3 py-3">Place Of Work</th>
            <th className="border px-3 py-3">HQ/EX/OS</th>
            <th className="border px-3 py-3">KM's</th>
            <th className="border px-3 py-3">M.O.T</th>
            <th className="border px-3 py-3">T.A</th>
            <th className="border px-3 py-3">D.A</th>
            <th className="border px-3 py-3">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([date, logs]) => {
            const multiple = logs.length > 1;
            const totalRow = logs.reduce(
              (sum, l) => sum + (l.total || 0),
              0
            );

            return (
              <React.Fragment key={date}>
                {/* Summary Row */}
                <tr
                  className={`border-t font-medium ${
                    multiple
                      ? "bg-gray-100 text-gray-800"
                      : logs[0].isNW
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-50 text-gray-800"
                  }`}
                >
                  <td className="border px-3 py-2">{slNo++}</td>
                  <td className="border px-3 py-2">{date}</td>
                  <td className="border px-3 py-2">{multiple ? "-" : logs[0].time}</td>
                  <td className="border px-3 py-2">
                    {multiple ? (
                      <>
                        MULTIPLE
                        <button
                          className="ml-2 px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={() => toggleExpand(date)}
                        >
                          {expandedDates[date] ? "Hide" : "Show"}
                        </button>
                      </>
                    ) : (
                      logs[0].location
                    )}
                  </td>
                  <td className="border px-3 py-2">{multiple ? "-" : logs[0].zone}</td>
                  <td className="border px-3 py-2">{multiple ? "-" : logs[0].km}</td>
                  <td className="border px-3 py-2">{multiple ? "-" : logs[0].transport}</td>
                  <td className="border px-3 py-2">{multiple ? "-" : renderTAcell(logs[0])}</td>
                  <td className="border px-3 py-2">{multiple ? "-" : renderDAcell(logs[0])}</td>
                  <td className="border px-3 py-2 font-bold">{totalRow}</td>
                  {/* ❌ REMOVED Select cell */}
                </tr>

                {/* Expanded Rows */}
                {expandedDates[date] &&
                  logs.map((log) => (
                    <React.Fragment key={log._id}>
                      <tr
                        className={`border-t hover:bg-gray-50 ${log.isNW ? "bg-red-50 text-red-700" : "text-gray-800"}`}
                      >
                        <td className="border px-3 py-2" />
                        <td className="border px-3 py-2">{log.date}</td>
                        <td className="border px-3 py-2">{log.time}</td>
                        <td className="border px-3 py-2">
                          {log.location}
                          <button
                            onClick={() => toggleLocationDesc(log._id)}
                            className={`ml-2 px-2 py-1 text-xs rounded-md ${
                              log.locationDesc
                                ? "bg-green-500 text-white hover:bg-green-600" // ✅ Changed to orange
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            }`}
                          >
                            Des
                          </button>
                        </td>
                        <td className="border px-3 py-2">{log.zone}</td>
                        <td className="border px-3 py-2">{log.km}</td>
                        <td className="border px-3 py-2">{log.transport}</td>
                        <td className="border px-3 py-2">{renderTAcell(log)}</td>
                        <td className="border px-3 py-2">{renderDAcell(log)}</td>
                        <td className="border px-3 py-2 font-bold">{log.total || 0}</td>
                        {/* ❌ REMOVED Select cell */}
                      </tr>
                      {renderLocationDescRow(log)}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;