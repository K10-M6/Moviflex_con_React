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
import Documentos from "./pages/Documents";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);
  
  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard/home" element={
            <RequiredAuth>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <Header/>
                <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                  <div style={{ 
                    flex: 1,
                    marginLeft: openSidebarToggle ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: '#f5f5f5', 
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    <Home />
                  </div>
                </div>
              </div>
            </RequiredAuth>
          } />
          <Route path="/" element={<HomeBase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* AQUI AGREGUE LA RUTA DE DOCUMENTOS */}
          <Route path="/documents" element={<RequiredAuth><Documentos /></RequiredAuth>} />

          <Route path="/user-home" element={<RequiredAuth><UserHome /></RequiredAuth>} />
          <Route path="/profile" element={<RequiredAuth><Profile /></RequiredAuth>} />
          
          <Route path="/driver-home" element={ 
            <RequiredAuth>
              <DriverHome />
            </RequiredAuth>
          } />
          <Route path="/driver-profile" element={<RequiredAuth><DriverProfile /></RequiredAuth>} />
          
          <Route path="/admin/conductores" element={ 
            <RequiredAuth>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <Header/>
                <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                  <div style={{ 
                    flex: 1,
                    marginLeft: openSidebarToggle ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: '#f5f5f5',
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    <AdminConductores />
                  </div>
                </div>
              </div>
            </RequiredAuth>
          } />
          <Route path="/admin/usuarios" element={
            <RequiredAuth> 
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <Header/>
                <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                  <div style={{ 
                    flex: 1,
                    marginLeft: openSidebarToggle ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: '#f5f5f5',
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    <AdminUsuarios />
                  </div>
                </div>
              </div>
            </RequiredAuth>
          } />
          <Route path="/admin/vehiculos" element={
            <RequiredAuth> 
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <Header/>
                <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                  <div style={{ 
                    flex: 1,
                    marginLeft: openSidebarToggle ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: '#f5f5f5',
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    <AdminVehiculos />
                  </div>
                </div>
              </div>
            </RequiredAuth>
          } />
          <Route path="/admin/viajeros" element={
            <RequiredAuth>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <Header/>
                <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                  <div style={{ 
                    flex: 1,
                    marginLeft: openSidebarToggle ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: '#f5f5f5',
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    <AdminViajeros />
                  </div>
                </div>
              </div>
            </RequiredAuth>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
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