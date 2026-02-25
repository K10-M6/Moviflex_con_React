import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Image, Badge } from "react-bootstrap";
import { FaUserCircle, FaBell } from "react-icons/fa";
import Logo from '../pages/Imagenes/TODO_MOVI.png';
import { useAuth } from '../pages/context/AuthContext';
import Notificaciones from '../components/Notificaciones';

export default function NavbarCustom() {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useEffect(() => {
    const cargarFotoPerfil = async () => {
      if (!usuario?.idUsuarios || !token) {
        return;
      }

      setCargandoFoto(true);
      try {
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/auth/${usuario.idUsuarios}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!respuesta.ok) {
          if (respuesta.status === 404) {
            console.log('Ruta sin usuarios no funciona, intentando con /api/usuarios...');
            const respuesta2 = await fetch(
              `https://backendmovi-production-c657.up.railway.app/api/usuarios/${usuario.idUsuarios}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (respuesta2.ok) {
              const data = await respuesta2.json();
              if (data.fotoPerfil) {
                setFotoPerfil(data.fotoPerfil);
              }
            }
          }
          return;
        }
        
        const data = await respuesta.json();

        if (data.fotoPerfil) {
          setFotoPerfil(data.fotoPerfil);
        } else if (data.foto) {
          setFotoPerfil(data.foto);
        }
        
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
    <Navbar variant="dark" expand="lg" className="shadow-sm sticky-top py-1" style={{ backgroundColor: '#f3f3f3', borderBottom: '3px solid #adadad' }}>
      <Container>
        <Navbar.Brand as={Link} to={token ? homePath : "/"}>
          <img src={Logo} height="40px" className="me-1" alt="Logo MoviFlexx" />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-basico" />
        
        <Navbar.Collapse id="navbar-basico">
          <Nav className="ms-auto align-items-center">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="fw-bold text-black py-0">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-black fw-bold py-0">
                  Registrarse
                </Nav.Link>
              </>
            ) : (
              <>
                <div className="me-3" >
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
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                      {cargandoFoto ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      ) : fotoAMostrar ? (
                        <Image 
                          src={fotoAMostrar} 
                          alt="Perfil" 
                          fluid 
                          roundedCircle 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="width:28px;height:28px;color:#adb5bd"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>';
                          }}
                        />
                      ) : (
                        <FaUserCircle size={28} color="#adb5bd" />
                      )}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow border-0 mt-1">
                    <div className="px-3 py-1 d-sm-none border-bottom">
                      <small className="text-muted">Conectado como:</small>
                      <p className="mb-0 fw-bold small">{usuario?.nombre}</p>
                    </div>
                    <Dropdown.Item as={Link} to={profilePath} className="py-1">
                      Editar Perfil
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile/stats" className="py-1">Estadísticas</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/" className="py-1">Mis Viajes</Dropdown.Item>
                    
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger py-1">
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