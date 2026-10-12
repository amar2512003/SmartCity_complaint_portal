import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AiAssistant from "../components/AiAssistant";
import InstructionsGuide from "../components/InstructionsGuide";
import Footer from "../components/Footer";
export default function CitizenLayout() {
  const isDashboard = useLocation().pathname === "/dashboard";
  return (
    <div className={`shell citizen-shell${isDashboard ? " citizen-dashboard-shell" : ""}`}>
      <AppHeader />
      <main id="main-content" className="container page">
        <Outlet />
      </main>
      <Footer />
      <AiAssistant />
      <InstructionsGuide />
    </div>
  );
}
