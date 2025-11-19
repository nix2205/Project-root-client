// utils/monthHelpers.js (or inline in your page)
export const formatMonthKeyShort = (monthNumber) => {
  const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  if (!monthNumber) return null;
  const m = Number(monthNumber);
  if (m < 1 || m > 12) return null;
  return monthNames[m - 1];
};

// returns both possible month keys derived from a date string "DD/MM/YYYY"
// e.g. { short: "NOV", long: "2025-11" }
export const monthKeysFromDate = (dateStr) => {
  if (!dateStr) return { short: null, long: null };
  const parts = dateStr.split("/").map(Number);
  if (parts.length !== 3) return { short: null, long: null };
  const [, month, year] = parts;
  const short = formatMonthKeyShort(month); // "NOV"
  const long = `${year}-${String(month).padStart(2, "0")}`; // "2025-11"
  return { short, long };
};


// returns true if locked (submittedAt exists) and user is not admin (if you pass role)
export const isMonthLockedForUser = (userMonths = [], monthShort, monthLong, userRole) => {
  if (!userMonths || userMonths.length === 0) return false;
  const entry = userMonths.find(m => m.month === monthShort || m.month === monthLong);
  if (!entry) return false;
  // treat submittedAt existence as lock; you used submittedAt earlier
  if (entry.submittedAt && userRole !== "admin") return true;
  return false;
};


