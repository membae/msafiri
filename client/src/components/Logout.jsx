// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ Clear stored user data
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // ✅ Redirect to login
    navigate("/login");
  };

  return (
    <div>
      <style>{`
        .logout-btn {
          padding: 10px 18px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .logout-btn:hover {
          background: #c82333;
        }
      `}</style>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
