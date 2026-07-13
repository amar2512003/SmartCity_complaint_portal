import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    const getComplaint = async () => {
      try {
        const res = await axios.get(`${API_URL}/complaints/${id}`);
        setComplaint(res.data);
      } catch (err) {
        alert(err.response?.data?.message || "Unable to load complaint details.");
      }
    };

    getComplaint();
  }, [id]);

  if (!complaint) {
    return <main className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-700">{complaint.category}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{complaint.title}</h2>
          </div>
          <Link
            to={`/edit-complaint/${complaint._id}`}
            className="rounded bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
          >
            Edit
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Citizen" value={complaint.citizenName} />
          <Info label="Location" value={complaint.location} />
          <Info label="Priority" value={complaint.priority} />
          <Info label="Status" value={complaint.status} />
          <Info label="Created Date" value={new Date(complaint.createdAt).toLocaleString()} />
        </div>

        <div className="mt-6 rounded border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{complaint.description}</p>
        </div>
      </section>
    </main>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded border border-slate-200 p-4">
    <p className="text-sm font-semibold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-slate-900">{value}</p>
  </div>
);

export default ComplaintDetails;
