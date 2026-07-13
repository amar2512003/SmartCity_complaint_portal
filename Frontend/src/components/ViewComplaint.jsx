import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

const priorityClass = {
  Low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  High: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const statusClass = {
  Pending: "bg-slate-100 text-slate-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Resolved: "bg-emerald-100 text-emerald-700",
};

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const getComplaints = async () => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      setComplaints(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/complaints`)
      .then((res) => setComplaints(res.data))
      .catch((err) => {
        alert(err.response?.data?.message || "Unable to load complaints.");
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteComplaint = async (id) => {
    if (!confirm("Delete this complaint?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/complaints/${id}`);
      alert("Complaint deleted successfully");
      getComplaints();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete complaint.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 lg:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-sky-700">Operations</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Complaint Register</h1>
              <p className="mt-2 text-slate-600">
                Review civic issues by category, priority, location, and current status.
              </p>
            </div>
            <Link
              to="/add"
              className="rounded-md bg-sky-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              New Complaint
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="p-4 text-sm font-semibold">Title</th>
                  <th className="p-4 text-sm font-semibold">Category</th>
                  <th className="p-4 text-sm font-semibold">Location</th>
                  <th className="p-4 text-sm font-semibold">Priority</th>
                  <th className="p-4 text-sm font-semibold">Status</th>
                  <th className="p-4 text-sm font-semibold">Created</th>
                  <th className="p-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td className="p-5 text-slate-600" colSpan="7">
                      Loading complaints...
                    </td>
                  </tr>
                )}

                {!loading && complaints.length === 0 && (
                  <tr>
                    <td className="p-5 text-slate-600" colSpan="7">
                      No complaints have been submitted yet.
                    </td>
                  </tr>
                )}

                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="transition hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-950">{complaint.title}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {complaint.description}
                      </p>
                    </td>
                    <td className="p-4 text-slate-700">{complaint.category}</td>
                    <td className="p-4 text-slate-700">{complaint.location}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          priorityClass[complaint.priority]
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          statusClass[complaint.status]
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/complaints/${complaint._id}`}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </Link>
                        <Link
                          to={`/edit-complaint/${complaint._id}`}
                          className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteComplaint(complaint._id)}
                          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ViewComplaint;
