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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomeBase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Ruta del perfil (accesible para todos los usuarios autenticados) */}
          <Route path="/profile" element={<RequiredAuth><Profile /></RequiredAuth>} />
          
          {/* Ruta de documentación (accesible para todos los usuarios autenticados) */}
          <Route path="/documentacion" element={<RequiredAuth><RegisterDocumentacion /></RequiredAuth>}/>
          
          {/* Rutas exclusivas para administradores */}
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
  
  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Verificar si es una ruta protegida (admin)
  const isProtectedRoute = window.location.pathname.includes("admin") || 
                           window.location.pathname === "/dashboard";
  
  // Si es ruta de admin y el usuario no es admin, redirigir al perfil
  if (isProtectedRoute && usuario?.role !== 'admin') {
    return <Navigate to="/profile" />;
  }

  return children;
}