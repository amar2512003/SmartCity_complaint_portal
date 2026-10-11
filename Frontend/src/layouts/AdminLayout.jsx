import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import Footer from "../components/Footer";
export default function AdminLayout() {
  return (
    <div className="shell admin-shell">
      <AppHeader admin />
      <main id="main-content" className="container page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
