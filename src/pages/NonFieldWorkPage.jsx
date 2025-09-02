import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Layout from "../components/Layout";

const API = process.env.REACT_APP_BACKEND_URL;

const NonFieldWorkPage = () => {
  const [activity, setActivity] = useState("Meeting");
  const [customActivity, setCustomActivity] = useState("");
  const [zone, setZone] = useState("hq");
  const [km, setKm] = useState("");
  const [fare, setFare] = useState("");
  const [da, setDa] = useState("");
  const [transport, setTransport] = useState("-");
  const navigate = useNavigate();

  const handleSave = async () => {
    const date = dayjs().format("DD/MM/YYYY");
    const time = dayjs().format("h:mm:ss A");
    const finalLocation = activity === "Others" ? customActivity : activity;

    const parsedKm = parseFloat(km) || 0;
    const parsedFare = parseFloat(fare) || 0;
    const parsedDa = parseFloat(da) || 0;
    const total = parsedFare + parsedDa;

    const payload = {
      date,
      time,
      location: finalLocation,
      transport,
      zone,
      km: parsedKm,
      fare: parsedFare,
      da: parsedDa,
      total,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/user/add-expense`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Saved!");
      navigate("/mode-selector");
    } catch (err) {
      console.error("Error saving non-field work:", err);
      if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        alert("Failed to save. Please try again.");
      }
    }
  };

  return (
    <Layout title="NON-FIELD WORK" backTo="/mode-selector">
      {/* Main Content */}
      <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
        {/* Activity Selection */}
        <div>
          <label className="block font-medium mb-1">Select Activity</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Meeting</option>
            <option>Transit</option>
            <option>Training</option>
            <option>Depot Work</option>
            <option>Others</option>
          </select>
          {activity === "Others" && (
            <input
              type="text"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="Enter custom activity"
              className="w-full mt-2 border p-2 rounded"
            />
          )}
        </div>

        {/* Zone */}
        <div>
          <label className="block font-medium mb-1">HQ/EX/OS</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="hq">HQ</option>
            <option value="ex">EX</option>
            <option value="os">OS</option>
          </select>
        </div>

        {/* Distance */}
        <div>
          <label className="block font-medium mb-1">KM's</label>
          <input
            type="number"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Mode of Transport */}
        <div>
          <label className="block font-medium mb-1">MOT</label>
          <select
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="-">-</option>
            <option value="bus">Bus</option>
            <option value="bike">Bike</option>
            <option value="train">Train</option>
          </select>
        </div>

        {/* TA */}
        <div>
          <label className="block font-medium mb-1">TA</label>
          <input
            type="number"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* DA */}
        <div>
          <label className="block font-medium mb-1">DA</label>
          <input
            type="number"
            value={da}
            onChange={(e) => setDa(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Total */}
        <div className="text-right text-gray-700 font-medium">
          Total: ₹{(parseFloat(fare) || 0) + (parseFloat(da) || 0)}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSave}
          className="bg-[#2C3E65] hover:bg-[#1f2a46] text-white w-full py-2 rounded-xl shadow font-semibold"
        >
          Submit
        </button>
      </div>
    </Layout>
  );
};

export default NonFieldWorkPage;
