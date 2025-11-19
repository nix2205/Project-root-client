// // utils/getCityFromCoords.js
// // Fallback: IP-based geolocation
// const getLocationByIP = async () => {
//   try {
//     const response = await fetch("https://ipapi.co/json/");
//     const data = await response.json();
//     if (data?.latitude && data?.longitude) {
//       return { lat: data.latitude, lon: data.longitude };
//     }
//     throw new Error("IP location not available");
//   } catch (err) {
//     console.error("Failed to fetch IP location:", err);
//     throw err;
//   }
// };

// // Main GPS fetcher
// export const getUserLocation = () => {
//   return new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       console.warn("Geolocation not supported, trying IP...");
//       getLocationByIP()
//         .then(resolve)
//         .catch(() => reject(new Error("Could not fetch location")));
//     } else {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           resolve({
//             lat: pos.coords.latitude,
//             lon: pos.coords.longitude,
//           });
//         },
//         async (err) => {
//           console.warn("GPS failed:", err.message, " → trying IP...");
//           try {
//             const ipLoc = await getLocationByIP();
//             resolve(ipLoc);
//           } catch {
//             reject(new Error("Could not fetch location"));
//           }
//         },
//         { timeout: 10000, enableHighAccuracy: true }
//       );
//     }
//   });
// };

// // Reverse geocode via OpenCage
// export const getCityFromCoords = async ({ lat, lon }) => {
//   const key = process.env.REACT_APP_OPENCAGE_API_KEY;

//   if (!key) {
//     console.error("Missing OpenCage API key!");
//     return { city: null, fullAddress: null };
//   }

//   const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${key}&language=en&no_annotations=1`;
  
//   try {
//     const res = await fetch(url);
//     const json = await res.json();
//     console.log("OpenCage response:", json);

//     if (!json.results?.length) return { city: null, fullAddress: null };

//     const components = json.results[0].components;
//     const fullAddress = json.results[0].formatted;

//     console.log("🗺️ OpenCage API Detailed Info:");
//     console.log("Coordinates:", { lat, lon });
//     console.log("Full Address:", fullAddress);
//     console.log("Components:", components);
//     console.log("City picked by OpenCage:", 
//       components.city || components.town || components.village || components.county || null
//     );
    
//     const city =
//       components.city ||
//       components.town ||
//       components.village ||
//       components.county ||
//       null;

//     return { city, fullAddress };
//   } catch (err) {
//     console.error("Failed to fetch city from coordinates:", err);
//     return { city: null, fullAddress: null };
//   }
// };


// utils/getCityFromCoords.js
// Now uses your backend CityZone resolver only.
// Returns: { city: string|null, matchedBy: string|null, fullAddress: null }

const API = process.env.REACT_APP_BACKEND_URL;

export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported, trying IP...");
      getLocationByIP()
        .then(resolve)
        .catch(() => reject(new Error("Could not fetch location")));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        async (err) => {
          console.warn("GPS failed:", err.message, " → trying IP...");
          try {
            const ipLoc = await getLocationByIP();
            resolve(ipLoc);
          } catch {
            reject(new Error("Could not fetch location"));
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  });
};

// Fallback: IP-based geolocation (unchanged)
const getLocationByIP = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data?.latitude && data?.longitude) {
      return { lat: data.latitude, lon: data.longitude };
    }
    throw new Error("IP location not available");
  } catch (err) {
    console.error("Failed to fetch IP location:", err);
    throw err;
  }
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
