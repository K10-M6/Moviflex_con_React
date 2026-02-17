import React from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Logo from "../pages/Imagenes/TODO_MOVI.png";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

function Header({ OpenSidebar }) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const getInitial = () => {
    if (!usuario?.nombre) return "A";
    return usuario.nombre.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (!usuario?.nombre) return "Administrador";
    return usuario.nombre;
  };

  const getUserEmail = () => {
    if (!usuario?.email) return "admin@moviflex.com";
    return usuario.email;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="py-3" style={{
      backgroundColor: '#124c83',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {OpenSidebar && (
              <button 
                onClick={OpenSidebar}
                className="btn text-white me-3"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ☰
              </button>
            )}
            
            <div className="text-center">
              <img 
                src={Logo} 
                alt="Logo Moviflexx"
                style={{
                  width: '150px',
                  height: 'auto'
                }}
              />
            </div>
          </div>

          <Dropdown align="end">
            <Dropdown.Toggle 
              as="div"
              className="d-flex align-items-center"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              id="dropdown-user"
            >
              <div className="text-end me-3 d-none d-md-block">
                <p className="mb-0 text-white fw-medium">{getFullName()}</p>
                <small className="text-white opacity-75">{getUserEmail()}</small>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-white"
                style={{
                  width: '45px',
                  height: '45px',
                  border: '2px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <span className="text-black fw-bold fs-5">{getInitial()}</span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="mt-2"
              style={{
                minWidth: '220px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 0'
              }}
            >
              <Dropdown.Header className="text-center border-bottom pb-3 pt-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-primary mx-auto mb-2"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#124c83 !important'
                  }}
                >
                  <span className="text-white fw-bold fs-4">{getInitial()}</span>
                </div>
                <strong className="d-block">{getFullName()}</strong>
                <small className="text-muted">{getUserEmail()}</small>
              </Dropdown.Header>

              <Dropdown.Item 
                onClick={handleLogout}
                className="py-2 text-danger d-flex align-items-center justify-content-center"
                style={{
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fff3f3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaSignOutAlt className="me-2" />
                Cerrar sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default Header;