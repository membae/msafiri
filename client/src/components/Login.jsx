// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store tokens
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        // ✅ Store both user object & user_id
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", data.user.id);

        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMessage({ type: "error", text: data.msg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #e3e8ecff, #00c6ff);
          padding: 20px;
        }
        .login-box {
          background: #fff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0px 6px 16px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 400px;
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        .login-box h2 {
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        }
        .login-box form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .login-box input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .login-box input:focus {
          border-color: #007bff;
          outline: none;
          box-shadow: 0px 0px 5px rgba(0,123,255,0.4);
        }
        .login-box button {
          padding: 12px;
          background: #007bff;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .login-box button:hover {
          background: #0056b3;
        }
        .login-box button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
        .login-box p {
          margin-top: 15px;
          font-size: 14px;
          color: #555;
        }
        .login-box p span {
          color: #007bff;
          cursor: pointer;
          font-weight: bold;
        }
        .login-box p span:hover {
          text-decoration: underline;
        }
        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 6px;
          font-size: 14px;
        }
        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .login-box {
            padding: 20px;
          }
          .login-box h2 {
            font-size: 20px;
          }
          .login-box input, .login-box button {
            font-size: 14px;
            padding: 10px;
          }
        }
      `}</style>

      <div className="login-box">
        <h2>Login</h2>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Signup</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
