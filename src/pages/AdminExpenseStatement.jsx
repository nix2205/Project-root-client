// pages/AdminExpenseStatement.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import LogTable from "../components/LogTable";
import OtherExpensesTable from "../components/AdminOtherExpensesTable";
import Layout from "../components/Layout";
import { Trash2, Download, FileSpreadsheet } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

const AdminExpenseStatement = () => {
  const { username } = useParams();
  const [hq, setHQ] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedOtherExpenseId, setSelectedOtherExpenseId] = useState(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const pdfContentRef = useRef();

  const current = dayjs();
  const [selectedMonth, setSelectedMonth] = useState({
    month: current.month() + 1,
    year: current.year(),
  });

  const monthOptions = [
    current,
    current.subtract(1, "month"),
    current.subtract(2, "month"),
  ].map((d) => ({
    label: d.format("MMMM YYYY"),
    value: { month: d.month() + 1, year: d.year() },
  }));

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const { month, year } = selectedMonth;

      const resUser = await axios.get(`${API}/api/admin/user/${username}`, { headers });
      setHQ(resUser.data.hq || "");

      const resNormal = await axios.get(
        `${API}/api/admin/normal-expenses/${username}?month=${month}&year=${year}`,
        { headers }
      );
      setExpenses(resNormal.data || []);

      const resOther = await axios.get(
        `${API}/api/admin/other-expenses/${username}?month=${month}&year=${year}`,
        { headers }
      );
      setOtherExpenses(resOther.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [username, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectExpense = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setSelectedOtherExpenseId(null);
  };

  const handleSelectOtherExpense = (expenseId) => {
    setSelectedOtherExpenseId(expenseId);
    setSelectedExpenseId(null);
  };

  const handleDeleteExpense = async () => {
    const isNormalExpense = selectedExpenseId !== null;
    const isOtherExpense = selectedOtherExpenseId !== null;
    if (!isNormalExpense && !isOtherExpense) return alert("Please select an expense to delete.");
    if (!window.confirm("Are you sure you want to delete this expense entry?")) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      if (isNormalExpense) {
        await axios.delete(`${API}/api/admin/expense/${username}/${selectedExpenseId}`, headers);
        setExpenses((prev) => prev.filter(exp => exp._id !== selectedExpenseId));
        setSelectedExpenseId(null);
      } else if (isOtherExpense) {
        await axios.delete(`${API}/api/admin/other-expense/${selectedOtherExpenseId}`, headers);
        setOtherExpenses((prev) => prev.filter(exp => exp._id !== selectedOtherExpenseId));
        setSelectedOtherExpenseId(null);
      }
      alert("Expense deleted successfully.");
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("An error occurred while deleting the expense.");
    }
  };

  const handleDownloadPDF = async () => {
  const content = pdfContentRef.current;
  if (!content) return;
  setIsDownloadingPDF(true);
  content.classList.add("pdf-mode");

  try {
    // 1) Render content to canvas at scale=1 (smaller but ok quality)
    const canvas = await html2canvas(content, {
      scale: 1.4,
      useCORS: true,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    // 2) Prepare PDF sizes
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidthMM = pdf.internal.pageSize.getWidth();
    const pdfHeightMM = pdf.internal.pageSize.getHeight();

    // Convert px -> mm ratio (using 96 DPI assumption)
    const pxPerMm = 96 / 25.4; // ~3.7795275591
    const canvasWidthPx = canvas.width;
    const canvasHeightPx = canvas.height;

    // target width in px that maps to pdf width in mm
    const targetPdfWidthPx = Math.floor(pdfWidthMM * pxPerMm);
    // scale factor to fit canvas width to pdf width
    const scaleFactor = targetPdfWidthPx / canvasWidthPx;

    // compute page height in px after scaling
    const pageHeightPx = Math.floor(pdfHeightMM * pxPerMm / scaleFactor);

    // We'll slice the canvas vertically into pages of height pageHeightPx
    const totalPages = Math.ceil(canvasHeightPx / pageHeightPx);

    // 3) Create a temporary canvas to draw each slice (keeps memory use modest)
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = canvasWidthPx;
    tmpCanvas.height = Math.min(pageHeightPx, canvasHeightPx);
    const tmpCtx = tmpCanvas.getContext("2d");

    // JPEG quality (0.5 - 0.8 is usually a good sweet spot)
    const JPEG_QUALITY = 0.85;

    for (let page = 0; page < totalPages; page++) {
      const sx = 0;
      const sy = page * pageHeightPx;
      const sHeight = Math.min(pageHeightPx, canvasHeightPx - sy);

      // resize tmp canvas height to current slice
      tmpCanvas.height = sHeight;

      // clear then draw slice from original canvas
      tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
      tmpCtx.drawImage(canvas, sx, sy, canvasWidthPx, sHeight, 0, 0, canvasWidthPx, sHeight);

      // convert slice to JPEG data URL (much smaller than PNG)
      const imgData = tmpCanvas.toDataURL("image/jpeg", JPEG_QUALITY);

      // compute display size in mm to keep aspect ratio and fit page width
      const imgWidthMM = pdfWidthMM;
      const imgHeightMM = (sHeight * scaleFactor) / pxPerMm; // px -> mm conversion

      // center vertically if needed (we use 0 top)
      const x = 0;
      const y = 0;

      // add to PDF
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", x, y, imgWidthMM, imgHeightMM);
    }

    // 4) Save PDF (filename same as before)
    pdf.save(`expense-statement-${username}-${dayjs().month(selectedMonth.month - 1).year(selectedMonth.year).format("MMMM_YYYY")}.pdf`);
  } catch (error) {
    console.error("Error generating compressed PDF:", error);
    alert("Failed to generate PDF.");
  } finally {
    content.classList.remove("pdf-mode");
    setIsDownloadingPDF(false);
  }
};


  const handleDownloadExcel = () => {
    setIsDownloadingExcel(true);
    try {
      const normalExpensesHeaders = ["Date", "Time", "Place of Work", "Zone", "KM", "Mode of Transport", "Fare (TA)", "Extra TA", "TA Desc", "DA", "Extra DA", "DA Desc", "Total"];
      const normalExpensesData = expenses.map(exp => [exp.date, exp.time, exp.location, exp.zone, exp.km, exp.transport, exp.fare ?? 0, exp.extraTA ?? 0, exp.taDesc ?? "", exp.da ?? 0, exp.extraDA ?? 0, exp.daDesc ?? "", exp.total ?? 0]);
      const otherExpensesHeaders = ["Date", "Bill No", "Description", "Amount", "Extra Amount", "Extra Desc", "Total"];
      const otherExpensesData = otherExpenses.map(exp => [exp.date,  exp.billNo || "-", exp.description, exp.amount ?? 0, exp.extraamount ?? 0, exp.extradescription ?? "", exp.total ?? 0]);
      const wb = XLSX.utils.book_new();
      const wsNormal = XLSX.utils.aoa_to_sheet([normalExpensesHeaders, ...normalExpensesData]);
      const wsOther = XLSX.utils.aoa_to_sheet([otherExpensesHeaders, ...otherExpensesData]);
      const summaryData = [[], ["", "", "", "", "", "", "", "", "", "Subtotal 1:", subtotal1], ["", "", "", "", "", "", "", "", "", "Subtotal 2:", subtotal2], ["", "", "", "", "", "", "", "", "", "Grand Total:", grandTotal]];
      XLSX.utils.sheet_add_aoa(wsNormal, summaryData, { origin: -1 });
      XLSX.utils.book_append_sheet(wb, wsNormal, "Normal Expenses");
      XLSX.utils.book_append_sheet(wb, wsOther, "Other Expenses");
      XLSX.writeFile(wb, `Expense_Statement_${username}_${dayjs().month(selectedMonth.month - 1).year(selectedMonth.year).format("MMMM_YYYY")}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const doSaveTA = async (expenseId, newValue) => {
    const expenseToUpdate = expenses.find((exp) => exp._id === expenseId);
    if (!expenseToUpdate) return;
    const newTotal = (expenseToUpdate.fare || 0) + (expenseToUpdate.da || 0) + (Number(newValue) || 0) + (expenseToUpdate.extraDA || 0);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { extraTA: newValue, total: newTotal }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, extraTA: newValue, total: newTotal } : exp));
    } catch (error) { console.error("Error updating extraTA:", error); }
  };

  const doSaveDA = async (expenseId, newValue) => {
    const expenseToUpdate = expenses.find((exp) => exp._id === expenseId);
    if (!expenseToUpdate) return;
    const newTotal = (expenseToUpdate.fare || 0) + (expenseToUpdate.da || 0) + (expenseToUpdate.extraTA || 0) + (Number(newValue) || 0);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { extraDA: newValue, total: newTotal }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, extraDA: newValue, total: newTotal } : exp));
    } catch (error) { console.error("Error updating extraDA:", error); }
  };

  const doSaveTADesc = async (expenseId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { taDesc: newValue }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, taDesc: newValue } : exp));
    } catch (error) { console.error("Error updating TA Desc:", error); }
  };

  const doSaveDADesc = async (expenseId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/expense/${username}/${expenseId}`, { daDesc: newValue }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.map((exp) => exp._id === expenseId ? { ...exp, daDesc: newValue } : exp));
    } catch (error) { console.error("Error updating DA Desc:", error); }
  };

  const doSaveOtherExpenseExtraAmount = async (expenseId, newAmount) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API}/api/admin/other-expense/${expenseId}`, {
        extraamount: newAmount,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOtherExpenses(prev => prev.map(exp => exp._id === expenseId ? data.expense : exp));
    } catch (err) {
      console.error("Error updating other expense amount:", err);
    }
  };

  const doSaveOtherExpenseExtraDescription = async (expenseId, newDescription) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API}/api/admin/other-expense/${expenseId}`, {
        extradescription: newDescription,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOtherExpenses(prev => prev.map(exp => exp._id === expenseId ? data.expense : exp));
    } catch (err) {
      console.error("Error updating other expense description:", err);
    }
  };
  
  const handleApproveExpense = async () => {
  if (!window.confirm(`Approve expenses for ${dayjs().month(selectedMonth.month - 1).year(selectedMonth.year).format("MMMM YYYY")}?`))
    return;

  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const { month, year } = selectedMonth;

    await axios.put(
      `${API}/api/admin/approve-month/${username}`,
      { month, year },
      { headers }
    );

    alert("Expense approved successfully ✅");
    // optionally refresh data to show status
    fetchData();
  } catch (error) {
    console.error("Error approving expense:", error);
    alert("Failed to approve expense.");
  }
};


  const subtotal1 = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const subtotal2 = otherExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const grandTotal = subtotal1 + subtotal2;
  const isDeleteDisabled = !selectedExpenseId && !selectedOtherExpenseId;

