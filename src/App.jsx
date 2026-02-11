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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <Home/>
              </>
            } />
            {/*
            <Route path="/" element={<HomeBase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            
            <Route path="/user-home" element={<UserHome />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/driver-home" element={ 
              
              <DriverHome />
              } />
            <Route path="/driver-profile" element={<DriverProfile />} />
            <Route path="/admin/conductores" element={ 
              <>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <AdminConductores />
              </>
              } />
            <Route path="/admin/usuarios" element={
               <>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <AdminUsuarios />
                </>
              } />
            <Route path="/admin/vehiculos" element={
              <>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
                <AdminVehiculos />
              </>
              } />
            <Route path="/admin/viajeros" element={
              <>
                <Header OpenSidebar={OpenSidebar}/>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/> 
                <AdminViajeros/>
              </>
              } />
               */}
          </Routes>
          
        </BrowserRouter>
    </div>
  );
}

export default App;