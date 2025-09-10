import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
        });
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        alert("Profile updated successfully!");
      })
      .catch((err) => console.error("Error updating user:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (!userId) return <p>Please log in to view your profile.</p>;
  if (!user) return <p>Loading profile...</p>;

  return (
    <div>
      <Navbar />
      <style>{`
        /* Container */
        .profile-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 25px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0px 6px 12px rgba(0,0,0,0.1);
        }

        .profile-container h2 {
          text-align: center;
          margin-bottom: 25px;
          color: #222;
          font-size: 1.8rem;
        }

        /* Form groups */
        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #444;
          font-size: 0.95rem;
        }

        .form-group input {
          width: 80%;
          padding: 12px 14px;
          border: 1px solid #ccc;
          border-radius: 50px;
          font-size: 1rem;
          transition: border 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
        }

        /* Buttons */
        .btn {
          width: 100%;
          padding: 14px;
          margin-top: 10px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .update-btn {
          background: #007bff;
          color: white;
        }

        .update-btn:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }

        .logout-btn {
          background: #dc3545;
          color: white;
        }

        .logout-btn:hover {
          background: #b52a37;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .profile-container {
            margin: 20px;
            padding: 20px;
          }
          .profile-container h2 {
            font-size: 1.5rem;
          }
          .form-group input {
            font-size: 0.95rem;
          }
          .btn {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .profile-container {
            margin: 15px;
            padding: 15px;
          }
          .profile-container h2 {
            font-size: 1.3rem;
          }
          .form-group label {
            font-size: 0.9rem;
          }
          .form-group input {
            padding: 10px 12px;
            font-size: 0.9rem;
          }
          .btn {
            padding: 12px;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="profile-container">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn update-btn">
            Update Profile
          </button>
          <button type="button" className="btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
