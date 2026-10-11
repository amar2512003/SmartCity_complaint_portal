import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";
import LanguageToggle from "./LanguageToggle";
export default function AppHeader({ admin = false }) {
  const { t } = useTranslation(admin ? "admin" : "citizen");
  const { user, logout } = useAuth();
  return (
    <header className="app-nav">
      <div className="nav-inner">
        <Brand to={admin ? "/admin" : "/dashboard"} admin={admin} />
        <nav
          className="nav-links"
          aria-label={admin ? "Administration" : "Main navigation"}
        >
          <NavLink to={admin ? "/admin" : "/dashboard"} end>
            <span aria-hidden="true">⌂</span>
            {t(admin ? "nav.grievanceDesk" : "nav.dashboard")}
          </NavLink>
          {!admin && (
            <NavLink to="/grievance/new">
              <span aria-hidden="true">＋</span>
              {t("nav.reportIssue")}
            </NavLink>
          )}
        </nav>
        <div className="nav-user">
          <span className="avatar" aria-hidden="true">
            {(user?.name || "A").slice(0, 1)}
          </span>
          <span className="user-name">
            {admin ? t("nav.administrator") : user?.name}
          </span>
          <button className="ghost-btn signout" onClick={logout}>
            {t("nav.signOut")}
          </button>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
