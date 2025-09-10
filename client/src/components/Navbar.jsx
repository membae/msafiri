// Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <style>
        {`
          .navbar {
            background: #f8f8f8;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .navbar-logo {
            font-size: 22px;
            font-weight: bold;
            color: black;
            text-decoration: none;
          }

          .navbar-links {
            display: flex;
            gap: 20px;
          }

          .navbar-links a {
            text-decoration: none;
            color: black;
            font-size: 16px;
            transition: color 0.3s ease;
          }

          .navbar-links a:hover {
            color: #1e90ff; /* blueish hover */
          }

          /* Responsive for small screens */
          @media (max-width: 600px) {
            .navbar {
              flex-direction: column;
              align-items: flex-start;
            }
            .navbar-links {
              flex-direction: column;
              gap: 10px;
              margin-top: 10px;
            }
          }
        `}
      </style>

      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="navbar-logo">MyBusApp</Link>

        {/* Links */}
        <div className="navbar-links">
          <Link to="/home">Home</Link>
          <Link to="/booking">Bookings</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
