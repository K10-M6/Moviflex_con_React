import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../pages/context/AuthContext";
import { Navigate } from "react-router-dom";

const DashboardLayout = ({ children, openSidebarToggle, OpenSidebar }) => {
    const { token } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Header />
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
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
