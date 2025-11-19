const API = process.env.REACT_APP_BACKEND_URL;


export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your device."));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,           
        });
      },
      (err) => {
        console.error("GPS failed:", err.message);
        reject(new Error("Could not fetch GPS location. Please enable location."));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};

// NEW: resolve city using backend CityZone only
export const getCityFromCoords = async ({ lat, lon }) => {
  if (!lat || !lon) return { city: null, fullAddress: null, matchedBy: null };

  try {
    const res = await fetch(`${API}/api/city-zones/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });

    if (!res.ok) {
      console.warn("CityZone resolve returned non-OK:", res.status);
      return { city: null, fullAddress: null, matchedBy: null };
    }

    const json = await res.json();
    // backend returns { city: "...", matchedBy: "custom-zone" } or { city: "Unknown", matchedBy: "none" }
    if (!json || !json.city) return { city: null, fullAddress: null, matchedBy: null };

    // Normalize: return null instead of string "Unknown"
    const city = json.city === "Unknown" ? null : json.city;
    return { city, fullAddress: null, matchedBy: json.matchedBy || null };
  } catch (err) {
    console.error("Failed to resolve city from backend:", err);
    return { city: null, fullAddress: null, matchedBy: null };
  }
};
