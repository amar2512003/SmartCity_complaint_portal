import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

const categories = [
  "Road Damage",
  "Water Supply",
  "Electricity",
  "Garbage Collection",
  "Street Lights",
  "Drainage",
  "Public Transport",
  "Environment",
];

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState({
    title: "",
    description: "",
    category: "Road Damage",
    location: "",
    citizenName: "",
    priority: "Medium",
    status: "Pending",
  });

  useEffect(() => {
    const getComplaint = async () => {
      try {
        const res = await axios.get(`${API_URL}/complaints/${id}`);
        setComplaint(res.data);
      } catch (err) {
        alert(err.response?.data?.message || "Unable to load complaint.");
      }
    };

    getComplaint();
  }, [id]);

  const hc = (e) => {
    setComplaint({
      ...complaint,
      [e.target.name]: e.target.value,
    });
  };

  const hs = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/complaints/${id}`, complaint);
      alert("Complaint updated successfully");
      navigate("/complaints");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update complaint.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900">Edit Complaint</h2>

        <form onSubmit={hs} className="mt-6 grid gap-4">
          <input
            type="text"
            name="title"
            value={complaint.title}
            onChange={hc}
            className="rounded border border-slate-300 p-3"
            required
          />

          <textarea
            name="description"
            value={complaint.description}
            onChange={hc}
            className="min-h-28 rounded border border-slate-300 p-3"
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              name="category"
              value={complaint.category}
              onChange={hc}
              className="rounded border border-slate-300 p-3"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="location"
              value={complaint.location}
              onChange={hc}
              className="rounded border border-slate-300 p-3"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              name="citizenName"
              value={complaint.citizenName}
              onChange={hc}
              className="rounded border border-slate-300 p-3"
              required
            />

            <select
              name="priority"
              value={complaint.priority}
              onChange={hc}
              className="rounded border border-slate-300 p-3"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select
              name="status"
              value={complaint.status}
              onChange={hc}
              className="rounded border border-slate-300 p-3"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <button className="rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
            Update Complaint
          </button>
        </form>
      </section>
    </main>
  );
};

export default EditComplaint;
