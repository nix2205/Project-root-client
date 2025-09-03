import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons
import logo from "../utils/TC_LOGO.png";
import bgImage from "../utils/BG_TC.png";

const API = process.env.REACT_APP_BACKEND_URL;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        username,
        password,
      });

      const { token } = res.data;
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/mode-selector");
      }
    } catch (err) {
      alert("Invalid login credentials");
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col min-h-screen bg-white/85">
        {/* Top Bar */}
        <header className="bg-[#1f3b64] text-white p-4 flex items-center justify-center shadow-lg">
          <h1 className="text-2xl font-bold tracking-wide">Login</h1>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center p-4">
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "2rem",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              width: "100%",
              maxWidth: "350px",
              textAlign: "center",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ margin: "0 auto 1rem auto", width: "120px", height: "auto" }}
            />

            <form onSubmit={handleLogin}>
              <input
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />

              {/* Password field with eye icon */}
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "40px" }}
                />
                <span
                  onClick={() => password && setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: password ? "pointer" : "not-allowed",
                    color: password ? "#2C3E65" : "#ccc",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              <button type="submit" style={buttonStyle}>
                Login
              </button>
            </form>
          </div>
        </main>

        {/* Bottom Bar */}
        <footer className="bg-[#1f3b64] text-white text-center p-3 text-sm">
          © {new Date().getFullYear()} Truchem
        </footer>
      </div>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#2C3E65",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};

export default LoginPage;
