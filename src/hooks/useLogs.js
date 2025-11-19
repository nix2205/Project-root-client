// hooks/useLogs.js
import { useState } from "react";
import axios from "axios";
import { getUserLocation, getCityFromCoords } from "../utils/getCityFromCoords";
import { getZone, getTotal } from "../utils/helpers";
import { useCallback } from "react";

const API = process.env.REACT_APP_BACKEND_URL;

export const useLogs = (userInfo) => {
  const [logs, setLogs] = useState([]);
  const [transport, setTransport] = useState("");
  const [multiPlaceData, setMultiPlaceData] = useState(null);

  // Loading states exposed by the hook
  const [isRecording, setIsRecording] = useState(false);
  const [isMultiRecording, setIsMultiRecording] = useState(false);

  // ====================== Updated cleanCityName with CityZone fallback ======================
const cleanCityName = async (rawCity, coords) => {
  console.log("cleanCityName called with:", { rawCity, coords });

  const allCities = [userInfo?.hq, ...(userInfo?.ex || []), ...(userInfo?.os || [])].filter(Boolean);

  // If backend CityZone already returned a city, prefer that (rawCity here)
  if (rawCity) {
    const normalized = rawCity.toLowerCase().trim();
    const directMatch = allCities.find((city) => normalized.includes(city.toLowerCase().trim()));
    if (directMatch) {
      console.log("Direct match found:", directMatch);
      return { city: directMatch, matchedBy: "direct" };
    }

    // If no direct match, but rawCity exists, return rawCity (might be a human-readable name)
    console.log("No direct match for rawCity, returning rawCity:", rawCity);
    return { city: rawCity, matchedBy: "raw" };
  }

  // If no rawCity, try backend CityZone again via coords (redundant but safe)
  if (coords) {
    try {
      const res = await axios.post(`${API}/api/city-zones/resolve`, { lat: coords.lat, lon: coords.lon });
      const data = res.data;
      console.log("CityZone range check response:", data);
      if (data.city && allCities.some((c) => c.toLowerCase() === data.city.toLowerCase())) {
        console.log("City matched by CityZone:", data.city);
        return { city: data.city, matchedBy: "cityzone" };
      } else if (data.city && data.city !== "Unknown") {
        // returned a city but it's not in user config
        console.log("CityZone returned a city not in user config:", data.city);
        return { city: data.city, matchedBy: "cityzone-unmatched" };
      }
    } catch (err) {
      console.warn("CityZone range check failed in cleanCityName:", err);
    }
  }

  console.log("No match found, returning Unknown");
  return { city: "Unknown", matchedBy: "none" };
};


  // ------------------ RECORD SINGLE PLACE ------------------
//   const handleRecord = useCallback(async () => {
//     setIsRecording(true);
//     try {
//       const now = new Date();
//       const coords = await getUserLocation();
//       console.log("User coordinates:", coords);

//       const { city: rawCity, matchedBy } = await getCityFromCoords(coords);
// console.log("CityZone matchedBy:", matchedBy);

//       console.log("Raw city from coords:", rawCity);

//       const city = await cleanCityName(rawCity, coords);
//       console.log("Cleaned city name:", city);

//       const zone = getZone(city, userInfo);
//       console.log("Zone determined:", zone);

//       const da = userInfo.da?.[city] || 0;
//       const kms = userInfo.kms?.[city] ?? 0;

//       const newLog = {
//         date: now.toLocaleDateString("en-GB"),
//         time: now.toLocaleTimeString(),
//         location: city,
//         zone,
//         km: kms,
//         transport: city !== userInfo.hq ? "" : "-",
//         fare: 0,
//         da,
//         total: getTotal(0, da, 0),
//         isSaved: false,
//       };

//       console.log("New log created:", newLog);

//       setLogs([newLog]);
//       setTransport(newLog.transport);
//       // return newLog in case caller needs it
//       return newLog;
//     } catch (err) {
//       console.error("Location fetch failed:", err);
//       alert("Failed to fetch location. Please enable GPS.");
//       throw err; // rethrow so calling components can react if needed
//     } finally {
//       setIsRecording(false);
//     }
//   }, [userInfo]);


const handleRecord = useCallback(async () => {
  setIsRecording(true);
  try {
    const now = new Date();

    // 1) get coords (GPS or IP fallback)
    const coords = await getUserLocation();
    console.log("User coordinates:", coords);

    // 2) ask backend city-zone resolver (we expect { city, matchedBy } or { city: null })
    const { city: rawCity, matchedBy: zoneMatchedBy } = await getCityFromCoords(coords);
    console.log("CityZone result:", { rawCity, zoneMatchedBy });

    // 3) normalize / clean the city name.
    // cleanCityName may return either:
    // - a string (legacy) OR
    // - an object like { city: 'Vijayawada', matchedBy: 'direct' }
    const cleaned = await cleanCityName(rawCity, coords);
    const city =
      typeof cleaned === "string"
        ? cleaned
        : cleaned?.city ?? (rawCity ?? "Unknown");
    const cleanMatchedBy =
      typeof cleaned === "string" ? null : cleaned?.matchedBy ?? null;

    console.log("Clean result:", { city, cleanMatchedBy });

    // 4) derive zone / allowances / kms
    const zone = getZone(city, userInfo);
    console.log("Zone determined:", zone);

    const da = userInfo?.da?.[city] ?? 0;
    const kms = userInfo?.kms?.[city] ?? 0;

    // 5) If city isn't matched to user's list, notify user (UX)
    //    -> keep the log but force the user to verify (transport empty blocks saving)
    if (!city || city === "Unknown") {
      // optional: you can show a modal instead of alert for better UX
      alert(
        "We couldn't map your exact city to your configured HQ/EX/OS. Please confirm the place or choose from your city list before saving."
      );
    }

    const newLog = {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString(),
      location: city,
      zone,
      km: kms,
      // if user is at HQ, set '-' as before; otherwise force empty string so they must confirm MOT
      transport: city === userInfo?.hq ? "-" : "",
      fare: 0,
      da,
      total: getTotal(0, da, 0),
      isSaved: false,
      // helpful debug flags (optional - remove if you don't want them saved in state)
      _meta: {
        coords,
        zoneMatchedBy,
        cleanMatchedBy,
      },
    };

    console.log("New log created:", newLog);

    setLogs([newLog]);
    setTransport(newLog.transport);
    return newLog;
  } catch (err) {
    console.error("Location fetch failed:", err);
    alert("Failed to fetch location. Please enable GPS or check your network.");
    throw err; // rethrow so calling components can react if needed
  } finally {
    setIsRecording(false);
  }
}, [userInfo]);


  // ------------------ RECORD MULTI-PLACE ------------------
  // const handleMultiplePlacesRecord = useCallback(async () => {
  //   setIsMultiRecording(true);
  //   try {
  //     const now = new Date();
  //     const coords = await getUserLocation();
  //     const { city: rawCity, matchedBy } = await getCityFromCoords(coords);
  //     console.log("CityZone matchedBy:", matchedBy);


  //     const city = await cleanCityName(rawCity, coords);
  //     const zone = getZone(city, userInfo);
  //     const kms = userInfo.kms?.[city] ?? 0;

  //     setMultiPlaceData({
  //       date: now.toLocaleDateString("en-GB"),
  //       time: now.toLocaleTimeString(),
  //       location: city,
  //       zone,
  //       km: kms,
  //       transport: "",
  //       fare: "",
  //       da: "",
  //       description: "",
  //     });
  //   } catch (err) {
  //     console.error("Multi-place location fetch failed:", err);
  //     alert("Failed to fetch location. Please enable GPS.");
  //     throw err;
  //   } finally {
  //     setIsMultiRecording(false);
  //   }
  // }, [userInfo]);

  const handleMultiplePlacesRecord = useCallback(async () => {
  setIsMultiRecording(true);
  try {
    const now = new Date();

    // 1) get coords (GPS or IP fallback)
    const coords = await getUserLocation();
    console.log("Multi-place - User coordinates:", coords);

    // 2) resolve via backend CityZone
    const { city: rawCity, matchedBy: zoneMatchedBy } = await getCityFromCoords(coords);
    console.log("Multi-place - CityZone result:", { rawCity, zoneMatchedBy });

    // 3) normalize / clean city name (supports both string and object returns)
    const cleaned = await cleanCityName(rawCity, coords);
    const city =
      typeof cleaned === "string"
        ? cleaned
        : cleaned?.city ?? (rawCity ?? "Unknown");
    const cleanMatchedBy = typeof cleaned === "string" ? null : cleaned?.matchedBy ?? null;

    console.log("Multi-place - Clean result:", { city, cleanMatchedBy });

    // 4) derive zone / kms / defaults
    const zone = getZone(city, userInfo);
    const kms = userInfo?.kms?.[city] ?? 0;
    const daDefault = userInfo?.da?.[city] ?? "";

    // 5) warn the user if we couldn't map to a known city
    if (!city || city === "Unknown") {
      // Consider replacing alert with a modal for better UX
      alert(
        "We couldn't map your location to a configured city. Please confirm the place or select from your HQ/EX/OS list before submitting."
      );
    }

    // 6) prepare multiPlaceData (transport left empty so user must fill)
    setMultiPlaceData({
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString(),
      location: city,
      zone,
      km: kms,
      transport: "",
      fare: "",
      da: daDefault,
      description: "",
      // debug/meta info — optional, remove if you don't want this persisted in state
      _meta: {
        coords,
        zoneMatchedBy,
        cleanMatchedBy,
      },
    });
  } catch (err) {
    console.error("Multi-place location fetch failed:", err);
    alert("Failed to fetch location. Please enable GPS or check your network.");
    throw err;
  } finally {
    setIsMultiRecording(false);
  }
}, [userInfo]);


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

    // 🚨 New validation: must confirm MOT before saving
    if (!log.transport || log.transport === "") {
      alert("Please select a Mode of Transport (MOT) and click 'Confirm MOT' before saving.");
      return;
    }

    if (log.location !== userInfo.hq && log.transport === "-") {
      alert("Invalid MOT: please select and confirm a valid mode of transport before saving.");
      return;
    }

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

    try {
      const existing = await axios.get(`${API}/api/user/expenses`, {
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

      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/user/add-expense`, formattedLog, {
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
      await axios.post(`${API}/api/user/add-expense`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Multi-place expense saved!");
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
    // new flags
    isRecording,
    isMultiRecording,
  };
};
