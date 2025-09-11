import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect
import Navbar from "./Navbar";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState(null);
  const [showLoginBtn, setShowLoginBtn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!token || !userId) {
        setMessage({ type: "error", text: "You must be logged in to view bookings." });
        setShowLoginBtn(true); // ✅ show login button
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setBookings(data.booking || []);
          setShowLoginBtn(false);
        } else {
          setMessage({ type: "error", text: data.msg });
        }
      } catch (err) {
        setMessage({ type: "error", text: "Server error. Try again later." });
      }
    };

    fetchBookings();
  }, []);

  const handleLoginRedirect = () => {
    navigate("/login"); // redirect to login page
  };

  return (
    <>
      <Navbar />

      <div className="bookings-container">
        <style>{`
          .bookings-container {
            min-height: 100vh;
            background-color: #f3f3f3;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 100px 20px 40px;
          }
          .bookings-box {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 800px;
            text-align: center;
          }
          .bookings-box h2 {
            margin-bottom: 20px;
          }
          .booking-item {
            border-bottom: 1px solid #ccc;
            padding: 15px 0;
          }
          .booking-item:last-child {
            border-bottom: none;
          }
          .booking-item p {
            margin: 5px 0;
          }
          .message {
            text-align: center;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
          }
          .message.success {
            background-color: #d4edda;
            color: #155724;
          }
          .message.error {
            background-color: #f8d7da;
            color: #721c24;
          }
          .login-btn {
            background-color: #007bff;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 15px;
          }
          .login-btn:hover {
            background-color: #0056b3;
          }

          @media (max-width: 600px) {
            .bookings-box {
              padding: 20px;
            }
            .booking-item p {
              font-size: 14px;
            }
          }
        `}</style>

        <div className="bookings-box">
          <h2>My Bookings</h2>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {showLoginBtn && (
            <button className="login-btn" onClick={handleLoginRedirect}>
              Login
            </button>
          )}

          {bookings.length === 0 && !message && !showLoginBtn && <p>No bookings found.</p>}

          {bookings.map(booking => (
            <div key={booking.id} className="booking-item">
              <p><strong>From:</strong> {booking.from_loc}</p>
              <p><strong>To:</strong> {booking.to_loc}</p>
              <p><strong>Date:</strong> {booking.date}</p>
              <p><strong>Bus:</strong> {booking.bus_id}</p>
              <p><strong>Seat Number:</strong> {booking.seat_number}</p>
              <p><strong>Fare:</strong> KES {booking.fare}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Bookings;
