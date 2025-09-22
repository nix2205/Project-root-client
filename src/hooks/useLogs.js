

// hooks/useLogs.js
import { useState } from "react";
import axios from "axios";
import { getUserLocation, getCityFromCoords } from "../utils/getCityFromCoords";
import { getZone, getTotal } from "../utils/helpers";

const API = process.env.REACT_APP_BACKEND_URL;

export const useLogs = (userInfo) => {
  const [logs, setLogs] = useState([]);
  const [transport, setTransport] = useState("");
  const [multiPlaceData, setMultiPlaceData] = useState(null);

  // ====================== Updated cleanCityName with CityZone fallback ======================
  const cleanCityName = async (rawCity, coords) => {
    console.log("cleanCityName called with:", { rawCity, coords });

    if (!rawCity || !userInfo) {
      console.log("No rawCity or userInfo available, returning 'Unknown'");
      return "Unknown";
    }

    const normalized = rawCity.toLowerCase();
    const allCities = [userInfo.hq, ...(userInfo.ex || []), ...(userInfo.os || [])];
    console.log("All user cities:", allCities);

    // 1️⃣ Direct match
    const directMatch = allCities.find((city) => normalized.includes(city.toLowerCase().trim()));
    if (directMatch) {
      console.log("Direct match found:", directMatch);
      return directMatch;
    }

    // 2️⃣ CityZone range check fallback
    if (coords) {
      try {
        console.log("Calling CityZone API with coords:", coords);
        const res = await axios.post(`${API}/api/city-zones/resolve`, {
          lat: coords.lat,
          lon: coords.lon,
        });
        const data = res.data; // { city, matchedBy }
        console.log("CityZone range check response:", data);

        if (data.city && allCities.some((c) => c.toLowerCase() === data.city.toLowerCase())) {
          console.log("City matched by CityZone:", data.city);
          return data.city;
        } else {
          console.log("CityZone returned a city but it does not match user cities");
        }
      } catch (err) {
        console.warn("CityZone range check failed in cleanCityName:", err);
      }
    }

    // 3️⃣ If all fails, return rawCity
    console.log("No match found, returning rawCity:", rawCity);
    return rawCity || "Unknown";
  };

  const handleRecord = async () => {
    try {
      const now = new Date();
      const coords = await getUserLocation();
      console.log("User coordinates:", coords);

      const { city: rawCity } = await getCityFromCoords(coords);
      console.log("Raw city from coords:", rawCity);

      const city = await cleanCityName(rawCity, coords);
      console.log("Cleaned city name:", city);

      const zone = getZone(city, userInfo);
      console.log("Zone determined:", zone);

      const da = userInfo.da?.[city] || 0;
      const kms = userInfo.kms?.[city] ?? 0;

      const newLog = {
        date: now.toLocaleDateString("en-GB"),
        time: now.toLocaleTimeString(),
        location: city,
        zone,
        km: kms,
        transport: city !== userInfo.hq ? "" : "-",
        fare: 0,
        da,
        total: getTotal(0, da, 0),
        isSaved: false,
      };

      console.log("New log created:", newLog);

      setLogs([newLog]);
      setTransport(newLog.transport);
    } catch (err) {
      console.error("Location fetch failed:", err);
      alert("Failed to fetch location. Please enable GPS.");
    }
  };

  const handleMultiplePlacesRecord = async () => {
    try {
      const now = new Date();
      const coords = await getUserLocation();
      const { city: rawCity } = await getCityFromCoords(coords);

      const city = await cleanCityName(rawCity, coords);
      const zone = getZone(city, userInfo);
      const kms = userInfo.kms?.[city] ?? 0;

      setMultiPlaceData({
        date: now.toLocaleDateString("en-GB"),
        time: now.toLocaleTimeString(),
        location: city,
        zone,
        km: kms,
        transport: "",
        fare: "",
        da: "",
        description: "",
      });
    } catch (err) {
      console.error("Multi-place location fetch failed:", err);
      alert("Failed to fetch location. Please enable GPS.");
    }
  };

  const handleApplyTransport = () => {
    if (!userInfo || logs.length === 0) return;
    const updated = [...logs];
    const city = updated[0].location;
    if (city === userInfo.hq) return;

    const fare = userInfo.fares?.[city]?.[transport] || 0;
    const kms = userInfo.kms?.[city] ?? 0;
    updated[0].transport = transport;
    updated[0].fare = fare;
    updated[0].km = kms;
    updated[0].total = getTotal(fare, updated[0].da, 0);
    setLogs(updated);
  };

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatTimeAMPM = (time) => {
    if (!time) return "";
    let [hour, minute] = time.split(":");
    let ampm = "AM";
    hour = parseInt(hour, 10);
    if (hour >= 12) {
      ampm = "PM";
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const handleSaveExpenses = async () => {
    if (logs.length === 0 || logs[0].isSaved) {
      alert("Nothing to save.");
      return;
    }

    const log = logs[0];

    const formatDate = (dateStr) => {
      if (dateStr.includes("/")) return dateStr;
      if (dateStr.includes("-")) {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      }
      const d = new Date();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formattedDate = formatDate(log.date);

    const existing = await axios.get(`${API}/user/expenses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const alreadyExists = existing.data.some(
      (e) => e.date === formattedDate && !e.isSpecial
    );

    if (alreadyExists) {
      alert("A normal expense already exists for today. You cannot add another.");
      return;
    }

    const formattedLog = {
      ...log,
      date: formattedDate,
      location: capitalizeWords(log.location),
      transport: capitalizeWords(log.transport),
      time: formatTimeAMPM(log.time),
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/user/add-expense`, formattedLog, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Expense saved!");
      setLogs([{ ...formattedLog, isSaved: true }]);
    } catch (err) {
      console.error("Error saving field work:", err);
      alert("Failed to save. Please try again.");
    }
  };

  const handleSaveMultiPlace = async () => {
    if (!multiPlaceData) return alert("No multi-place data to save.");
    if (multiPlaceData.fare === "" || multiPlaceData.da === "")
      return alert("Please fill fare and DA.");

    const payload = {
      ...multiPlaceData,
      location: capitalizeWords(multiPlaceData.location),
      transport: capitalizeWords(multiPlaceData.transport),
      time: formatTimeAMPM(multiPlaceData.time),
      fare: Number(multiPlaceData.fare),
      da: Number(multiPlaceData.da),
      total: Number(multiPlaceData.fare) + Number(multiPlaceData.da),
      isSpecial: true,
      locationDesc: multiPlaceData.description ?? null,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/user/add-expense`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Multi-place expense saved! Marked as special.");
      setMultiPlaceData(null);
    } catch (err) {
      console.error("Error saving multi-place:", err);
      alert("Failed to save multi-place expense.");
    }
  };

  return {
    logs,
    transport,
    multiPlaceData,
    handleRecord,
    handleMultiplePlacesRecord,
    handleApplyTransport,
    handleSaveExpenses,
    handleSaveMultiPlace,
    setTransport,
    setMultiPlaceData,
  };
};
