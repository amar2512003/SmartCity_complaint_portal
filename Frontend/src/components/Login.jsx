import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

const Login = () => {
  const [form, setForm] = useState({
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
      const res = await axios.post(`${API_URL}/auth/login`, form);
      if (res.data.error) {
        alert(res.data.error);
        return;
      }
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to login.");
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-140px)] place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-sky-700">Citizen access</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Login</h1>
        <p className="mt-2 text-slate-600">Track your complaints and use AI assistance.</p>

        <form onSubmit={hs} className="mt-6 grid gap-4">
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
            Login
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New citizen?{" "}
          <Link to="/" className="font-semibold text-sky-700 hover:text-sky-900">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
