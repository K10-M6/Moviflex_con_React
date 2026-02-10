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
import RegisterDocumentacion from "./pages/Documents";
import AdminDocuments from "./pages/Admin/AdminDocuments";
import Header from "./Dashboard/Header";
import Sidebar from "./Dashboard/Sidebar";
import Home from "./Dashboard/Home";


function App() {

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const OpenSidebar =() => {
    setOpenSidebarToggle(!openSidebarToggle);
  }
  return (
    <div className="grid-container">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard/home" element={
              <RequiredAuth>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <Home/>
              </RequiredAuth>
            } />
            <Route path="/" element={<HomeBase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/conductores" element={ <AdminConductores />} />
            <Route path="/admin/usuarios" element={<RequiredAuth> <AdminUsuarios /></RequiredAuth>} />
            <Route path="/admin/vehiculos" element={<RequiredAuth> <AdminVehiculos /></RequiredAuth>} />
            <Route path="/admin/viajes" element={<RequiredAuth> <Viajes/></RequiredAuth>} />
            <Route path="/documentacion" element={ <RegisterDocumentacion />}/>
            <Route path="/admin/documentacion" element={<RequiredAuth> <AdminDocuments/></RequiredAuth>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;

function RequiredAuth({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}