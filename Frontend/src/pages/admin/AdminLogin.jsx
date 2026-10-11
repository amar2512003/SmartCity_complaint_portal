import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminLogin } from "../../api/adminAuth.api";
import { useAuth } from "../../context/AuthContext";
import Message from "../../components/Message";
import AuthLayout from "../../components/AuthLayout";
export default function AdminLogin() {
  const { t } = useTranslation("admin");
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const r = await adminLogin(form);
      login(r.data.data);
    } catch (e) {
      setMsg(e.response?.data?.message || t("login.unableToSignIn"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout admin>
      <span className="eyebrow">{t("nav.badge")}</span>
      <h2>{t("login.signIn")}</h2>
      <p className="subtitle">{t("login.subtitle")}</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="admin-email">{t("login.emailLabel")}</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder="admin@smartcity.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password">{t("login.passwordLabel")}</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? "…" : t("login.openDashboard")}{" "}
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <Message text={msg} error />
      <div className="link-row">
        <Link to="/citizen/login">← {t("login.backToCitizenPortal")}</Link>
      </div>
    </AuthLayout>
  );
}
