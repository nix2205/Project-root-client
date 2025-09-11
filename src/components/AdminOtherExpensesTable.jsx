// // src/components/OtherExpensesTable.js

// import React, { useState } from "react";
// import { Pencil } from "lucide-react";

// const OtherExpensesTable = ({
//   otherExpenses = [],
//   onSaveExtraAmount,
//   onSaveExtraDescription,
//   // --- NEW PROPS for selection ---
//   selectedRowId,
//   onSelectRow,
// }) => {
//   const [editing, setEditing] = useState({ id: null, type: null });
//   const [tempValue, setTempValue] = useState("");

//   const groupedByDate = otherExpenses.reduce((acc, item) => {
//     if (!acc[item.date]) {
//       acc[item.date] = [];
//     }
//     acc[item.date].push(item);
//     return acc;
//   }, {});

//   let serialNumber = 1;

//   const renderAmountCell = (entry) => {
//     const isEditingAmount = editing.id === entry._id && editing.type === "AMOUNT";
//     const isEditingDesc = editing.id === entry._id && editing.type === "DESC";

//     return (
//       <div className="flex items-center justify-end gap-2">
//         {/* Base Amount */}
//         <span>{entry.amount.toLocaleString("en-IN")}</span>

//         {/* Extra Amount Input/Display */}
//         {isEditingAmount ? (
//           <input
//             type="number"
//             value={tempValue}
//             autoFocus
//             onChange={(e) => setTempValue(e.target.value)}
//             onBlur={() => {
//               onSaveExtraAmount(entry._id, Number(tempValue));
//               setEditing({ id: null, type: null });
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 onSaveExtraAmount(entry._id, Number(tempValue));
//                 setEditing({ id: null, type: null });
//               }
//             }}
//             className="border rounded px-2 py-1 w-24 text-right"
//           />
//         ) : (
//           <>
//             {entry.extraamount > 0 && (
//               <span className="font-semibold text-blue-600">
//                 +({entry.extraamount.toLocaleString("en-IN")})
//               </span>
//             )}
//             <button
//               className="p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
//               onClick={() => {
//                 setEditing({ id: entry._id, type: "AMOUNT" });
//                 setTempValue(entry.extraamount || 0);
//               }}
//             >
//               <Pencil size={12} />
//             </button>
//           </>
//         )}

//         {/* Extra Description Input/Display */}
//         {isEditingDesc ? (
//            <input
//              type="text"
//              value={tempValue}
//              autoFocus
//              placeholder="Extra description"
//              onChange={(e) => setTempValue(e.target.value)}
//              onBlur={() => {
//                onSaveExtraDescription(entry._id, tempValue);
//                setEditing({ id: null, type: null });
//              }}
//              onKeyDown={(e) => {
//                if (e.key === "Enter") {
//                  onSaveExtraDescription(entry._id, tempValue);
//                  setEditing({ id: null, type: null });
//                }
//              }}
//              className="border rounded px-2 py-1 w-32"
//            />
//         ) : (
//           <button
//             className={`px-2 py-1 text-xs rounded-md ${
//               entry.extradescription
//                 ? "bg-orange-500 text-white hover:bg-orange-600"
//                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//             }`}
//             onClick={() => {
//               setEditing({ id: entry._id, type: "DESC" });
//               setTempValue(entry.extradescription || "");
//             }}
//           >
//             D
//           </button>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
//       <table className="w-full border-collapse text-sm bg-white">
//         <thead className="bg-blue-100 text-blue-950 uppercase font-semibold">
//           <tr>
//             <th className="border p-3 w-12 text-center">Sl.No</th>
//             <th className="border p-3 w-32 text-center">Date</th>
//             <th className="border p-3 w-auto text-left">Description</th>
//             <th className="border p-3 w-56 text-center">Amount</th>
//             {/* --- NEW: Select column header --- */}
//             <th className="border p-3 w-20 text-center">Select</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.entries(groupedByDate).map(([date, entries]) =>
//             entries.map((entry, index) => (
//               <tr key={entry._id} className="hover:bg-gray-50">
//                 <td className="border p-2 text-center">{serialNumber++}</td>
//                 {index === 0 && (
//                   <td
//                     rowSpan={entries.length}
//                     className="border p-2 text-center font-semibold align-middle"
//                   >
//                     {date}
//                   </td>
//                 )}
//                 <td className="border p-2 whitespace-normal break-words">
//                   {entry.description}
//                 </td>
//                 <td className="border p-2 text-right">
//                   {renderAmountCell(entry)}
//                 </td>
//                 {/* --- NEW: Radio button cell --- */}
//                 <td className="border p-2 text-center">
//                   <input
//                     type="radio"
//                     name="other_expense_selection"
//                     checked={selectedRowId === entry._id}
//                     onChange={() => onSelectRow(entry._id)}
//                     className="h-4 w-4"
//                   />
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default OtherExpensesTable;








