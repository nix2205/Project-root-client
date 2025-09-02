import { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export default function PasswordReset({ username }) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/api/admin/reset-password/${username}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password reset successfully!");
      setNewPassword("");
    } catch (err) {
      console.error("Password reset failed:", err);
      alert("Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Reset Password
      </h3>
      <div className="flex gap-2">
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          onClick={handleResetPassword}
          disabled={!newPassword || loading}
        >
          {loading ? "Saving..." : "Reset"}
        </button>
      </div>
    </div>
  );
}
