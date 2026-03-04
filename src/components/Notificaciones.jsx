import React, { useState, useEffect, useRef } from "react";
import { Badge, ListGroup, Button, Spinner, Modal } from "react-bootstrap";
import { 
  FaBell, 
  FaExclamationCircle, 
  FaCar, 
  FaMoneyBillWave, 
  FaEnvelope,
  FaCheckDouble,
  FaClock,
  FaEllipsisV
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
          setNoLeidas(notificacionesData.filter(n => !n.leido).length);
        } else {
          setNotificaciones([]);
          setNoLeidas(0);
        }
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
        setMostrarDropdown(false);
      }
    } catch (error) {
      console.error("Error al marcar todas:", error);
    }
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
        toast.success('Notificación eliminada');
        setShowDeleteModal(false);
        setNotificacionAEliminar(null);
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const getIcono = (tipo) => {
    const iconos = {
      SISTEMA: { icon: FaExclamationCircle, color: '#6366f1', bg: '#EEF2FF' },
      VIAJE: { icon: FaCar, color: '#10b981', bg: '#E7F7F0' },
      PAGO: { icon: FaMoneyBillWave, color: '#f59e0b', bg: '#FEF3C7' },
      MENSAJE: { icon: FaEnvelope, color: '#3b82f6', bg: '#E8F0FE' }
    };
    const config = iconos[tipo?.toUpperCase()] || { 
      icon: FaBell, 
      color: '#6b7280', 
      bg: '#F3F4F6' 
    };
    const IconComponent = config.icon;
    return { Icon: IconComponent, color: config.color, bg: config.bg };
  };

  const getTimeAgo = (fecha) => {
    if (!fecha) return 'Recientemente';
    
    const ahora = new Date();
    const notifDate = new Date(fecha);
    const diffMin = Math.floor((ahora - notifDate) / 60000);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin}m`;
    if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)}h`;
    if (diffMin < 2880) return 'Ayer';
    return notifDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="position-relative">
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .notification-badge {
            transition: all 0.3s ease;
          }
          .notification-item {
            transition: background-color 0.2s ease;
          }
          .notification-item:hover {
            background-color: #F9FAFB !important;
          }
          .notification-item.unread:hover {
            background-color: #F3F4F6 !important;
          }
        `}
      </style>

      <button 
        ref={buttonRef}
        className="btn btn-link position-relative p-2 rounded-circle notification-badge"
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        style={{ 
          color: '#4b5563',
          backgroundColor: mostrarDropdown ? '#F3F4F6' : 'transparent',
          width: '42px',
          height: '42px',
          transition: 'all 0.2s ease',
          border: 'none',
          outline: 'none'
        }}
      >
        <FaBell size={20} />
        {noLeidas > 0 && (
          <Badge 
            bg="" 
            className="position-absolute top-0 start-100 translate-middle rounded-pill"
            style={{ 
              fontSize: '0.7rem',
              padding: '0.25rem 0.45rem',
              minWidth: '20px',
              boxShadow: '0 2px 6px #11283e',
              backgroundColor: '#113d69'
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
        size="sm"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-6 fw-bold">Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-3">
          <p className="small text-muted mb-0">
            ¿Estás seguro de que quieres eliminar esta notificación?
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={eliminarNotificacion}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {mostrarDropdown && (
        <div 
          ref={dropdownRef}
          className="position-absolute end-0 mt-2 bg-white shadow-lg border"
          style={{ 
            width: '380px',
            maxHeight: '520px',
            zIndex: 9999,
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'slideIn 0.2s ease',
            border: '1px solid #E5E7EB',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02)'
          }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F9FAFB' }}>
            <div>
              <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2" style={{ color: '#111827', fontSize: '0.95rem' }}>
                <FaBell size={14} style={{ color: '#6b7280' }} />
                Notificaciones
              </h6>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                {noLeidas === 0 ? 'Todo al día' : `${noLeidas} sin leer`}
              </small>
            </div>
            {noLeidas > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={marcarTodasLeidas}
                className="text-decoration-none p-1"
                style={{ color: '#6b7280', fontSize: '0.75rem' }}
              >
                <FaCheckDouble size={12} className="me-1" />
                Leer todo
              </Button>
            )}
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {cargando && notificaciones.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" style={{ color: '#9ca3af' }} />
                <p className="text-muted small mt-2">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="text-center py-5">
                <div className="d-inline-flex p-3 mb-2 rounded-circle" style={{ backgroundColor: '#F3F4F6' }}>
                  <FaBell size={24} className="text-muted opacity-50" />
                </div>
                <p className="text-muted small mb-0">No tienes notificaciones</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notificaciones.map((notif) => {
                  const { Icon, color, bg } = getIcono(notif.tipo);
                  return (
                    <ListGroup.Item 
                      key={notif.idNotificacion}
                      className={`border-0 border-bottom px-3 py-3 notification-item ${
                        !notif.leido ? 'unread' : ''
                      }`}
                      style={{ 
                        backgroundColor: !notif.leido ? '#F9FAFB' : 'white',
                        cursor: 'pointer',
                        paddingRight: '48px',
                        position: 'relative'
                      }}
                    >
                      <div className="d-flex gap-3" onClick={() => marcarComoLeida(notif.idNotificacion)}>
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            backgroundColor: bg,
                            color: color
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <strong style={{ fontSize: '0.85rem', color: '#111827' }}>
                              {notif.titulo || 'Notificación'}
                            </strong>
                            {!notif.leido && (
                              <Badge 
                                bg="" 
                                className="rounded-pill"
                                style={{ 
                                  fontSize: '0.6rem',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  padding: '0.2rem 0.5rem'
                                }}
                              >
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          
                          <p className="small text-muted mb-2" style={{ 
                            fontSize: '0.8rem',
                            lineHeight: '1.4',
                            color: '#4b5563'
                          }}>
                            {notif.mensaje || 'Sin mensaje'}
                          </p>

                          <div className="d-flex align-items-center" style={{ color: '#9ca3af' }}>
                            <FaClock size={10} className="me-1" />
                            <small style={{ fontSize: '0.7rem' }}>
                              {getTimeAgo(notif.fechaCreacion)}
                            </small>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotificacionAEliminar(notif.idNotificacion);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 position-absolute text-muted"
                        style={{ 
                          top: '16px', 
                          right: '12px',
                          opacity: 0.5,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                      >
                        <FaEllipsisV size={14} />
                      </Button>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notificaciones;