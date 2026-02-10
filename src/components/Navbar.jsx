import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import Logo from '../pages/Imagenes/LOGO.jpeg';
import { useAuth } from '../pages/context/AuthContext';

export default function NavbarCustom() {
  const { token, usuario, logout } = useAuth();
  const getFirstName = () => usuario?.nombre?.split(' ')[0] || 'Perfil';

  // Lógica para determinar las rutas según el rol
  const idRol = usuario?.idRol || usuario?.rol?.id;
  const isDriver = idRol === 2 || idRol === "2";
  const homePath = isDriver ? "/driver-home" : "/user-home";
  const profilePath = isDriver ? "/driver-profile" : "/profile";

  return (
    <Navbar bg="white" variant="light" expand="lg" className="border-bottom shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to={token ? homePath : "/"}>
          <img src={Logo} height="40" className="me-2" alt="Logo MoviFlexx" /> 
          <span style={{background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}>MoviFlexx</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-basico" />
        <Navbar.Collapse id="navbar-basico">
          
          <Nav className="mx-auto align-items-center">
              <Nav.Link as={Link} to="/conductor" className="fw-bold">Moviflex Conductor🚗 </Nav.Link>
              <Nav.Link as={Link} to="/pasajero" className="fw-bold">Moviflex Pasajero👥 </Nav.Link>
              <Nav.Link as={Link} to="/sobre-moviflex" className="fw-bold">Sobre Moviflex🌐</Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="fw-bold">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn text-white rounded-pill px-4" style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'}}> 
                  Registrarse
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end" className="me-2">
                <Dropdown.Toggle 
                  variant="custom" 
                  className="border-0 shadow-sm"
                  style={{ background: 'linear-gradient(20deg, #6f42c1, #00dfcc)', color: 'white', fontWeight: 'bold' }}>
                  {getFirstName()}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {/* Navegación dinámica según el Rol */}
                  <Dropdown.Item as={Link} to={profilePath}>
                    Editar Perfil
                  </Dropdown.Item>
                  
                  <Dropdown.Item as={Link} to="/profile/stats">Estadísticas</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/tus-viajes">Mis Viajes</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">Cerrar Sesión</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
