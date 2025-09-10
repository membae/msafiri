import React, { useEffect, useState } from "react";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState(null);

useEffect(() => {
  const fetchBookings = async () => {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");  // 👈 get raw string
    const user = userStr ? JSON.parse(userStr) : null; // 👈 safely parse
    const userId = user?.id;  // 👈 extract id

    if (!token || !userId) {
      setMessage({ type: "error", text: "You must be logged in to view bookings." });
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
        // API returns { id, first_name, ..., booking: [ ... ] }
        setBookings(data.booking || []);
      } else {
        setMessage({ type: "error", text: data.msg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }
  };

  fetchBookings();
}, []);


  return (
    <div className="bookings-container">
      <style>{`
        .bookings-container {
          min-height: 100vh;
          background-color: #f3f3f3;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 0;
        }
        .bookings-box {
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 800px;
        }
        .bookings-box h2 {
          text-align: center;
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
      `}</style>

      <div className="bookings-box">
        <h2>My Bookings</h2>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {bookings.length === 0 && !message && <p>No bookings found.</p>}

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
  );
}

export default Bookings;
