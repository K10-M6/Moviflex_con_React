import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import Logo from '../Imagenes/LOGO.jpeg';
import Alert from '../Imagenes/image.png';
import AdminIcon from '../Imagenes/image1.png';

function NavbarAdmin() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      console.log("Sesión cerrada");
      navigate("/");
    }
  };


  return (
    <Navbar bg="white" variant="light" expand="lg" className="border-bottom shadow-sm rounded">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard/home">
          <img src={Logo} height="40" className="me-2" /> 
          <span style={{
            background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block'
          }}>MoviFlexx</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-admin" />
        
        <Navbar.Collapse id="navbar-admin">
          <Nav className="ms-auto align-items-center">
            <Button 
              variant="link"
              className="p-0 me-3"
            >
              <img 
                src={Alert} 
                height="30" 
                alt="Alertas"
              />
            </Button>

            <Dropdown 
              show={showDropdown} 
              onToggle={(isOpen) => setShowDropdown(isOpen)}
              align="end"
            >
              <Dropdown.Toggle 
                as={Button}
                variant="link"
                className="d-flex align-items-center text-decoration-none p-0"
                id="admin-dropdown"
              >
                <img 
                  src={AdminIcon} 
                  height="30" 
                  className="me-2"
                  alt="Admin"
                />
                <span className="text-dark fw-medium">Admin</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow border-0 mt-2">
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleLogout}
                  className="d-flex align-items-center text-danger"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarAdmin;