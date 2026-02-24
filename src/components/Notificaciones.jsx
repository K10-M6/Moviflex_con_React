import React, { useState, useEffect, useRef } from "react";
import { Badge, ListGroup, Button, Spinner } from "react-bootstrap";
import { FaBell, FaCheckCircle, FaExclamationCircle, FaClock, FaCar, FaMoneyBillWave, FaEnvelope, FaUser } from "react-icons/fa";
import { useAuth } from '../pages/context/AuthContext';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (usuario?.idUsuarios && token) {
      obtenerNotificaciones();

      const intervalo = setInterval(obtenerNotificaciones, 30000);
      return () => clearInterval(intervalo);
    }
  }, [usuario?.idUsuarios, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const obtenerNotificaciones = async () => {
    if (!token || !usuario?.idUsuarios) return;
    
    try {
      setCargando(true);
      const respuesta = await fetch(
        `https://backendmovi-production-c657.up.railway.app/api/notificaciones/usuario/${usuario.idUsuarios}?limit=5`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (respuesta.ok) {
        const data = await respuesta.json();
        const notificacionesData = data.notificaciones || data;
        setNotificaciones(Array.isArray(notificacionesData) ? notificacionesData : []);
        
        const noLeidasCount = (Array.isArray(notificacionesData) ? notificacionesData : [])
          .filter(n => !n.leido).length;
        setNoLeidas(noLeidasCount);
      } else if (respuesta.status === 404) {
        setNotificaciones([]);
        setNoLeidas(0);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    try {
      const respuesta = await fetch(
        `https://backendmovi-production-c657.up.railway.app/api/notificaciones/${idNotificacion}/leer`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (respuesta.ok) {
        setNotificaciones(prev => 
          prev.map(n => n.idNotificacion === idNotificacion ? {...n, leido: true} : n)
        );
        setNoLeidas(prev => Math.max(0, prev - 1));

        toast.success('Notificación marcada como leída', {
          icon: '✓',
          duration: 2000
        });
      }
    } catch (error) {
      console.error("Error al marcar notificación:", error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const respuesta = await fetch(
        `https://backendmovi-production-c657.up.railway.app/api/notificaciones/usuario/${usuario.idUsuarios}/leer-todas`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (respuesta.ok) {
        setNotificaciones(prev => prev.map(n => ({...n, leido: true})));
        setNoLeidas(0);
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      console.error("Error al marcar todas:", error);
    }
  };


  const getIcono = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'SISTEMA':
        return <FaExclamationCircle className="text-info" size={16} />;
      case 'VIAJE':
        return <FaCar className="text-success" size={16} />;
      case 'PAGO':
        return <FaMoneyBillWave className="text-warning" size={16} />;
      case 'MENSAJE':
        return <FaEnvelope className="text-primary" size={16} />;
      default:
        return <FaBell className="text-secondary" size={16} />;
    }
  };

  const getTimeAgo = (fecha) => {
    if (!fecha) return 'Recientemente';
    
    const ahora = new Date();
    const notifDate = new Date(fecha);
    const diffMs = ahora - notifDate;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    if (diffDias < 7) return `Hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
    return formatDate(fecha);
  };

  const formatDate = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button 
        className="btn btn-link position-relative p-2 text-white"
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        style={{ 
          textDecoration: 'none',
          transition: 'all 0.2s ease'
        }}
        aria-label="Notificaciones"
      >
        <FaBell size={20} />
        {noLeidas > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle rounded-pill"
            style={{ 
              fontSize: '0.6rem',
              padding: '0.25rem 0.4rem',
              minWidth: '18px'
            }}
          >
            {noLeidas > 9 ? '9+' : noLeidas}
          </Badge>
        )}
      </button>

      {mostrarDropdown && (
        <div 
          className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3"
          style={{ 
            width: '350px', 
            maxHeight: '450px', 
            overflow: 'hidden',
            zIndex: 9999,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
            <div>
              <h6 className="mb-0 fw-bold">Notificaciones</h6>
              <small className="text-muted">
                {noLeidas === 0 ? 'No hay nuevas' : `${noLeidas} no leídas`}
              </small>
            </div>
            {noLeidas > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={marcarTodasLeidas}
                className="text-decoration-none p-0"
                style={{ fontSize: '0.8rem' }}
              >
                <FaCheckCircle className="me-1" />
                Marcar todas
              </Button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {cargando && notificaciones.length === 0 ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" variant="primary" />
                <p className="text-muted small mt-2">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="text-center py-4">
                <FaBell size={30} className="text-muted mb-2 opacity-50" />
                <p className="text-muted small mb-0">No tienes notificaciones</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notificaciones.map((notif) => (
                  <ListGroup.Item 
                    key={notif.idNotificacion}
                    action
                    onClick={() => marcarComoLeida(notif.idNotificacion)}
                    className={`d-flex align-items-start gap-2 py-2 px-3 border-bottom ${
                      !notif.leido ? 'bg-light' : ''
                    }`}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderLeft: !notif.leido ? '3px solid #124c83' : 'none'
                    }}
                  >
                    <div className="mt-1" style={{ minWidth: '20px' }}>
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <strong className="small" style={{ fontSize: '0.85rem' }}>
                          {notif.titulo || 'Notificación'}
                        </strong>
                        {!notif.leido && (
                          <Badge 
                            bg="primary" 
                            className="ms-2 rounded-pill"
                            style={{ fontSize: '0.5rem', padding: '0.2rem 0.4rem' }}
                          >
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <p className="small text-muted mb-1" style={{ 
                        fontSize: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {notif.mensaje || 'Sin mensaje'}
                      </p>
                      <div className="d-flex align-items-center">
                        <FaClock className="text-muted me-1" size={8} />
                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                          {getTimeAgo(notif.fechaCreacion)}
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notificaciones;