export default function FaresTable({
  fares,
  editingRow,
  editRow,
  onEdit,
  onChangeRow,
  onSave,
  onCancel,
  onAddRow,
  newRow,
  onChangeNewRow,
  onDeleteRow,
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">SRC Details</h3>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white text-left">
              <th className="p-3">PLACE OF WORK</th>
              <th className="p-3">HQ/EX/OS</th>
              <th className="p-3">MOT</th>
              <th className="p-3">Km’s</th>
              <th className="p-3">TA</th>
              <th className="p-3">DA</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fares &&
              Object.entries(fares).map(([city, data]) => {
                // ✅ HQ rows (no transports)
                if (data.transports.length === 0) {
                  const key = `${city}-HQ`;

                  return (
                    <tr key={key} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{city}</td>
                      <td className="p-3">{data.zone}</td>
                      <td className="p-3">-</td>
                      <td className="p-3">{data.km}</td>
                      <td className="p-3">0</td>
                      <td className="p-3">
                        {editingRow === key ? (
                          <input
                            type="number"
                            value={editRow.da}
                            onChange={(e) =>
                              onChangeRow({ ...editRow, da: e.target.value })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        ) : (
                          data.da
                        )}
                      </td>
                      <td className="p-3">
                        {editingRow === key ? (
                          <div className="flex gap-2">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              onClick={() => onSave(city, "HQ")}
                            >
                              Save
                            </button>
                            <button
                              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                              onClick={onCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-600"
                              onClick={() => onEdit(city, { mode: "HQ" })}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              onClick={() => onDeleteRow(city, "HQ")}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }

                // ✅ Transport rows
                return data.transports.map((t) => {
                  const key = `${city}-${t.mode}`;
                  return (
                    <tr key={key} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{city}</td>
                      <td className="p-3">{data.zone}</td>
                      <td className="p-3 capitalize">{t.mode}</td>
                      <td className="p-3">
                        {editingRow === key ? (
                          <input
                            type="number"
                            value={editRow.km}
                            onChange={(e) =>
                              onChangeRow({ ...editRow, km: e.target.value })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        ) : (
                          data.km
                        )}
                      </td>
                      <td className="p-3">
                        {editingRow === key ? (
                          <input
                            type="number"
                            value={editRow.fare}
                            onChange={(e) =>
                              onChangeRow({ ...editRow, fare: e.target.value })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        ) : (
                          t.fare
                        )}
                      </td>
                      <td className="p-3">
                        {editingRow === key ? (
                          <input
                            type="number"
                            value={editRow.da}
                            onChange={(e) =>
                              onChangeRow({ ...editRow, da: e.target.value })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        ) : (
                          data.da
                        )}
                      </td>
                      <td className="p-3">
                        {editingRow === key ? (
                          <div className="flex gap-2">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              onClick={() => onSave(city, t.mode)}
                            >
                              Save
                            </button>
                            <button
                              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                              onClick={onCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-600"
                              onClick={() => onEdit(city, t)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              onClick={() => onDeleteRow(city, t.mode)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
          </tbody>
        </table>
      </div>

      {/* Add New Row */}
      <div className="mt-6 p-4 bg-white shadow rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-3">Add New Place</h4>
        <div className="grid grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="PLACE OF WORK"
            value={newRow.city}
            onChange={(e) =>
              onChangeNewRow({ ...newRow, city: e.target.value })
            }
            className="border rounded px-2 py-2"
          />
          <select
            value={newRow.zone}
            onChange={(e) =>
              onChangeNewRow({ ...newRow, zone: e.target.value })
            }
            className="border rounded px-2 py-2 text-gray-700"
          >
            <option value="" disabled className="text-gray-400">
              HQ/EX/OS
            </option>
            <option value="HQ">HQ</option>
            <option value="EX">EX</option>
            <option value="OS">OS</option>
          </select>
          <select
            value={newRow.transport}
            onChange={(e) =>
              onChangeNewRow({ ...newRow, transport: e.target.value })
            }
            className="border rounded px-2 py-2 text-gray-700"
          >
            <option value="" disabled className="text-gray-400">
              MOT
            </option>
            <option value="-">local</option>
            <option value="bike">Bike</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
          </select>

          <input
            type="number"
            placeholder="KM's"
            value={newRow.km}
            onChange={(e) => onChangeNewRow({ ...newRow, km: e.target.value })}
            className="border rounded px-2 py-2"
          />
          <input
            type="number"
            placeholder="TA"
            value={newRow.fare}
            onChange={(e) => onChangeNewRow({ ...newRow, fare: e.target.value })}
            className="border rounded px-2 py-2"
          />
          <input
            type="number"
            placeholder="DA"
            value={newRow.da}
            onChange={(e) => onChangeNewRow({ ...newRow, da: e.target.value })}
            className="border rounded px-2 py-2"
          />
        </div>
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={onAddRow}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
