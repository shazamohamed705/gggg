import React from "react";
import { Navigate } from "react-router-dom";

const Categories = () => {
  // Redirect to services page since categories are now displayed in services
  return <Navigate to="/services" replace />;
};

export default Categories;
