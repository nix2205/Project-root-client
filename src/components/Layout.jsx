import React from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../utils/BG_TC.png";
import logo from "../utils/TC_LOGO.png";

const Layout = ({ title, children, backTo }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="flex flex-col min-h-screen bg-white/85">
        {/* Top Bar */}
        <header className="bg-[#1f3b64] text-white p-4 flex items-center justify-between shadow-lg">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-wide text-center flex-1">
            {title}
          </h1>

          {/* Back Button */}
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="bg-white text-[#1f3b64] font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#00a6c2] hover:text-white transition"
          >
            ← Back
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-6">{children}</main>

        {/* Bottom Bar */}
        <footer className="bg-[#1f3b64] text-white text-center p-3 text-sm">
          © {new Date().getFullYear()} Truchem
        </footer>
      </div>
    </div>
  );
};

export default Layout;

