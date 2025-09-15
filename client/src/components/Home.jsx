// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirecting
import Navbar from "./Navbar";

function Home() {
  const [locations, setLocations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    bus_id: "",
    seat_number: "",
  });
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.from && formData.to) {
      fetch("http://localhost:5000/buses")
        .then((res) => res.json())
        .then((data) => {
          const availableBuses = data.map((bus) => {
            const bookedSeats = bus.bookings?.map((b) => b.seat_number) || [];
            return { ...bus, bookedSeats };
          });
          setBuses(availableBuses);
        })
        .catch((err) => console.error(err));
    }
  }, [formData.from, formData.to]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.bus_id || !formData.seat_number) {
      setMessage({ type: "error", text: "Please select a bus and seat." });
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:5000/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_loc: formData.from,
          to_loc: formData.to,
          date: formData.date,
          bus_id: formData.bus_id,
          seat_number: formData.seat_number,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Booking successful! Redirecting to payment..." });

        // ✅ Redirect to Pay page with bookingId
        setTimeout(() => {
          navigate(`/payment/${data.id}`);
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.msg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }
  };

  return (
    <>
      <Navbar />

      <div className="home-container">
        <style>{`
          .home-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f3f3f3;
            padding-top: 80px;
          }
          .home-box {
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 500px;
          }
          .home-box h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .home-box select, .home-box input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
          }
          .home-box button {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .home-box button:hover {
            background-color: #0056b3;
          }
          .message {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            text-align: center;
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

        <div className="home-box">
          <h2>Book a Bus</h2>

          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleBooking}>
            <label>From:</label>
            <select
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <label>To:</label>
            <select
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            {buses.length > 0 && (
              <>
                <label>Select Bus:</label>
                <select
                  name="bus_id"
                  value={formData.bus_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.regNo} -{" "}
                      {bus.capacity - bus.bookedSeats.length} seats available
                    </option>
                  ))}
                </select>

                {formData.bus_id && (
                  <>
                    <label>Seat Number:</label>
                    <input
                      type="number"
                      name="seat_number"
                      min="1"
                      max={
                        buses.find(
                          (bus) => bus.id === parseInt(formData.bus_id)
                        )?.capacity || 1
                      }
                      value={formData.seat_number}
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
              </>
            )}

            <button type="submit">Book Now</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Home;
