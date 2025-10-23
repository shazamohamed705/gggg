import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Compontent/Header/Header.jsx";
import Home from "./Compontent/Home/Hom.jsx";
import Services from "./Compontent/Services/Services.jsx";
import About from "./pages/About.jsx";
import Blogs from "./pages/Blogs.jsx";
import Book from "./pages/Book.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./Compontent/Dashes/DashboardOptimized.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import GhymAuthLogin from "./Compontent/Authentication/GhymAuthLogin.jsx";
import GhymAuthRegister from "./Compontent/Authentication/GhymAuthRegister.jsx";
import ServiceDetails from "./pages/ServiceDetails.jsx";
import BlogDetails from "./pages/BlogDetails.jsx";
import Categories from "./pages/Categories.jsx";
import CategoryServices from "./pages/CategoryServices.jsx";
import Footer from "./Compontent/Footer/Footer.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full">
        <Routes>
          {/* Authentication Routes - No Header */}
          <Route path="/auth/login" element={<GhymAuthLogin />} />
          <Route path="/auth/register" element={<GhymAuthRegister />} />

          {/* Dashboard Routes - No Header */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<Dashboard />} />
          <Route path="/dashboard/bookings" element={<Dashboard />} />
          <Route path="/dashboard/services" element={<Dashboard />} />
          {/* Removed products dashboard route */}
          <Route path="/dashboard/notifications" element={<Dashboard />} />
          <Route path="/dashboard/settings" element={<Dashboard />} />

          {/* Add Product Route - No Header */}
          <Route path="/add-product" element={<AddProduct />} />

          {/* Main App Routes - With Header */}
          <Route
            path="/*"
            element={
              <div className="ghym-main-page-wrapper">
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/category-services" element={<CategoryServices />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:slug" element={<BlogDetails />} />
                  <Route
                    path="/service/:clinicId/:serviceId"
                    element={<ServiceDetails />}
                  />
                  <Route path="/book" element={<Book />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </div>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
