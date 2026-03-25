import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../pages/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import imagencontacto from "../pages/Imagenes/AutoresContacto.png";

const DashboardLayout = ({ children, openSidebarToggle, OpenSidebar }) => {
    const { token } = useAuth();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            width: '100vw', 
            overflow: 'hidden',
            backgroundImage: `url(${imagencontacto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative'
        }}>
            <style>
                {`
                @keyframes floatBubble {
                    0% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-30px) translateX(15px); }
                    100% { transform: translateY(0) translateX(0); }
                }
                `}
            </style>

            {/* Mouse Glow (Subtle) */}
            <div style={{
                position: 'fixed',
                top: mousePos.y - 150,
                left: mousePos.x - 150,
                width: '300px',
                height: '300px',
                background: 'rgba(86, 188, 167, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'top 0.1s ease, left 0.1s ease'
            }}></div>

            {/* Floating Bubbles */}
            <div style={{ position: 'fixed', top: '15%', left: '10%', width: '120px', height: '120px', background: 'rgba(86, 188, 167, 0.08)', borderRadius: '50%', filter: 'blur(40px)', animation: 'floatBubble 10s infinite ease-in-out', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '20%', right: '12%', width: '180px', height: '180px', background: 'rgba(17, 61, 105, 0.05)', borderRadius: '50%', filter: 'blur(60px)', animation: 'floatBubble 14s infinite ease-in-out reverse', zIndex: 0 }}></div>

            <Header />
            <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden', zIndex: 2 }}>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <div style={{
                    flex: 1,
                    marginLeft: openSidebarToggle ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: 'transparent',
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
