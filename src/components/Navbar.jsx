import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import Logo from '../pages/Imagenes/TODO_MOVI.png';
import { useAuth } from '../pages/context/AuthContext';

export default function NavbarCustom() {
  const { token, usuario, logout } = useAuth();
  const getFirstName = () => usuario?.nombre?.split(' ')[0] || 'Perfil';

  const idRol = usuario?.idRol || usuario?.rol?.id;
  const isDriver = idRol === 2 || idRol === "2";
  const homePath = isDriver ? "/driver-home" : "/user-home";
  const profilePath = isDriver ? "/driver-profile" : "/profile";

  return (
    <Navbar variant="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to={token ? homePath : "/"}>
          <img src={Logo} height="50px" className="me-1" alt="Logo MoviFlexx" /> 
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-basico" />
        <Navbar.Collapse id="navbar-basico">

          <Nav className="ms-auto align-items-center">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="fw-bold">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn text-white rounded-pill px-4" style={{background: 'linear-gradient(20deg, #4acfbd, rgba(89, 194, 255, 0.66))'}}> 
                  Registrarse
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end" className="me-2">
                <Dropdown.Toggle 
                  variant="custom" 
                  className="border-0 shadow-sm"
                  style={{ background: 'linear-gradient(20deg, #4acfbd, rgba(89, 194, 255, 0.66))', color: 'white', fontWeight: 'bold' }}>
                  {getFirstName()}
                </Dropdown.Toggle>

                <Dropdown.Menu>
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
