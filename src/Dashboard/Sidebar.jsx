import React, { useState } from "react";
import { BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill, BsListCheck, BsMenuButtonWideFill, BsChevronRight,
  BsChevronLeft, BsQrCode, BsFileEarmarkTextFill
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/context/AuthContext";
import Logo from "../pages/Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png";
import fondo from "../pages/Imagenes/AutoresContacto.png";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, token, logout } = useAuth();
  
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      OpenSidebar();
    }
  };

  
  const menuItems = [
    { icon: <BsGrid1X2Fill />, label: "Dashboard", path: "/dashboard/home" },
    { icon: <BsPeopleFill />, label: "Viajeros", path: "/admin/viajeros" },
    { icon: <BsFillGrid3X3GapFill />, label: "Conductores", path: "/admin/conductores" },
    { icon: <BsListCheck />, label: "Usuarios", path: "/admin/usuarios" },
    { icon: <BsMenuButtonWideFill />, label: "Vehículos", path: "/admin/vehiculos" },
    { icon: <BsFileEarmarkTextFill />, label: "Documentos", path: "/admin/documentos" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {!openSidebarToggle && (
        <button 
          className="btn position-fixed start-0"
          onClick={OpenSidebar}
          style={{ 
            zIndex: 999, width: '45px', height: '45px', top: '20px', left: '20px',
            backgroundColor: 'transparent', border: 'none', display: 'flex', 
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <BsChevronRight className="text-secondary" size={15} />
        </button>
      )}

      {openSidebarToggle && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          onClick={OpenSidebar}
          style={{ zIndex: 999 }}
        />
      )}

      <aside 
        className={`position-fixed top-0 start-0 vh-100 overflow-y-auto shadow-sm
          ${openSidebarToggle ? 'd-block' : ''} col-md-3 col-lg-2 p-0`}
        style={{ 
          zIndex: 1000,
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backgroundBlendMode: 'overlay',
          width: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: openSidebarToggle ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center container-fluid px-3" style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          minHeight: '91px'
        }}>
          <img src={Logo} alt="Logo Moviflex" style={{ width: '100px', height: 'auto' }} />
          <button className="btn btn-link text-muted p-0" onClick={OpenSidebar}>
            <BsChevronLeft size={15} />
          </button>
        </div>
      

        <ul className="nav flex-column p-3 mt-3">
          {menuItems.map((item, index) => (
            <li className="nav-item mb-2" key={index}>
              <button
                className="nav-link d-flex align-items-center p-2 rounded-3 border-0 w-100 text-start"
                onClick={() => handleNavigation(item.path)}
                style={{
                  background: isActive(item.path) ? 'rgba(84, 199, 184, 0.1)' : 'transparent',
                  color: isActive(item.path) ? '#54c7b8' : '#666',
                  fontSize: '0.9rem',
                  borderLeft: isActive(item.path) ? '4px solid #54c7b8' : '4px solid transparent'
                }}
              >
                <span className="me-3" style={{ fontSize: '1.2rem' }}>
                  {item.icon}
                </span>
                <span className={isActive(item.path) ? 'fw-bold' : ''}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="p-2 mt-auto border-top aling-items-center d-flex justify-content-center">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn w-100 d-flex align-items-center justify-content-center p-2"
            style={{
              backgroundColor: 'transparent',
              color: '#999',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            CERRAR SESIÓN
          </button>
        </div>
      </aside>


    </>
  );
}

export default Sidebar;