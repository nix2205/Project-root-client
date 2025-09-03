// src/pages/EditUserInfo.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "../hooks/useUser";
import PasswordReset from "../components/PasswordReset";
import FaresTable from "../components/FaresTable";
import Layout from "../components/Layout";
import { toast } from "react-hot-toast";

const API = process.env.REACT_APP_BACKEND_URL;

const EditUserInfo = () => {
  const { username } = useParams();
  // We use a local user state to manage changes before saving to the backend
  const { user: initialUser, setUser: setInitialUser, loading } = useUser(username);

  // Local state for the component to avoid waiting for backend on every small change
  const [user, setUser] = useState(null);
  
  const [editingRow, setEditingRow] = useState(null); // e.g., "Hyderabad-bike"
  const [editRow, setEditRow] = useState({});
  const [newRow, setNewRow] = useState({
    city: "",
    zone: "",
    transport: "",
    km: "",
    fare: "",
    da: "",
  });

  // Sync local state when the initial user data is fetched
  useEffect(() => {
    if (initialUser) {
      // Deep copy to prevent mutation issues
      setUser(JSON.parse(JSON.stringify(initialUser)));
    }
  }, [initialUser]);


  // Helper function to send the final updated user object to the backend
  const saveUserToBackend = async (updatedUser) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/edit-user/${username}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Also update the hook's state to persist changes if we navigate away and come back
      setInitialUser(updatedUser);
      toast.success("User information saved successfully!");
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error("Failed to save. Please try again.");
      // If the save fails, revert to the initial state
      setUser(JSON.parse(JSON.stringify(initialUser)));
    }
  };

  const handleEdit = (city, transport) => {
    // transport is an object like { mode: 'bike', fare: 50 } or { mode: 'HQ' }
    const key = `${city}-${transport.mode}`;
    setEditingRow(key);
    
    // Populate the edit form with the correct data from the user object
    setEditRow({
      km: user.kms?.[city] || 0,
      da: user.da?.[city] || 0,
      // Fare is specific to the transport mode, not the city
      fare: transport.fare || 0,
    });
  };

  const handleSave = async (city, mode) => {
    const updatedUser = { ...user };
    

    updatedUser.kms[city] = Number(editRow.km);
    updatedUser.da[city] = Number(editRow.da);

    if (mode !== "HQ") {
      // Ensure the city exists in fares
      if (!updatedUser.fares[city]) {
        updatedUser.fares[city] = {};
      }
      updatedUser.fares[city][mode] = Number(editRow.fare);
    }

    setUser(updatedUser); // Optimistic UI update
    setEditingRow(null);   // Exit editing mode
    await saveUserToBackend(updatedUser); // Persist changes
  };

  const handleAddRow = async () => {
    const { city, zone, transport, km, fare, da } = newRow;

    if (!city || !zone || !transport) {
      return toast.error("Place, HQ/EX/OS, and MOT are required.");
    }
    
    // Create a deep copy to safely mutate
    const updatedUser = JSON.parse(JSON.stringify(user));

    // --- 1. Update Zone Information ---
    // First, remove the city from any existing zone to prevent duplicates
    updatedUser.ex = updatedUser.ex.filter((c) => c !== city);
    updatedUser.os = updatedUser.os.filter((c) => c !== city);
    if (updatedUser.hq === city) updatedUser.hq = "";

    // Now, add it to the correct new zone
    if (zone === "HQ") updatedUser.hq = city;
    else if (zone === "EX") updatedUser.ex.push(city);
    else if (zone === "OS") updatedUser.os.push(city);
    
    // --- 2. Initialize or Update City Data ---
    if (!updatedUser.kms) updatedUser.kms = {};
    if (!updatedUser.da) updatedUser.da = {};
    if (!updatedUser.fares) updatedUser.fares = {};
    
    // Set the city-wide DA and KMs
    updatedUser.kms[city] = Number(km) || 0;
    updatedUser.da[city] = Number(da) || 0;

    // --- 3. Add Transport Fare ---
    // If a transport mode is selected (not the '-' placeholder for HQ)
    if (transport !== "-") {
        if (!updatedUser.fares[city]) {
            updatedUser.fares[city] = {};
        }
        updatedUser.fares[city][transport] = Number(fare) || 0;
    }

    setUser(updatedUser); // Optimistic UI update
    setNewRow({ city: "", zone: "", transport: "", km: "", fare: "", da: "" }); // Reset form
    await saveUserToBackend(updatedUser); // Persist changes
  };

  const handleDeleteRow = async (city, mode) => {
    if (!window.confirm(`Are you sure you want to delete the entry for ${city} (${mode})?`)) return;

    const updatedUser = JSON.parse(JSON.stringify(user));

    // If the mode is 'HQ', it means we delete the ENTIRE city record
    // because an HQ row represents the city itself.
    if (mode === "HQ") {
        // Remove from all zone arrays
        updatedUser.ex = updatedUser.ex.filter((c) => c !== city);
        updatedUser.os = updatedUser.os.filter((c) => c !== city);
        if (updatedUser.hq === city) updatedUser.hq = "";
        
        // Delete all associated data
        delete updatedUser.kms[city];
        delete updatedUser.da[city];
        delete updatedUser.fares[city];
    } else {
        // If it's a specific transport mode (e.g., 'bike'), just delete that fare
        if (updatedUser.fares[city]) {
            delete updatedUser.fares[city][mode];
        }
    }

    setUser(updatedUser); // Optimistic UI update
    await saveUserToBackend(updatedUser); // Persist changes
  };


  if (loading || !user) return <p className="text-center mt-8">Loading user data...</p>;

  // Build table data from the current user state
  // This logic combines data from hq, ex, os, kms, da, and fares into the flat structure the table expects
  const allCities = [...new Set([user.hq, ...user.ex, ...user.os])].filter(Boolean);
  const tableData = {};
  
  allCities.forEach((city) => {
    const cityFares = user.fares?.[city] || {};
    let zone = "N/A";
    if (city === user.hq) zone = "HQ";
    else if (user.ex?.includes(city)) zone = "EX";
    else if (user.os?.includes(city)) zone = "OS";
const transports = Object.entries(cityFares)
  // filter out unwanted keys like _id or anything that’s not a transport
  .filter(([mode]) => mode !== "_id")
  .map(([mode, fare]) => ({ mode, fare: fare || 0 }));

    tableData[city] = {
      zone,
      km: user.kms?.[city] || 0,
      da: user.da?.[city] || 0,
      transports,
    };
    
    // If it's an HQ city, ensure it appears in the table even if it has no transport modes
    if (zone === "HQ" && transports.length === 0) {
        // The FaresTable component will render this as an HQ row
    }
  });

  return (
    <Layout title={`Edit User - ${user.username}`} backTo={`/admin/dashboard`}>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <p className="mb-2 text-xl font-semibold">
          <strong>Username:</strong> {user.username}
        </p>
        <PasswordReset username={user.username} />
      </div>

      <FaresTable
        fares={tableData}
        editingRow={editingRow}
        editRow={editRow}
        onEdit={handleEdit}
        onChangeRow={setEditRow}
        onSave={handleSave}
        onCancel={() => setEditingRow(null)}
        onAddRow={handleAddRow}
        newRow={newRow}
        onChangeNewRow={setNewRow}
        onDeleteRow={handleDeleteRow}
      />
    </Layout>
  );
};

export default EditUserInfo;