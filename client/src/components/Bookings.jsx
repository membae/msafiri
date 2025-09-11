import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Bookings() {
  const [bookings, setBookings] = useState({ pending: [], completed: [] });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMessage("You must be logged in to view bookings.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/booking", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setBookings({
            pending: data.pending || [],
            completed: data.completed || [],
          });
        } else {
          setMessage(data.msg || "Failed to fetch bookings");
        }
      } catch (err) {
        setMessage("Server error. Try again later.");
      }
    };

    fetchBookings();
  }, []);

  return (
    <>
      <Navbar />
      <div className="bookings-container">
        <div className="bookings-box">
          <h2>Pending Bookings</h2>
          {message && <p style={{ color: "red" }}>{message}</p>}
          {bookings.pending.length === 0 && <p>No pending bookings</p>}
          {bookings.pending.map((b) => (
            <div key={b.id} className="booking-item">
              <p><strong>From:</strong> {b.from_loc}</p>
              <p><strong>To:</strong> {b.to_loc}</p>
              <p><strong>Date:</strong> {b.date}</p>
              <p><strong>Bus:</strong> {b.bus_id}</p>
              <p><strong>Seat:</strong> {b.seat_number}</p>
              <p><strong>Fare:</strong> KES {b.fare}</p>
            </div>
          ))}

          <h2>Completed Bookings</h2>
          {bookings.completed.length === 0 && <p>No completed bookings</p>}
          {bookings.completed.map((b) => (
            <div key={b.id} className="booking-item completed">
              <p><strong>From:</strong> {b.from_loc}</p>
              <p><strong>To:</strong> {b.to_loc}</p>
              <p><strong>Date:</strong> {b.date}</p>
              <p><strong>Bus:</strong> {b.bus_id}</p>
              <p><strong>Seat:</strong> {b.seat_number}</p>
              <p><strong>Fare:</strong> KES {b.fare}</p>
              <p><strong>Status:</strong> Paid ✅</p>
            </div>
          ))}
        </div>
      </div>

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
        .booking-item.completed {
          background-color: #e0ffe0;
        }
        .booking-item:last-child {
          border-bottom: none;
        }
        .booking-item p {
          margin: 5px 0;
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
    </>
  );
}

export default Bookings;