// src/components/OtherExpensesTable.js

import React, { useState } from "react";
import { Pencil } from "lucide-react";

const OtherExpensesTable = ({
  otherExpenses = [],
  onSaveExtraAmount,
  onSaveExtraDescription,
  selectedRowId,
  onSelectRow,
}) => {
  const [editing, setEditing] = useState({ id: null, type: null });
  const [tempValue, setTempValue] = useState("");

  const groupedByDate = otherExpenses.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  let serialNumber = 1;

  const renderAmountCell = (entry) => {
    const isEditingAmount = editing.id === entry._id && editing.type === "AMOUNT";
    const isEditingDesc = editing.id === entry._id && editing.type === "DESC";
    return (
      <div className="flex items-center justify-end gap-2">
        <span>{entry.amount.toLocaleString("en-IN")}</span>
        {isEditingAmount ? (
          <input type="number" value={tempValue} autoFocus onChange={(e) => setTempValue(e.target.value)} onBlur={() => { onSaveExtraAmount(entry._id, Number(tempValue)); setEditing({ id: null, type: null }); }} onKeyDown={(e) => { if (e.key === "Enter") { onSaveExtraAmount(entry._id, Number(tempValue)); setEditing({ id: null, type: null }); } }} className="border rounded px-2 py-1 w-24 text-right hide-on-pdf" />
        ) : (
          <>
            {entry.extraamount > 0 && <span className="font-semibold text-blue-600"> +({entry.extraamount.toLocaleString("en-IN")})</span>}
            <button className="p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition hide-on-pdf" onClick={() => { setEditing({ id: entry._id, type: "AMOUNT" }); setTempValue(entry.extraamount || 0); }}>
              <Pencil size={12} />
            </button>
          </>
        )}
        {isEditingDesc ? (
          <input type="text" value={tempValue} autoFocus placeholder="Extra description" onChange={(e) => setTempValue(e.target.value)} onBlur={() => { onSaveExtraDescription(entry._id, tempValue); setEditing({ id: null, type: null }); }} onKeyDown={(e) => { if (e.key === "Enter") { onSaveExtraDescription(entry._id, tempValue); setEditing({ id: null, type: null }); } }} className="border rounded px-2 py-1 w-32 hide-on-pdf" />
        ) : (
          <button className={`px-2 py-1 text-xs rounded-md ${entry.extradescription ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} hide-on-pdf`} onClick={() => { setEditing({ id: entry._id, type: "DESC" }); setTempValue(entry.extradescription || ""); }}>
            D
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
      <table className="w-full border-collapse text-sm bg-white">
        <thead className="bg-blue-100 text-blue-950 uppercase font-semibold">
          <tr>
            <th className="border p-3 w-12 text-center">Sl.No</th>
            <th className="border p-3 w-32 text-center">Date</th>
            <th className="border p-3 w-auto text-left">Description</th>
            <th className="border p-3 w-56 text-center">Amount</th>
            <th className="border p-3 w-20 text-center hide-on-pdf">Select</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByDate).map(([date, entries]) =>
            entries.map((entry, index) => (
              <tr key={entry._id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{serialNumber++}</td>
                {index === 0 && <td rowSpan={entries.length} className="border p-2 text-center font-semibold align-middle">{date}</td>}
                <td className="border p-2 whitespace-normal break-words">{entry.description}</td>
                <td className="border p-2 text-right">{renderAmountCell(entry)}</td>
                <td className="border p-2 text-center hide-on-pdf">
                  <input type="radio" name="other_expense_selection" checked={selectedRowId === entry._id} onChange={() => onSelectRow(entry._id)} className="h-4 w-4" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OtherExpensesTable;