return (
  <Layout title={`Expense Statement - ${username}`} backTo="/admin/dashboard">
    <div ref={pdfContentRef} className="p-4 sm:p-6 bg-gray-50">
      <div className="space-y-6">
        {/* User Info and Month Selector */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-[#1f3b64] mb-2">
              Username: <span className="font-normal text-gray-700">{username}</span>
            </p>
            <p className="text-lg text-gray-700">
              HQ: <span className="font-semibold uppercase text-[#1f3b64]">{hq}</span>
            </p>

            {/* Month Selector */}
            <div className="mt-2">
              <label className="text-lg text-gray-700 mr-2">Month:</label>
              <select
                value={`${selectedMonth.month}-${selectedMonth.year}`}
                onChange={(e) => {
                  const [m, y] = e.target.value.split("-").map(Number);
                  setSelectedMonth({ month: m, year: y });
                }}
                className="border rounded px-2 py-1"
              >
                {monthOptions.map((opt) => (
                  <option
                    key={`${opt.value.month}-${opt.value.year}`}
                    value={`${opt.value.month}-${opt.value.year}`}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 hide-on-pdf">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition ${
                isDownloadingPDF
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Download size={16} />
              {isDownloadingPDF ? "..." : "PDF"}
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={isDownloadingExcel}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition ${
                isDownloadingExcel
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FileSpreadsheet size={16} />
              {isDownloadingExcel ? "..." : "Excel"}
            </button>

            <button
              onClick={handleDeleteExpense}
              disabled={isDeleteDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition ${
                isDeleteDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Normal Expenses Table */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-xl mb-3 text-[#1f3b64]">Normal Expenses</h2>
          <LogTable
            expenses={expenses}
            onSaveTA={doSaveTA}
            onSaveDA={doSaveDA}
            onEditTADesc={doSaveTADesc}
            onEditDADesc={doSaveDADesc}
            onEditLocationDesc={() => {}}
            selectedRowId={selectedExpenseId}
            onSelectRow={handleSelectExpense}
          />
          <p className="mt-3 font-semibold text-right text-lg">
            Subtotal 1: <span className="font-bold text-blue-600">₹ {subtotal1.toLocaleString("en-IN")}</span>
          </p>
        </div>

        {/* Other Expenses Table */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-xl mb-3 text-[#1f3b64]">Other Expenses</h2>
          <OtherExpensesTable
            otherExpenses={otherExpenses}
            onSaveExtraAmount={doSaveOtherExpenseExtraAmount}
            onSaveExtraDescription={doSaveOtherExpenseExtraDescription}
            selectedRowId={selectedOtherExpenseId}
            onSelectRow={handleSelectOtherExpense}
          />
          <p className="mt-3 font-semibold text-right text-lg">
            Subtotal 2: <span className="font-bold text-blue-600">₹ {subtotal2.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </div>

{/* --- Grand Total & Approve Section (Below Other Expenses Table) --- */}
<div className="mt-6 flex flex-col items-center justify-center">
  <p className="text-lg font-semibold text-[#1f3b64] mb-3">
    Grand Total:{" "}
    <span className="text-green-600 text-xl font-bold">
      ₹ {grandTotal.toLocaleString("en-IN")}
    </span>
  </p>
  <button
    onClick={handleApproveExpense}
    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
  >
    ✅ Approve Expense
  </button>
</div>

      
      </div>
    
  </Layout>
);

};

export default AdminExpenseStatement;
