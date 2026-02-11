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
import AdminViajeros from "./pages/Admin/AdminViajeros";
import Profile from "./pages/User/Profile";
import UserHome from "./pages/User/UserHome";
import DriverHome from "./pages/Driver/DriverHome";
import DriverProfile from "./pages/Driver/DriverProfile";
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

            <Route path="/user-home" element={<RequiredAuth><UserHome /></RequiredAuth>} />
            <Route path="/profile" element={<RequiredAuth><Profile /></RequiredAuth>} />
            
            <Route path="/driver-home" element={ <RequiredAuth>
              
              <DriverHome />
              </RequiredAuth>} />
            <Route path="/driver-profile" element={<RequiredAuth><DriverProfile /></RequiredAuth>} />
            <Route path="/admin/conductores" element={ 
              <RequiredAuth>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <AdminConductores />
              </RequiredAuth>} />
            <Route path="/admin/usuarios" element={
              <RequiredAuth> 
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <AdminUsuarios />
              </RequiredAuth>} />
            <Route path="/admin/vehiculos" element={
              <RequiredAuth> 
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <AdminVehiculos />
              </RequiredAuth>} />
            <Route path="/admin/viajeros" element={
              <RequiredAuth>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/> 
                <AdminViajeros/>
              </RequiredAuth>} />
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