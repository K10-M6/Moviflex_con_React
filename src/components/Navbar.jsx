import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Image } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import Logo from '../pages/Imagenes/TODO_MOVI.png';
import { useAuth } from '../pages/context/AuthContext';

export default function NavbarCustom() {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();

  const getFirstName = () => usuario?.nombre?.split(' ')[0] || 'Usuario';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const idRol = usuario?.idRol || usuario?.rol?.id;
  const isDriver = idRol === 2 || idRol === "2";
  const homePath = isDriver ? "/driver-home" : "/user-home";
  const profilePath = isDriver ? "/driver-profile" : "/profile";

  return (
    <Navbar variant="dark" expand="lg" className="shadow-sm sticky-top" style={{ backgroundColor: '#124c83' }}>
      <Container>
        <Navbar.Brand as={Link} to={token ? homePath : "/"}>
          <img src={Logo} height="50px" className="me-1" alt="Logo MoviFlexx" />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-basico" />
        
        <Navbar.Collapse id="navbar-basico">
          <Nav className="ms-auto align-items-center">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="fw-bold text-white">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-white fw-bold">
                  Registrarse
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="link" 
                  id="dropdown-user"
                  className="d-flex align-items-center text-decoration-none p-0 border-0"
                  style={{ color: 'white' }}
                >
                  <span className="me-2 fw-bold d-none d-sm-inline">
                    Hola, {getFirstName()}
                  </span>
                  
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {usuario?.foto ? (
                      <Image 
                        src={usuario.foto} 
                        alt="Perfil" 
                        fluid 
                        roundedCircle 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FaUserCircle size={36} color="#adb5bd" />
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow border-0 mt-2">
                  <div className="px-3 py-2 d-sm-none border-bottom">
                    <small className="text-muted">Conectado como:</small>
                    <p className="mb-0 fw-bold">{usuario?.nombre}</p>
                  </div>
                  <Dropdown.Item as={Link} to={profilePath}>
                    Editar Perfil
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile/stats">Estadísticas</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/tus-viajes">Mis Viajes</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}