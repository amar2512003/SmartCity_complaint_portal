import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import heroImage from "../assets/hero.png";

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

const Home = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0,
  });

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/stats`);
        setStats(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getStats();
  }, []);

  return (
    <main className="bg-slate-50 text-slate-950">
      <section
        className="relative min-h-[620px] bg-cover bg-center px-4 py-16 text-white lg:px-6"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(2,6,23,0.92), rgba(15,23,42,0.62)), url(${heroImage})`,
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px]">
          <div className="flex min-h-[480px] flex-col justify-center">
            <p className="text-sm font-semibold uppercase text-sky-200">
              Municipal service desk
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Complaint Management and Smart City Portal
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100">
              Submit civic issues, route them by department, monitor status, and use
              Groq-powered AI assistance for faster complaint classification.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/add"
                className="rounded-md bg-sky-500 px-6 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                Submit Complaint
              </Link>
              <Link
                to="/complaints"
                className="rounded-md border border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="self-end rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-semibold uppercase text-sky-100">Live overview</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <HeroStat label="Total" value={stats.totalComplaints} />
              <HeroStat label="Pending" value={stats.pendingComplaints} />
              <HeroStat label="In Progress" value={stats.inProgressComplaints} />
              <HeroStat label="Resolved" value={stats.resolvedComplaints} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-sky-700">Departments</p>
              <h2 className="mt-2 text-3xl font-bold">Smart City Categories</h2>
            </div>
            <Link to="/add" className="font-semibold text-sky-700 hover:text-sky-900">
              Report a new issue
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 h-1.5 w-12 rounded-full bg-sky-500" />
                <p className="font-bold text-slate-950">{category}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Routed to the responsible city service team.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-12 lg:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-700">AI workflow</p>
            <h2 className="mt-2 text-3xl font-bold">Groq assistant for citizen support</h2>
            <p className="mt-4 leading-7 text-slate-600">
              The assistant helps citizens choose categories, understand complaint status,
              and get clear instructions without leaving the portal.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Step number="1" title="Describe" text="Citizen explains the issue." />
            <Step number="2" title="Classify" text="AI suggests category and priority." />
            <Step number="3" title="Track" text="Teams update complaint status." />
          </div>
        </div>
      </section>
    </main>
  );
};

const HeroStat = ({ label, value }) => (
  <div className="rounded-md border border-white/10 bg-white/10 p-4">
    <p className="text-sm text-slate-200">{label}</p>
    <p className="mt-1 text-3xl font-bold">{value}</p>
  </div>
);

const Step = ({ number, title, text }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
    <div className="grid h-9 w-9 place-items-center rounded-md bg-sky-100 font-bold text-sky-800">
      {number}
    </div>
    <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

export default Home;
