import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; // Using the shared Layout component

const API = process.env.REACT_APP_BACKEND_URL;

function SetInfoPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("Please provide both a username and password.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error. Please log in again.");
        navigate("/"); // Redirect to login
        return;
      }

      // --- NEW LOGIC: Decode username from the token ---
      const payload = JSON.parse(atob(token.split(".")[1]));
      const adminUsername = payload.username; // Assumes the token payload has a 'username' field

      if (!adminUsername) {
        alert("Could not identify admin from token. Please log in again.");
        return;
      }
      // --- END OF NEW LOGIC ---

      const userData = {
        username,
        password,
        createdBy: adminUsername, // Use the username decoded from the token
        hq: "",
        ex: [],
        os: [],
        kms: {},
        fares: {},
        da: {},
      };

      await axios.post(`${API}/api/admin/add-user`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User added successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Failed to add user:", err);
      // Check if the error is from token decoding
      if (err instanceof TypeError || err instanceof DOMException) {
         alert("Invalid token format. Please log in again.");
         navigate("/");
      } else {
         alert("Error: Could not add the user. They may already exist.");
      }
    }
  };

  return (
    <Layout title="Add New User" backTo="/admin/dashboard">
      <div className="max-w-md mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Create User Credentials
          </h2>
          <div className="space-y-4">
            <input
              placeholder="Username"
              className="border p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              placeholder="Password"
              type="password"
              className="border p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default SetInfoPage;

