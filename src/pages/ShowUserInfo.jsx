// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Layout from "../components/Layout";

// const API = process.env.REACT_APP_BACKEND_URL;

// const ShowUserInfo = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [newPassword, setNewPassword] = useState("");

//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get(`${API}/api/user/info`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUserInfo(res.data);
//       } catch (err) {
//         console.error("Error fetching user info", err);
//       }
//     };
//     fetchUserInfo();
//   }, []);

//   const handlePasswordReset = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `${API}/api/user/reset-password`,
//         { newPassword },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert("✅ Password updated successfully!");
//       setNewPassword("");
//     } catch (err) {
//       console.error("Error resetting password", err);
//       alert("❌ Failed to reset password");
//     }
//   };

//   if (!userInfo)
//     return (
//       <div className="p-6 text-center text-lg font-semibold text-gray-600">
//         Loading user info...
//       </div>
//     );

//   const { username, hq, ex = [], os = [], fares, kms, da } = userInfo;

//   // ✅ Build tableData (robust)
//   const tableData = {};
//   const normalize = (s) => (s || "").toString().trim();

//   const citySet = new Set([
//     ...(fares ? Object.keys(fares) : []),
//     ...(hq ? [hq] : []),
//     ...ex,
//     ...os,
//     ...(kms ? Object.keys(kms) : []),
//     ...(da ? Object.keys(da) : []),
//   ]);

//   citySet.forEach((rawCity) => {
//     const city = normalize(rawCity);
//     if (!city) return;

//     const cityFares = (fares && (fares[city] || fares[rawCity])) || {};
//     const zone =
//       city === hq
//         ? "HQ"
//         : ex.includes(city)
//         ? "EX"
//         : os.includes(city)
//         ? "OS"
//         : "";

//     let transports = [];
//     if (Array.isArray(cityFares.transports)) {
//       transports = cityFares.transports.map((t) => ({
//         mode: t.mode,
//         fare: t.fare,
//       }));
//     } else {
//       transports = Object.keys(cityFares || {})
//         .filter(
//           (mode) => typeof cityFares[mode] === "number" && cityFares[mode] > 0
//         )
//         .map((mode) => ({ mode, fare: cityFares[mode] }));
//     }

//     tableData[city] = {
//       zone,
//       km: kms?.[city] ?? kms?.[rawCity] ?? 0,
//       da: da?.[city] ?? da?.[rawCity] ?? 0,
//       transports,
//     };
//   });

//   return (
//     <Layout title="User Information" backTo="/mode-selector">
//       <div className="max-w-6xl mx-auto w-full space-y-8 p-4">
//         {/* Profile Section */}
//         <div className="bg-white shadow-md rounded-2xl p-6">
//           <h2 className="text-2xl font-bold text-[#2C3E65] mb-4 border-b pb-2">
//             Profile Details
//           </h2>
//           <p className="text-lg">
//             <strong className="font-semibold">Username:</strong> {username}
//           </p>
//         </div>

//         {/* Password Reset Section */}
//         <div className="bg-white shadow-md rounded-2xl p-6">
//           <h2 className="text-2xl font-bold text-[#2C3E65] mb-4 border-b pb-2">
//             Reset Password
//           </h2>
//           <div className="flex flex-col md:flex-row gap-4 items-center">
//             <input
//               type="password"
//               placeholder="Enter new password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
//             />
//             <button
//               onClick={handlePasswordReset}
//               disabled={!newPassword.trim()}
//               className="bg-[#2C3E65] hover:bg-[#1F2C4D] text-white px-6 py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               Update Password
//             </button>
//           </div>
//         </div>

//         {/* Fares Table */}
//         <div className="bg-white shadow-md rounded-2xl overflow-x-auto">
//           <h2 className="text-2xl font-bold text-[#2C3E65] p-6 border-b pb-2">
//             SRC
//           </h2>
//           {Object.keys(tableData).length === 0 ? (
//             <div className="p-6 text-center text-gray-500 text-lg">
//               No fare data available
//             </div>
//           ) : (
//             <table className="w-full border-collapse min-w-[700px]">
//               <thead className="bg-[#2C3E65] text-white sticky top-0">
//                 <tr>
//                   <th className="border p-3 text-left">City</th>
//                   <th className="border p-3 text-left">Zone</th>
//                   <th className="border p-3 text-left">Transport</th>
//                   <th className="border p-3 text-left">Km's</th>
//                   <th className="border p-3 text-left">Fare</th>
//                   <th className="border p-3 text-left">DA</th>
//                 </tr>
//               </thead>
//               <tbody>
//   {Object.entries(tableData)
//     // ✅ Sort: HQ first, then EX, then OS (and then anything else)
//     .sort(([cityA, dataA], [cityB, dataB]) => {
//       const order = { HQ: 0, EX: 1, OS: 2, "": 3 };
//       return order[dataA.zone] - order[dataB.zone];
//     })
//     .map(([city, data], i) => {
//       const rowColor = i % 2 === 0 ? "bg-gray-50" : "bg-white";

//       if (data.transports.length === 0) {
//         return (
//           <tr
//             key={`${city}-HQ`}
//             className={`${rowColor} hover:bg-gray-100`}
//           >
//             <td className="border p-3">{city}</td>
//             <td className="border p-3">{data.zone}</td>
//             <td className="border p-3">-</td>
//             <td className="border p-3">{data.km}</td>
//             <td className="border p-3">0</td>
//             <td className="border p-3">{data.da}</td>
//           </tr>
//         );
//       }

