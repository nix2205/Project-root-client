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

  // --- Month/year state ---
  const current = dayjs();
  const [selectedMonth, setSelectedMonth] = useState({
    month: current.month() + 1, // month is 0-based in dayjs
    year: current.year(),
  });

  // Generate options for current + 2 previous months
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

      const resUser = await axios.get(
        `${API}/api/admin/user/${username}`,
        { headers }
      );
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
      const canvas = await html2canvas(content, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      const finalWidth = canvasAspectRatio > pdfAspectRatio ? pdfWidth : pdfHeight * canvasAspectRatio;
      const finalHeight = canvasAspectRatio > pdfAspectRatio ? pdfWidth / canvasAspectRatio : pdfHeight;
      pdf.addImage(imgData, "PNG", (pdfWidth - finalWidth) / 2, 0, finalWidth, finalHeight);
      pdf.save(`expense-statement-${username}-${dayjs().month(selectedMonth.month - 1).year(selectedMonth.year).format("MMMM_YYYY")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
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

  const subtotal1 = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const subtotal2 = otherExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const grandTotal = subtotal1 + subtotal2;
  const isDeleteDisabled = !selectedExpenseId && !selectedOtherExpenseId;



  return (
    <Layout title={`Expense Statement - ${username}`} backTo="/admin/dashboard">
      <div ref={pdfContentRef} className="p-4 sm:p-6 bg-gray-50">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-[#1f3b64] mb-2">
                Username:{" "}
                <span className="font-normal text-gray-700">{username}</span>
              </p>
              <p className="text-lg text-gray-700">
                HQ:{" "}
                <span className="font-semibold uppercase text-[#1f3b64]">
                  {hq}
                </span>
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

              <p className="text-lg text-gray-700 mt-1">
                Grand Total:{" "}
                <span className="font-bold text-green-600 text-xl">
                  ₹ {grandTotal.toLocaleString("en-IN")}
                </span>
              </p>
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
              Subtotal 1:{" "}
              <span className="font-bold text-blue-600">
                ₹ {subtotal1.toLocaleString("en-IN")}
              </span>
            </p>
          </div>

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
              Subtotal 2:{" "}
              <span className="font-bold text-blue-600">
                ₹ {subtotal2.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminExpenseStatement;
