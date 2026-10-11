import { useTranslation } from "react-i18next";
import Brand from "./Brand";
import LanguageToggle from "./LanguageToggle";
export default function AuthLayout({
  children,
  signup = false,
  admin = false,
}) {
  const { t } = useTranslation(admin ? "admin" : "citizen");
  return (
    <div className={`auth-page ${admin ? "admin-auth" : ""}`}>
      <LanguageToggle />
      <section className="auth-visual">
        <Brand />
        <div className="auth-copy">
          <span className="eyebrow">
            {t(
              admin
                ? "login.eyebrow"
                : signup
                  ? "signup.eyebrow"
                  : "brand.tagline",
            )}
          </span>
          <h1>
            {t(
              admin
                ? "login.heading"
                : signup
                  ? "signup.heading"
                  : "login.heading",
            )}
          </h1>
          <p>
            {t(admin ? "login.intro" : signup ? "signup.intro" : "login.intro")}
          </p>
          <span className="city-signature">
            Kolkata<span aria-hidden="true"> ♥</span>
          </span>
        </div>
        <div className="auth-art" aria-hidden="true" />
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <Brand admin={admin} />
          {children}
        </div>
      </section>
    </div>
  );
}
