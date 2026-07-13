import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const hc = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const hs = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/auth/register`, form);
      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to register.");
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-140px)] place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-sky-700">Smart city account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Citizen Registration</h1>
        <p className="mt-2 text-slate-600">
          Create an account to submit and manage civic complaints.
        </p>

        <form onSubmit={hs} className="mt-6 grid gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            onChange={hc}
            className="rounded-md border border-slate-300 px-3 py-3"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            onChange={hc}
            className="rounded-md border border-slate-300 px-3 py-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={hc}
            className="rounded-md border border-slate-300 px-3 py-3"
            required
          />

          <button className="rounded-md bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800">
            Register
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-900">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