//       return data.transports.map((t, index) => (
//         <tr
//           key={`${city}-${index}`}
//           className={`${rowColor} hover:bg-gray-100`}
//         >
//           <td className="border p-3">{city}</td>
//           <td className="border p-3">{data.zone}</td>
//           <td className="border p-3 capitalize">{t.mode}</td>
//           <td className="border p-3">{data.km}</td>
//           <td className="border p-3">{t.fare}</td>
//           <td className="border p-3">{data.da}</td>
//         </tr>
//       ));
//     })}
// </tbody>

//             </table>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ShowUserInfo;





import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = process.env.REACT_APP_BACKEND_URL;

const ShowUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/user/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(res.data);
      } catch (err) {
        console.error("Error fetching user info", err);
      }
    };
    fetchUserInfo();
  }, []);

  const handlePasswordReset = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/api/user/reset-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error("Error resetting password", err);
      alert("❌ Failed to reset password");
    }
  };

  if (!userInfo)
    return (
      <div className="p-6 text-center text-lg font-semibold text-gray-600">
        Loading user info...
      </div>
    );

  const {
    username,
    hq = "",
    ex = [],
    os = [],
    fares = {},
    kms = {},
    da = {},
    lastReported = null,
    months = [],
  } = userInfo;

  // Build tableData robustly
  const tableData = {};
  const normalize = (s) => (s || "").toString().trim();

  const citySet = new Set([
    ...(fares ? Object.keys(fares) : []),
    ...(hq ? [hq] : []),
    ...ex,
    ...os,
    ...(kms ? Object.keys(kms) : []),
    ...(da ? Object.keys(da) : []),
  ]);

  citySet.forEach((rawCity) => {
    const city = normalize(rawCity);
    if (!city) return;

    const cityFares = (fares && (fares[city] || fares[rawCity])) || {};
    const zone =
      city === hq
        ? "HQ"
        : ex.includes(city)
        ? "EX"
        : os.includes(city)
        ? "OS"
        : "";

    let transports = [];
    if (Array.isArray(cityFares.transports)) {
      transports = cityFares.transports.map((t) => ({
        mode: t.mode,
        fare: t.fare,
      }));
    } else {
      transports = Object.keys(cityFares || {})
        .filter(
          (mode) => typeof cityFares[mode] === "number" && cityFares[mode] > 0
        )
        .map((mode) => ({ mode, fare: cityFares[mode] }));
    }

    tableData[city] = {
      zone,
      km: kms?.[city] ?? kms?.[rawCity] ?? 0,
      da: da?.[city] ?? da?.[rawCity] ?? 0,
      transports,
    };
  });

  return (
    <Layout title="User Information" backTo="/mode-selector">
      <div className="max-w-6xl mx-auto w-full space-y-8 p-4">
        {/* Profile Section */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-[#2C3E65] mb-4 border-b pb-2">
            Profile Details
          </h2>
          <p className="text-lg">
            <strong className="font-semibold">Username:</strong> {username}
          </p>
          <p className="text-lg">
            <strong className="font-semibold">Last Reported:</strong>{" "}
            {lastReported ?? "N/A"}
          </p>
        </div>

        {/* Password Reset Section */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-[#2C3E65] mb-4 border-b pb-2">
            Reset Password
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#2C3E65]"
            />
            <button
              onClick={handlePasswordReset}
              disabled={!newPassword.trim()}
              className="bg-[#2C3E65] hover:bg-[#1F2C4D] text-white px-6 py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Fares Table */}
        <div className="bg-white shadow-md rounded-2xl overflow-x-auto">
          <h2 className="text-2xl font-bold text-[#2C3E65] p-6 border-b pb-2">
            SRC
          </h2>
          {Object.keys(tableData).length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-lg">
              No fare data available
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[700px]">
              <thead className="bg-[#2C3E65] text-white sticky top-0">
                <tr>
                  <th className="border p-3 text-left">City</th>
                  <th className="border p-3 text-left">Zone</th>
                  <th className="border p-3 text-left">Transport</th>
                  <th className="border p-3 text-left">Km's</th>
                  <th className="border p-3 text-left">Fare</th>
                  <th className="border p-3 text-left">DA</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tableData)
                  .sort(([cityA, dataA], [cityB, dataB]) => {
                    const order = { HQ: 0, EX: 1, OS: 2, "": 3 };
                    return order[dataA.zone] - order[dataB.zone];
                  })
                  .map(([city, data], i) => {
                    const rowColor = i % 2 === 0 ? "bg-gray-50" : "bg-white";

                    if (data.transports.length === 0) {
                      return (
                        <tr
                          key={`${city}-HQ`}
                          className={`${rowColor} hover:bg-gray-100`}
                        >
                          <td className="border p-3">{city}</td>
                          <td className="border p-3">{data.zone}</td>
                          <td className="border p-3">-</td>
                          <td className="border p-3">{data.km}</td>
                          <td className="border p-3">0</td>
                          <td className="border p-3">{data.da}</td>
                        </tr>
                      );
                    }

                    return data.transports.map((t, index) => (
                      <tr
                        key={`${city}-${index}`}
                        className={`${rowColor} hover:bg-gray-100`}
                      >
                        <td className="border p-3">{city}</td>
                        <td className="border p-3">{data.zone}</td>
                        <td className="border p-3 capitalize">{t.mode}</td>
                        <td className="border p-3">{data.km}</td>
                        <td className="border p-3">{t.fare}</td>
                        <td className="border p-3">{data.da}</td>
                      </tr>
                    ));
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShowUserInfo;
