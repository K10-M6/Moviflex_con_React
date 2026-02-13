import React from "react";
import { BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill,BsListCheck, BsMenuButtonWideFill, BsPersonCircle, BsChevronRight,
  BsChevronLeft 
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  
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
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(20deg, #4acfbd, #59c2ffff)'
              }}
            >
              <BsPersonCircle className="text-white fs-4" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">MOVIFLEX</h5>
              <small className="text-white text-opacity-75">Admin Panel</small>
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
        
        <ul className="nav flex-column p-3 mt-3">
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
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'white';
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
    </>
  );
}

export default Sidebar;