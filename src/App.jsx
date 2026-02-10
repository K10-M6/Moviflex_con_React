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
import RegisterDocumentacion from "./pages/Documents";
import AdminDocuments from "./pages/Admin/AdminDocuments";
import Profile from "./pages/User/Profile";
import UserHome from "./pages/User/UserHome";
import DriverHome from "./pages/Driver/DriverHome";
import DriverProfile from "./pages/Driver/DriverProfile"


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<HomeBase />} />
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

  // 1. Redirección desde el Home base según el Rol al iniciar sesión
  if (location === "/") {
    if (usuario?.role === 'admin') return <Navigate to="/dashboard" />;
    if (usuario?.idRol === 2 || usuario?.idRol === "2") return <Navigate to="/driver-home" />;
    if (usuario?.idRol === 3 || usuario?.idRol === "3") return <Navigate to="/user-home" />;
  }

  // 2. Protección de rutas de Admin
  const isProtectedRoute = location.includes("admin") || location === "/dashboard";
  if (isProtectedRoute && usuario?.role !== 'admin') {
    // Si intenta entrar a admin y es conductor va a su home, si es pasajero al suyo
    return usuario?.idRol === 2 ? <Navigate to="/driver-home" /> : <Navigate to="/user-home" />;
  }

  return children;
}
