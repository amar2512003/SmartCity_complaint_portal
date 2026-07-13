import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import AddComplaint from "./components/AddComplaint";
import ComplaintDetails from "./components/ComplaintDetails";
import EditComplaint from "./components/EditComplaint";
import ViewComplaint from "./components/ViewComplaint";
import PrivateRoute from "./utils/PrivateRoute";
import Register from "./components/Register";
import Login from "./components/Login";
import Cart from "./components/Cart";
import Success from "./components/Success";
import ChatBot from "./components/ChatBot";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/add" element={<AddComplaint />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/edit-complaint/:id" element={<EditComplaint />} />
            <Route path="/complaints" element={<ViewComplaint />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/success" element={<Success />} />
          </Route>
        </Routes>
        <ChatBot />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
