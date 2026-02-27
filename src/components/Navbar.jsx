import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Image } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import Logo from '../pages/Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import { useAuth } from '../pages/context/AuthContext';
import Notificaciones from '../components/Notificaciones';

export default function NavbarCustom({ transparent }) {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useEffect(() => {
    const cargarFotoPerfil = async () => {
      if (!usuario?.idUsuarios || !token) return;
      setCargandoFoto(true);
      try {
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/auth/${usuario.idUsuarios}`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (!respuesta.ok) return;
        const data = await respuesta.json();
        if (data.fotoPerfil) setFotoPerfil(data.fotoPerfil);
        else if (data.foto) setFotoPerfil(data.foto);
      } catch (error) {
        console.error("Error al cargar foto de perfil:", error);
      } finally {
        setCargandoFoto(false);
      }
    };
    cargarFotoPerfil();
  }, [usuario, token]);

  const getFirstName = () => usuario?.nombre?.split(' ')[0] || 'Usuario';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const idRol = usuario?.idRol || usuario?.rol?.id;
  const isDriver = idRol === 2 || idRol === "2";
  const homePath = isDriver ? "/driver-home" : "/user-home";
  const profilePath = isDriver ? "/driver-profile" : "/profile";
  const fotoAMostrar = fotoPerfil || usuario?.fotoPerfil || usuario?.foto;

  return (
    <Navbar 
      variant={transparent ? "light" : "dark"} 
      expand="lg" 
      className="sticky-top py-2" 
      style={{ 
        backgroundColor: transparent ? 'transparent' : '#f3f3f3', 
        borderBottom: transparent ? 'none' : '0px solid #adadad',
        transition: 'all 0.3s ease-in-out',
        boxShadow: transparent ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to={token ? homePath : "/"}>
          <img src={Logo} height="40px" className="me-1" alt="Logo MoviFlexx" />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-basico" />
        
        <Navbar.Collapse id="navbar-basico">
          <Nav className="ms-auto align-items-center">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="fw-bold text-black px-3">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-black fw-bold px-3">
                  Registrarse
                </Nav.Link>
              </>
            ) : (
              <>
                <div className="me-3">
                  <Notificaciones/>
                </div>

                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="link" 
                    id="dropdown-user"
                    className="d-flex align-items-center text-decoration-none p-0 border-0"
                    style={{ color: 'black' }}
                  >
                    <span className="me-2 fw-bold d-none d-sm-inline text-dark">
                      Hola, {getFirstName()}
                    </span>
                    
                    <div style={{ 
                      width: '35px', height: '35px', borderRadius: '50%', 
                      overflow: 'hidden', backgroundColor: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #000'
                    }}>
                      {cargandoFoto ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      ) : fotoAMostrar ? (
                        <Image 
                          src={fotoAMostrar} 
                          alt="Perfil" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUserCircle size={30} color="#adb5bd" />
                      )}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow border-0 mt-2">
                    <Dropdown.Item as={Link} to={profilePath}>Editar Perfil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      Cerrar Sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}