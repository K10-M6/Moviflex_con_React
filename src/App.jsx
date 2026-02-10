import React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Login from "./pages/Login"
import HomeBase from "./pages/HomeBase";
import Register from "./pages/Register";
import AdminConductores from "./pages/Admin/AdminConductores";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";
import AdminVehiculos from "./pages/Admin/AdminVehiculos";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import Viajes from "./pages/Admin/ViajesAdmin";
import "./App.css";
import RegisterDocumentacion from "./pages/Documents";
import AdminDocuments from "./pages/Admin/AdminDocuments";

function App() {

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const OpenSidebar =() => {
    setOpenSidebarToggle(!openSidebarToggle);
  }
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeBase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RequiredAuth><Dashboard /></RequiredAuth>} />
          <Route path="/admin/conductores" element={ <AdminConductores />} />
          <Route path="/admin/usuarios" element={<RequiredAuth> <AdminUsuarios /></RequiredAuth>} />
          <Route path="/admin/vehiculos" element={<RequiredAuth> <AdminVehiculos /></RequiredAuth>} />
          <Route path="/admin/viajes" element={<RequiredAuth> <Viajes/></RequiredAuth>} />
          <Route path="/documentacion" element={ <RegisterDocumentacion />}/>
          <Route path="/admin/documentacion" element={<RequiredAuth> <AdminDocuments/></RequiredAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

function RequiredAuth({ children }) {
  const { token, usuario } = useAuth();
  const location = window.location.pathname;
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  const idRol = usuario?.idRol || usuario?.rol?.id;

  if (location === "/") {
    if (idRol === 1 || usuario?.role === 'admin') return <Navigate to="/dashboard" />;
    if (idRol === 2 || idRol === "2") return <Navigate to="/driver-home" />;
    if (idRol === 3 || idRol === "3") return <Navigate to="/user-home" />;
  }

  if (location === "/profile" && (idRol === 2 || idRol === "2")) {
    return <Navigate to="/driver-profile" />;
  }

  if (location === "/driver-profile" && (idRol === 3 || idRol === "3")) {
    return <Navigate to="/profile" />;
  }

  const isAdminPath = location.includes("admin") || location === "/dashboard";
  if (isAdminPath && usuario?.role !== 'admin' && idRol !== 1) {
    return <Navigate to={idRol === 2 || idRol === "2" ? "/driver-home" : "/user-home"} />;
  }

  return children;
}
