import { useEffect, useState } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Logo from "../pages/Imagenes/TODO_MOVI.png";
import Notificaciones from "../components/Notificaciones";





function Header() {

  const navigate = useNavigate();
  const { usuario, logout, token } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [Noleidas, setNoleidas] = useState(0);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/notificaciones/usuario/${usuario.idUsuarios}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setNotificaciones(data);
        const noLeidas = data.filter(notif => !notif.leida).length;
        setNoleidas(noLeidas);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };

    if (usuario?.idUsuarios) {
      fetchNotificaciones();
    }
    const intervalId = setInterval(fetchNotificaciones, 30000); // Actualiza cada 30 segundos

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
  }, [usuario, token]);

  const getInitial = () => {
    if (!usuario?.nombre) return "A";
    return usuario.nombre.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (!usuario?.nombre) return "Administrador";
    return usuario.nombre;
  };

  const getUserEmail = () => {
    if (!usuario.email) return "admin@moviflex.com"
    return usuario.email;
  }

  const handleLogout = () => {
    logout();
  }

  return (
    <header className="py-3" style={{
      backgroundColor: '#124c83',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex 
          justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="text-center mb-4">
              <img src={Logo} alt="Logo Moviflexx"
                style={{
                  width: '150px',
                  height: 'auto',
                  marginLeft: '20px'
                }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Notificaciones/>

            <Dropdown align="end">
              <Dropdown.Toggle as="div"
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
                  className="rounded-circle 
                  d-flex align-items-center 
                  bg-white
                  justify-content-center"
                  style={{
                    width: '45px',
                    height: '45px',
                    border: '1px solid black',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                  <span className="text-black fw-bold">{getInitial()}</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="mt-2"
                style={{
                  minWidth: '200px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                  border: 'none',
                  borderRadius: '10px'
                }}>
                <Dropdown.Header className="text-center border-bottom pb-2">
                  <strong>{getFullName()}</strong><br />
                  <small className="text-muted">{getUserEmail()}</small>
                </Dropdown.Header>

                <Dropdown.Item onClick={handleLogout}
                  className="py-2 text-danger d-flex justify-content-center">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;