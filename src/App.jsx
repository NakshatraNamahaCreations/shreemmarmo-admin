import React from "react";
import { BrowserRouter, Routes, Route, Outlet, NavLink } from "react-router-dom";

import Category from "./Components/Category";
import Subcategory from "./Components/Subcategory";
import Product from "./Components/Product";
import Productdetails from "./Components/Productdetails";
import Qrgenerate from "./Components/Qrgenerate";
import Login from "./Components/Login";

/** ✅ Header Component (active bg change using NavLink) */
function Header() {
  const baseLink = {
    padding: "10px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    fontFamily: "Poppins",
    fontSize: "13px",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.16)",
    transition: "all 0.2s ease",
  };

  const navStyle = ({ isActive }) => ({
    ...baseLink,
    color: "#fff",
    background: isActive ? "#8D5660" : "rgba(255,255,255,0.10)", // ✅ active bg
    borderColor: isActive ? "#8D5660" : "rgba(255,255,255,0.16)",
  });

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#434252",
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "#fff", fontFamily: "Poppins" }}>
          <div style={{ fontSize: "14px", fontWeight: 900 }}>Admin Panel</div>
          <div style={{ fontSize: "12px", opacity: 0.75 }}>
            Category • Subcategory • Product • QR
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>


          <NavLink to="/" style={navStyle}>
            Product
          </NavLink>

          <NavLink to="/generate-qr" style={navStyle}>
            QR
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function LayoutWithHeader() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWithHeader />}>

          <Route path="/product" element={<Product />} />
          <Route path="/generate-qr" element={<Qrgenerate />} />
        </Route>

        <Route path="/Productdetails/:id" element={<Productdetails />} />
        <Route path="/" element={<Login />} />


        <Route
          path="*"
          element={
            <h2 style={{ textAlign: "center", fontFamily: "Poppins" }}>
              Page Not Found
            </h2>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
