import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeBase from "./pages/HomeBase";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Admin/Dashboard";
import AdminConductores from "./pages/Admin/AdminConductores";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";
import AdminVehiculos from "./pages/Admin/AdminVehiculos";
import Viajes from "./pages/Admin/ViajesAdmin";
import "./App.css";
import HomeCliente from "./pages/Usuarios/HomeCliente";
import RegisterDocumentacion from "./pages/Documents";
import AdminDocuments from "./pages/Admin/AdminDocuments";
import InternalChat from "./components/chat/InternalChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeCliente />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/conductores" element={<AdminConductores />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/vehiculos" element={<AdminVehiculos />} />
        <Route path="/admin/viajes" element={<Viajes />} />
        <Route path="/documentacion" element={<RegisterDocumentacion />} />
        <Route path="/admin/documentacion" element={<AdminDocuments />} />
        <Route path="/chat" element={<InternalChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;