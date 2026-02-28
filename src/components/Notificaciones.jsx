import React, { useState, useEffect, useRef } from "react";
import { Badge, ListGroup, Button, Spinner, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  FaBell, 
  FaExclamationCircle, 
  FaCar, 
  FaMoneyBillWave, 
  FaEnvelope,
  FaTrash,
  FaCheckDouble,
  FaClock,
  FaBan
} from "react-icons/fa";
import { useAuth } from '../pages/context/AuthContext';
import toast from 'react-hot-toast';

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [notificacionAEliminar, setNotificacionAEliminar] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { token, usuario } = useAuth();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (usuario?.idUsuarios && token) {
      obtenerNotificaciones();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [usuario?.idUsuarios, token]);

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
        
        if (Array.isArray(notificacionesData)) {
          setNotificaciones(notificacionesData);
          const noLeidasCount = notificacionesData.filter(n => !n.leido).length;
          setNoLeidas(noLeidasCount);
        } else {
          setNotificaciones([]);
          setNoLeidas(0);
        }
      } else if (respuesta.status === 404) {
        setNotificaciones([]);
        setNoLeidas(0);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      toast.error("Error al cargar notificaciones");
    } finally {
      setCargando(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    try {
      const respuesta = await fetch(
        `https://backendmovi-production-c657.up.railway.app/api/notificaciones/${idNotificacion}/leer`, 
        {
          method: 'PATCH',
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
          duration: 2000,
          icon: '👁️'
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
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (respuesta.ok) {
        setNotificaciones(prev => prev.map(n => ({...n, leido: true})));
        setNoLeidas(0);
        toast.success('Todas las notificaciones marcadas como leídas', {
          icon: '✅'
        });
        setMostrarDropdown(false);
      }
    } catch (error) {
      console.error("Error al marcar todas:", error);
    }
  };

  const confirmarEliminacion = (idNotificacion, event) => {
    event.stopPropagation();
    setNotificacionAEliminar(idNotificacion);
    setShowDeleteModal(true);
  };

  const eliminarNotificacion = async () => {
    if (!notificacionAEliminar) return;

    try {
      const respuesta = await fetch(
        `https://backendmovi-production-c657.up.railway.app/api/notificaciones/${notificacionAEliminar}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (respuesta.ok) {
        setNotificaciones(prev => prev.filter(n => n.idNotificacion !== notificacionAEliminar));
        const notificacionEliminada = notificaciones.find(n => n.idNotificacion === notificacionAEliminar);
        if (notificacionEliminada && !notificacionEliminada.leido) {
          setNoLeidas(prev => Math.max(0, prev - 1));
        }
        toast.success('Notificación eliminada', {
          icon: '🗑️'
        });
        setShowDeleteModal(false);
        setNotificacionAEliminar(null);
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const getIcono = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'SISTEMA':
        return <FaExclamationCircle className="text-info" size={18} />;
      case 'VIAJE':
        return <FaCar className="text-success" size={18} />;
      case 'PAGO':
        return <FaMoneyBillWave className="text-warning" size={18} />;
      case 'MENSAJE':
        return <FaEnvelope className="text-primary" size={18} />;
      default:
        return <FaBell className="text-secondary" size={18} />;
    }
  };

  const getTimeAgo = (fecha) => {
    if (!fecha) return 'Recientemente';
    
    const ahora = new Date();
    const notifDate = new Date(fecha);
    const diffMin = Math.floor((ahora - notifDate) / 60000);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)} ${Math.floor(diffMin / 60) === 1 ? 'hora' : 'horas'}`;
    return formatDate(fecha);
  };

  const formatDate = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="position-relative">

      <button 
        ref={buttonRef}
        className="btn btn-link position-relative p-2 rounded-circle"
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        style={{ 
          color: '#54c7b8',
          backgroundColor: mostrarDropdown ? 'rgba(84, 199, 184, 0.1)' : 'transparent',
          width: '40px',
          height: '40px',
          transition: 'all 0.3s ease'
        }}
      >
        <FaBell size={20} />
        {noLeidas > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle rounded-pill"
            style={{ 
              fontSize: '0.65rem',
              padding: '0.25rem 0.45rem',
              minWidth: '20px',
              boxShadow: '0 2px 5px rgba(220, 53, 69, 0.3)'
            }}
          >
            {noLeidas > 9 ? '9+' : noLeidas}
          </Badge>
        )}
      </button>

      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-2">
              <FaExclamationCircle className="text-danger" size={24} />
            </div>
            <span>Confirmar eliminación</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <p className="mb-2">¿Estás seguro de que quieres eliminar esta notificación?</p>
          <p className="text-muted small mb-0">
            <FaBan className="me-1" size={12} />
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarNotificacion}>
            <FaTrash size={14} className="me-2" />
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {mostrarDropdown && (
        <div 
          ref={dropdownRef}
          className="position-absolute end-0 mt-2 bg-white shadow-lg border-0"
          style={{ 
            width: '380px',
            maxHeight: '480px',
            zIndex: 9999,
            borderRadius: '12px',
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease'
          }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <div>
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <FaBell className="text-primary" size={16} />
                Notificaciones
              </h6>
              <small className="text-muted">
                {noLeidas === 0 ? 'No hay nuevas' : `${noLeidas} no leídas`}
              </small>
            </div>
            {noLeidas > 0 && (
              <OverlayTrigger placement="bottom" overlay={<Tooltip>Marcar todas como leídas</Tooltip>}>
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={marcarTodasLeidas}
                  className="rounded-circle p-2"
                  style={{ width: '36px', height: '36px' }}
                >
                  <FaCheckDouble className="text-primary" size={16} />
                </Button>
              </OverlayTrigger>
            )}
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {cargando && notificaciones.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="sm" />
                <p className="text-muted small mt-3">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                  <FaBell size={30} className="text-muted opacity-50" />
                </div>
                <p className="text-muted small mb-1">No tienes notificaciones</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notificaciones.map((notif) => (
                  <ListGroup.Item 
                    key={notif.idNotificacion}
                    action
                    onClick={() => marcarComoLeida(notif.idNotificacion)}
                    className={`border-0 border-bottom py-3 px-3 position-relative ${
                      !notif.leido ? 'bg-light' : ''
                    }`}
                    style={{ 
                      borderLeft: !notif.leido ? '4px solid #0d6efd' : '4px solid transparent',
                      paddingRight: '45px'
                    }}
                  >
                    <div className="d-flex gap-3">
                      <div className={`rounded-circle p-2 ${
                        !notif.leido ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'
                      }`}>
                        {getIcono(notif.tipo)}
                      </div>
                       <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <strong className="small">{notif.titulo || 'Notificación'}</strong>
                          {!notif.leido && (
                            <Badge bg="primary" className="ms-2 rounded-pill" style={{ fontSize: '0.6rem' }}>
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        
                        <p className="small text-muted mb-2" style={{ 
                          fontSize: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {notif.mensaje || 'Sin mensaje'}
                        </p>

                        <div className="d-flex align-items-center text-muted">
                          <FaClock size={10} className="me-1" />
                          <small style={{ fontSize: '0.65rem' }}>
                            {getTimeAgo(notif.fechaCreacion)}
                          </small>
                        </div>
                      </div>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Eliminar</Tooltip>}>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={(e) => confirmarEliminacion(notif.idNotificacion, e)}
                          className="p-1 text-danger position-absolute"
                          style={{ top: '12px', right: '12px' }}
                        >
                          <FaTrash size={14} />
                        </Button>
                      </OverlayTrigger>
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