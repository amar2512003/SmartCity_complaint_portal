import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menu = [
    { name: "Dashboard", path: "/home" },
    { name: "Submit", path: "/add" },
    { name: "Complaints", path: "/complaints" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/contact" },
  ];

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-sky-100 text-sky-800"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link to={token ? "/home" : "/"} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
            SC
          </span>
          <span>
            <span className="block text-lg font-bold text-slate-950">SmartCity</span>
            <span className="block text-xs font-semibold uppercase text-slate-500">
              Complaint Portal
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {token ? (
            <>
              {menu.map((item) => (
                <NavLink key={item.path} to={item.path} className={navClass}>
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="ml-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={navClass}>
                Register
              </NavLink>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
            </>
          )}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 md:hidden"
        >
          Menu
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            {token ? (
              <>
                {menu.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={navClass}
                  >
                    {item.name}
                  </NavLink>
                ))}
                <button
                  onClick={logout}
                  className="rounded-md bg-slate-950 px-4 py-2 text-left text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" onClick={() => setOpen(false)} className={navClass}>
                  Register
                </NavLink>
                <NavLink to="/login" onClick={() => setOpen(false)} className={navClass}>
                  Login
                </NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
