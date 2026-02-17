import React, { useState } from "react";
import { BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill, BsListCheck, BsMenuButtonWideFill, BsChevronRight,
  BsChevronLeft, BsQrCode
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/context/AuthContext";
import Logo from "../pages/Imagenes/TODO_MOVI.png";
import QRModal from "../components/QRModal";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, token } = useAuth();
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
    
    const qrValue = `${token}|${usuario?.nombre || ''}`;
    console.log("🔍 Generando QR con token de", token.length, "caracteres");
    setQrValue(token);
    setShowQRModal(true);
  };
  
  const menuItems = [
    { icon: <BsGrid1X2Fill />, label: "Dashboard", path: "/dashboard/home" },
    { icon: <BsPeopleFill />, label: "Viajeros", path: "/admin/viajeros" },
    { icon: <BsFillGrid3X3GapFill />, label: "Conductores", path: "/admin/conductores" },
    { icon: <BsListCheck />, label: "Usuarios", path: "/admin/usuarios" },
    { icon: <BsMenuButtonWideFill />, label: "Vehículos", path: "/admin/vehiculos" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {!openSidebarToggle && (
        <button 
          className="btn btn-primary position-fixed start-0 rounded-circle shadow-lg"
          onClick={OpenSidebar}
          style={{ 
            zIndex: 999,
            width: '40px',
            height: '40px',
            top: '60px',
            left: '20px',
            marginLeft: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(20deg, #4acfbd, #59c2ffff)',
            border: 'none'
          }}
        >
          <BsChevronRight className="text-white" />
        </button>
      )}
      {openSidebarToggle && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          onClick={OpenSidebar}
          style={{ zIndex: 999 }}
        />
      )}

      <aside 
        className={`position-fixed top-0 start-0 vh-100 overflow-y-auto shadow-lg
          ${openSidebarToggle ? 'd-block' : ''} 
          col-md-3 col-lg-2 p-0`}
        style={{ 
          zIndex: 1000,
          backgroundColor: '#124c83',
          width: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: openSidebarToggle ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center p-4 border-bottom border-white border-opacity-25">
          <div className="d-flex align-items-center">
            <div className="text-center">
              <img src={Logo} alt="Logo Moviflexx" 
                style={{
                  width: '160px',
                  height: 'auto'
                }}
              />
            </div>
          </div>
          <button 
            className="btn btn-link text-white"
            onClick={OpenSidebar}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsChevronLeft className="fs-4" />
          </button>
        </div>
        
        <div className="px-3 mt-3">
          <button
            onClick={generarQr}
            className="btn w-100 d-flex align-items-center justify-content-start p-3 rounded border-0"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span 
              className="me-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <BsQrCode className="text-white" size={20} />
            </span>
            <span className="fw-medium">Generar QR de acceso</span>
          </button>
        </div>

        <ul className="nav flex-column p-3">
          {menuItems.map((item, index) => (
            <li className="nav-item mb-2" key={index}>
              <button
                className={`nav-link d-flex align-items-center p-3 rounded border-0 w-100 text-start
                  ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                style={{
                  background: isActive(item.path) 
                    ? 'linear-gradient(20deg, #4acfbd, #59c2ffff)' 
                    : 'transparent',
                  color: isActive(item.path) ? 'white' : 'white', 
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span 
                  className="me-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: isActive(item.path) 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {React.cloneElement(item.icon, { 
                    className: isActive(item.path) ? 'text-white' : 'text-white'
                  })}
                </span>
                <span className="fw-medium text-white">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <QRModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        qrValue={qrValue}
        usuario={usuario}
        titulo="Tu QR de Acceso Rápido"
        mensajeExpiracion="Válido por 3 horas"
      />
    </>
  );
}

export default Sidebar;