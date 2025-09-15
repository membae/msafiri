// src/pages/Pay.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";

function Pay() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`http://localhost:5000/booking/${bookingId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setBooking(data);
        } else {
          setMessage({ type: "error", text: data.msg || "Booking not found" });
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to fetch booking details." });
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  // Handle MPESA Payment
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!phone) {
      setMessage({ type: "error", text: "Enter phone number" });
      return;
    }

    setPaymentLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:5000/booking/${bookingId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number: phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "STK Push sent. Enter your PIN on your phone." });

        // Polling for payment status
        const startTime = Date.now();
        const interval = setInterval(async () => {
          const elapsed = Date.now() - startTime;
          if (elapsed > 1 * 60 * 1000) { // 2-minute timeout
            setPaymentLoading(false);
            setMessage({ type: "error", text: "Payment not completed. Try again." });
            clearInterval(interval);
            return;
          }

          try {
            const resStatus = await fetch(`http://localhost:5000/booking/${bookingId}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            const statusData = await resStatus.json();

            if (resStatus.ok) {
              if (statusData.paid) {
                setPaymentSuccess(true);
                setPaymentLoading(false);
                setBooking(statusData);
                setMessage({ type: "success", text: "Payment successful! Your seat is booked." });
                clearInterval(interval);
              } else if (!statusData.checkout_request_id) {
                // Transaction cancelled or failed
                setPaymentLoading(false);
                setMessage({ type: "error", text: "Payment cancelled or failed. Try again." });
                clearInterval(interval);
              }
            }
          } catch (err) {
            console.error("Error checking payment status:", err);
          }
        }, 3000);
      } else {
        setMessage({ type: "error", text: data.msg || "Payment failed." });
        setPaymentLoading(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", marginTop: "50px" }}>Loading booking details...</div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          {message ? message.text : "Booking not found"}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pay-container">
        <style>{`
          .pay-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f9f9f9;
            padding-top: 80px;
          }
          .pay-box {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
          }
          .pay-box h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          .pay-box p {
            font-size: 16px;
            margin-bottom: 8px;
          }
          .pay-box input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
          }
          .pay-box button {
            width: 100%;
            padding: 12px;
            background-color: #28a745;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .pay-box button:hover {
            background-color: #218838;
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

        <div className="pay-box">
          <h2>Pay for Booking</h2>

          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          <p><strong>From:</strong> {booking.from_loc}</p>
          <p><strong>To:</strong> {booking.to_loc}</p>
          <p><strong>Date:</strong> {booking.date}</p>
          <p><strong>Seat:</strong> {booking.seat_number}</p>
          <p><strong>Amount:</strong> KES {booking.fare}</p>

          <form onSubmit={handlePayment}>
            <label>Phone Number (MPESA):</label>
            <input
              type="text"
              placeholder="2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={paymentLoading || paymentSuccess}
            />
            <button type="submit" disabled={paymentLoading || paymentSuccess}>
              {paymentLoading ? "Processing..." : paymentSuccess ? "Paid" : "Pay Now"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Pay;
