import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeBase from "./pages/HomeBase";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Admin/Dashboard";
import AdminConductores from "./pages/Admin/AdminConductores";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";
import AdminVehiculos from "./pages/Admin/AdminVehiculos";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import Viajes from "./pages/Admin/ViajesAdmin";
import "./App.css";
import RegisterDocumentacion from "./pages/Documents";
import AdminDocuments from "./pages/Admin/AdminDocuments";
import Profile from "./pages/User/Profile";
import UserHome from "./pages/User/UserHome";
import DriverHome from "./pages/Driver/DriverHome";
import DriverProfile from "./pages/Driver/DriverProfile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RequiredAuth><HomeBase /></RequiredAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/user-home" element={<RequiredAuth><UserHome /></RequiredAuth>} />
          <Route path="/profile" element={<RequiredAuth><Profile /></RequiredAuth>} />
          
          <Route path="/driver-home" element={<RequiredAuth><DriverHome /></RequiredAuth>} />
          <Route path="/driver-profile" element={<RequiredAuth><DriverProfile /></RequiredAuth>} />
          
          <Route path="/documentacion" element={<RequiredAuth><RegisterDocumentacion /></RequiredAuth>}/>
          
          <Route path="/dashboard" element={<RequiredAuth><Dashboard /></RequiredAuth>} />
          <Route path="/admin/conductores" element={<RequiredAuth><AdminConductores /></RequiredAuth>} />
          <Route path="/admin/usuarios" element={<RequiredAuth><AdminUsuarios /></RequiredAuth>} />
          <Route path="/admin/vehiculos" element={<RequiredAuth><AdminVehiculos /></RequiredAuth>} />
          <Route path="/admin/viajes" element={<RequiredAuth><Viajes/></RequiredAuth>} />
          <Route path="/admin/documentacion" element={<RequiredAuth><AdminDocuments/></RequiredAuth>} />
          
          <Route path="*" element={<Navigate to="/" />} />
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
