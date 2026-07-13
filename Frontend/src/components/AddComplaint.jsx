import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400";

const AddComplaint = () => {
  const [complaint, setComplaint] = useState({
    title: "",
    description: "",
    category: "Road Damage",
    location: "",
    citizenName: "",
    priority: "Medium",
    status: "Pending",
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const navigate = useNavigate();

  const hc = (e) => {
    setComplaint({
      ...complaint,
      [e.target.name]: e.target.value,
    });
  };

  const autoCategorize = async () => {
    if (!complaint.description.trim()) {
      alert("Please enter a description before using AI categorization.");
      return;
    }

    try {
      setLoadingAi(true);
      const res = await axios.post(`${API_URL}/ai/categorize`, {
        description: complaint.description,
      });
      setComplaint({
        ...complaint,
        category: res.data.category,
        priority: res.data.priority,
      });
    } catch (err) {
      alert(err.response?.data?.message || "AI categorization failed.");
    } finally {
      setLoadingAi(false);
    }
  };

  const hs = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/complaints`, complaint);
      alert("Complaint submitted successfully");
      navigate("/complaints");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit complaint.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 lg:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-700">Citizen report</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Submit a Smart City Complaint
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Provide the issue details once. The AI assistant can suggest the right
              category and priority before you submit.
            </p>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            Status starts as Pending
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={hs}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Complaint Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Example: Street light not working near market"
                  value={complaint.title}
                  onChange={hc}
                  className={fieldClass}
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={autoCategorize}
                    disabled={loadingAi}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingAi ? "Analyzing..." : "Auto Categorize using AI"}
                  </button>
                </div>
                <textarea
                  name="description"
                  placeholder="Describe what happened, where it is, and any urgency citizens should know about."
                  value={complaint.description}
                  onChange={hc}
                  className={`${fieldClass} min-h-36 resize-y`}
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={complaint.category}
                    onChange={hc}
                    className={fieldClass}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Ward, landmark, street, or area"
                    value={complaint.location}
                    onChange={hc}
                    className={fieldClass}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Citizen Name
                  </label>
                  <input
                    type="text"
                    name="citizenName"
                    placeholder="Full name"
                    value={complaint.citizenName}
                    onChange={hc}
                    className={fieldClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={complaint.priority}
                    onChange={hc}
                    className={fieldClass}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={complaint.status}
                    onChange={hc}
                    className={fieldClass}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => navigate("/complaints")}
                  className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View Complaints
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-sky-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-800"
                >
                  Submit Complaint
                </button>
              </div>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">AI Routing Preview</h2>
              <div className="mt-4 space-y-3">
                <PreviewRow label="Category" value={complaint.category} />
                <PreviewRow label="Priority" value={complaint.priority} />
                <PreviewRow label="Status" value={complaint.status} />
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <h2 className="font-bold">Faster resolution tips</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li>Include a landmark or ward number.</li>
                <li>Mention safety risks in the description.</li>
                <li>Use High priority only for urgent public impact.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

const PreviewRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3">
    <span className="text-sm font-semibold text-slate-500">{label}</span>
    <span className="font-bold text-slate-950">{value}</span>
  </div>
);

export default AddComplaint;
