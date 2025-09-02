// hooks/useUserInfo.js
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API}/api/user/info`, { headers });
        setUserInfo(res.data);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserData();
  }, []);

  return userInfo;
};
