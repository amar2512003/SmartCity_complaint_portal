import { Link } from "react-router-dom";
export default function Brand({ to = "/citizen/login", admin = false }) {
  return (
    <Link className="brand" to={to} aria-label="Samadhan home">
      <span className="brand-symbol" aria-hidden="true">
        ক
      </span>
      <span className="brand-wordmark">
        Samadhan.<small>{admin ? "ADMIN" : "Kolkata"}</small>
      </span>
    </Link>
  );
}
