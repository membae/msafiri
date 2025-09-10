import React, { useEffect, useState } from "react";

function Buses() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({ regNo: "", capacity: "" });
  const [editingId, setEditingId] = useState(null); // track bus being edited
  const [message, setMessage] = useState(null);

  // Fetch all buses
  const fetchBuses = async () => {
    try {
      const res = await fetch("http://localhost:5000/buses");
      const data = await res.json();
      if (res.ok) {
        setBuses(data);
      } else {
        setMessage({ type: "error", text: data.msg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update bus
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (editingId) {
        // PATCH (update)
        res = await fetch(`http://localhost:5000/buses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        // POST (add new)
        res = await fetch("http://localhost:5000/buses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: editingId
            ? "Bus updated successfully!"
            : "Bus added successfully!",
        });
        setForm({ regNo: "", capacity: "" });
        setEditingId(null);
        fetchBuses();
      } else {
        setMessage({ type: "error", text: data.msg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }
  };

  // Delete bus
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;

    try {
      const res = await fetch(`http://localhost:5000/buses/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.msg });
        fetchBuses();
      } else {
        setMessage({ type: "error", text: data.msg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }
  };

  // Start editing a bus
  const handleEdit = (bus) => {
    setForm({ regNo: bus.regNo, capacity: bus.capacity });
    setEditingId(bus.id);
  };

  return (
    <div className="bus-container">
      <style>{`
        .bus-container {
          padding: 20px;
          max-width: 900px;
          margin: auto;
        }
        .bus-list {
          margin-top: 20px;
        }
        .bus-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #ccc;
        }
        .bus-item p {
          margin: 0;
        }
        .bus-form {
          margin-bottom: 20px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .bus-form input {
          margin-right: 10px;
          padding: 8px;
        }
        .bus-form button {
          padding: 8px 14px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .bus-form button:hover {
          background: #0056b3;
        }
        .message {
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

      <h2>Buses</h2>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      {/* Add / Update Bus Form */}
      <form onSubmit={handleSubmit} className="bus-form">
        <input
          type="text"
          name="regNo"
          placeholder="Registration Number"
          value={form.regNo}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? "Update Bus" : "Add Bus"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ regNo: "", capacity: "" });
            }}
            style={{ marginLeft: "10px", background: "gray" }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Bus List */}
      <div className="bus-list">
        {buses.length === 0 ? (
          <p>No buses found.</p>
        ) : (
          buses.map((bus) => (
            <div key={bus.id} className="bus-item">
              <p>
                <strong>{bus.regNo}</strong> - Capacity: {bus.capacity}
              </p>
              <div>
                <button onClick={() => handleEdit(bus)}>Edit</button>{" "}
                <button onClick={() => handleDelete(bus.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Buses;
