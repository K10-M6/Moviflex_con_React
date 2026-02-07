import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import Logo from '../pages/Imagenes/LOGO.jpeg';

export default function NavbarCustom() {
  return (
    <Navbar bg="white" variant="light" expand="lg" className="border-bottom shadow border-3 rounded"  
     style={{position: 'sticky', top: 0, zIndex: 1000, background: 'linear-gradient(300deg, #6C3BFF  5%, rgb(255, 255, 255))'}}>
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={Logo} height="40" className="me-2" /> 
          <span style={{background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}>MoviFlexx</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-basico" />
        <Navbar.Collapse id="navbar-basico">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/login" className="fw-bold"
            style={{color: '#ebebeb'}}>
              Iniciar Sesión
            </Nav.Link>
            <Nav.Link as={Link} to="/register" className="btn text-white rounded-pill px-4" style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'}}> Registrarse
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}