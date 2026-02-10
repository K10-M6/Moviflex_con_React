import React from "react";
import { 
  BsGrid1X2Fill, 
  BsFillGrid3X3GapFill, 
  BsPeopleFill,
  BsListCheck, 
  BsMenuButtonWideFill, 
  BsPersonCircle,
  BsX,
  BsJustify
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path) => {
    navigate(path);
    // Cerrar sidebar en dispositivos móviles después de la navegación
    if (window.innerWidth < 768) {
      OpenSidebar();
    }
  };
  
  const menuItems = [
    { icon: <BsGrid1X2Fill />, label: "Dashboard", path: "/dashboard/home" },
    { icon: <BsPeopleFill />, label: "Clientes", path: "/admin/usuarios" },
    { icon: <BsFillGrid3X3GapFill />, label: "Conductores", path: "/admin/conductores" },
    { icon: <BsListCheck />, label: "Usuarios", path: "/admin/usuarios" },
    { icon: <BsMenuButtonWideFill />, label: "Vehículos", path: "/admin/vehiculos" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Botón para abrir sidebar en móviles */}
      <button 
        className={`btn btn-link text-dark position-fixed top-0 start-0 m-3 d-md-none ${openSidebarToggle ? 'd-none' : 'd-block'}`}
        onClick={OpenSidebar}
        style={{ zIndex: 999 }}
      >
        <BsJustify className="fs-4" />
      </button>

      {/* Overlay para móviles */}
      {openSidebarToggle && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          onClick={OpenSidebar}
          style={{ zIndex: 999 }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`position-fixed top-0 start-0 vh-100 overflow-y-auto shadow-lg
          ${openSidebarToggle ? 'd-block' : 'd-none d-md-block'} 
          col-md-3 col-lg-2 p-0`}
        style={{ 
          zIndex: 1000,
          background: 'linear-gradient(180deg, #a385ff 0%, #EDE7FF 100%)',
          width: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: openSidebarToggle ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Header del Sidebar */}
        <div className="sidebar-header d-flex justify-content-between align-items-center p-4 border-bottom">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'
              }}
            >
              <BsPersonCircle className="text-white fs-4" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: '#6C3BFF' }}>MOVIFLEX</h5>
              <small className="text-muted">Admin Panel</small>
            </div>
          </div>
          <button 
            className="btn btn-link text-dark d-md-none"
            onClick={OpenSidebar}
          >
            <BsX className="fs-4" />
          </button>
        </div>
        
        {/* Menú de navegación */}
        <ul className="nav flex-column p-3 mt-3">
          {menuItems.map((item, index) => (
            <li className="nav-item mb-2" key={index}>
              <button
                className={`nav-link d-flex align-items-center p-3 rounded border-0 w-100 text-start
                  ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                style={{
                  background: isActive(item.path) 
                    ? 'linear-gradient(20deg, #6f42c1, #59c2ffff)' 
                    : 'transparent',
                  color: isActive(item.path) ? 'white' : '#333',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'rgba(108, 59, 255, 0.1)';
                    e.currentTarget.style.color = '#6C3BFF';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#333';
                  }
                }}
              >
                <span 
                  className="me-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: isActive(item.path) 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(108, 59, 255, 0.1)'
                  }}
                >
                  {React.cloneElement(item.icon, { 
                    className: isActive(item.path) ? 'text-white' : 'text-primary'
                  })}
                </span>
                <span className="fw-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Footer del Sidebar */}
        <div className="position-absolute bottom-0 start-0 w-100 p-4 border-top">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'
              }}
            >
              <span className="text-white fw-bold">A</span>
            </div>
            <div>
              <h6 className="mb-0" style={{ color: '#6C3BFF' }}>Administrador</h6>
              <small className="text-muted">admin@moviflex.com</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;