import React, { useState } from "react";
import { BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill, BsListCheck, BsMenuButtonWideFill, BsChevronRight,
  BsChevronLeft, BsQrCode, BsFileEarmarkTextFill
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/context/AuthContext";
import Logo from "../pages/Imagenes/TODO_MOVI.png";
import QRModal from "../components/QRModal";
// IMPORTACIÓN DEL FONDO (Para coherencia visual si fuera necesario)
import fondo from "../pages/Imagenes/AutoresContacto.png";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, token, logout } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      OpenSidebar();
    }
  };
  
  const generarQr = () => {
    if (!token) {
        alert("No hay Token disponible. Inicia sesión nuevamente.");
        return;
    }
    const qrData = `${token}|${usuario?.nombre || ''}`;
    setQrValue(qrData);
    setShowQRModal(true);
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
      {/* Botón flotante para abrir Sidebar en móvil */}
      {!openSidebarToggle && (
        <button 
          className="btn position-fixed start-0 rounded-circle shadow-sm"
          onClick={OpenSidebar}
          style={{ 
            zIndex: 999, width: '45px', height: '45px', top: '20px', left: '20px',
            backgroundColor: '#54c7b8', border: 'none', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <BsChevronRight className="text-white" />
        </button>
      )}

      {openSidebarToggle && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          onClick={OpenSidebar}
          style={{ zIndex: 999, backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside 
        className={`position-fixed top-0 start-0 vh-100 overflow-y-auto shadow-sm
          ${openSidebarToggle ? 'd-block' : ''} col-md-3 col-lg-2 p-0`}
        style={{ 
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Fondo blanco minimalista
          width: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: openSidebarToggle ? 'translateX(0)' : 'translateX(-100%)',
          borderRight: '1px solid #eee'
        }}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center p-4 border-bottom">
          <img src={Logo} alt="Logo Moviflex" style={{ width: '140px', height: 'auto' }} />
          <button className="btn btn-link text-muted p-0" onClick={OpenSidebar}>
            <BsChevronLeft size={20} />
          </button>
        </div>
        
        {/* BOTÓN REDONDO (PILL) - REGLA: Color sólido #54c7b8 */}
        <div className="px-3 mt-4">
          <button
            onClick={generarQr}
            className="btn w-100 d-flex align-items-center justify-content-start p-3 rounded-pill border-0 shadow-sm"
            style={{ backgroundColor: '#54c7b8', color: 'white' }}
          >
            <span className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25" style={{ width: '32px', height: '32px' }}>
              <BsQrCode size={18} />
            </span>
            <span className="fw-bold small">GENERAR QR</span>
          </button>
        </div>

        <ul className="nav flex-column p-3 mt-2">
          {menuItems.map((item, index) => (
            <li className="nav-item mb-1" key={index}>
              <button
                className="nav-link d-flex align-items-center p-3 rounded-3 border-0 w-100 text-start"
                onClick={() => handleNavigation(item.path)}
                style={{
                  background: isActive(item.path) ? 'rgba(84, 199, 184, 0.1)' : 'transparent',
                  color: isActive(item.path) ? '#54c7b8' : '#666',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive(item.path) ? '4px solid #54c7b8' : '4px solid transparent'
                }}
              >
                <span className="me-3" style={{ fontSize: '1.2rem' }}>
                  {item.icon}
                </span>
                <span className={`fw-medium ${isActive(item.path) ? 'fw-bold' : ''}`}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* BOTÓN CUADRADO (RECTANGULAR) - REGLA: Blanco con borde de color */}
        <div className="p-3 mt-auto border-top">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn w-100 d-flex align-items-center justify-content-center p-3 fw-bold"
            style={{
              backgroundColor: 'white',
              color: '#dc3545',
              border: '2px solid #dc3545', // Estilo outline minimalista
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <QRModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        qrValue={qrValue}
        usuario={usuario}
        titulo="Tu QR de Acceso"
        mensajeExpiracion="Válido por 3 horas"
      />
    </>
  );
}

export default Sidebar;