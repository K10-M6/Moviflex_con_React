import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Badge, ListGroup } from "react-bootstrap";
import { FaUser, FaStar, FaQrcode, FaUserCircle, FaCalendarAlt, FaRoute, FaWallet, FaIdCard, FaHistory } from "react-icons/fa";
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import fondo from "../Imagenes/AutoresContacto.png";

function Profile() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  
  // Colores exactos del DriverProfile
  const brandColor = "#124c83"; // Azul oscuro
  const accentColor = "#54c7b8"; // Verde turquesa

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  
  const [estadisticas, setEstadisticas] = useState({
    totalViajes: 0,
    viajesCompletados: 0,
    viajesCancelados: 0,
    totalGastado: 0,
    promedioCalificacion: 0,
    totalCalificaciones: 0
  });

  const [cargando, setCargando] = useState({
    viajes: true,
    calificaciones: true,
    pagos: true
  });

  // Obtener viajes
  useEffect(() => {
    const obtenerViajes = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargando(prev => ({ ...prev, viajes: true }));
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/viajes/mis-viajes`,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json' 
            } 
          }
        );
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          const viajesData = Array.isArray(data) ? data : [];
          const completados = viajesData.filter(v => v.estado === 'COMPLETADO' || v.estado === 'FINALIZADO').length;
          const cancelados = viajesData.filter(v => v.estado === 'CANCELADO').length;
          const totalGastado = viajesData.reduce((sum, v) => sum + (v.precioFinal || 0), 0);
          
          setEstadisticas(prev => ({ 
            ...prev, 
            totalViajes: viajesData.length, 
            viajesCompletados: completados,
            viajesCancelados: cancelados,
            totalGastado 
          }));
        }
      } catch (error) { 
        console.error("Error en obtenerViajes:", error);
      } finally { 
        setCargando(prev => ({ ...prev, viajes: false })); 
      }
    };
    obtenerViajes();
  }, [token, usuario?.idUsuarios]);

  // Obtener calificaciones
  useEffect(() => {
    const obtenerCalificaciones = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargando(prev => ({ ...prev, calificaciones: true }));
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/calificaciones/${usuario.idUsuarios}/promedio`,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json' 
            } 
          }
        );
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          setEstadisticas(prev => ({ 
            ...prev, 
            promedioCalificacion: Number(data.promedio) || 0, 
            totalCalificaciones: Number(data.totalCalificaciones) || 0 
          }));
        }
      } catch (error) { 
        console.error("Error al obtener calificaciones:", error);
      } finally { 
        setCargando(prev => ({ ...prev, calificaciones: false })); 
      }
    };
    obtenerCalificaciones();
  }, [token, usuario?.idUsuarios]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '---';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return '---';
    }
  };

  const formatearMoneda = (valor) => {
    try {
      return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        minimumFractionDigits: 0 
      }).format(valor || 0);
    } catch (error) {
      return '$0';
    }
  };

  const formatearCalificacion = (valor) => {
    if (valor === null || valor === undefined) return '0.0';
    const num = Number(valor);
    return isNaN(num) ? '0.0' : num.toFixed(1);
  };

  const generarQr = () => {
    if (!token) return toast.error("No hay Token disponible.");
    setQrValue(`${token}|${usuario?.nombre || ''}`);
    setShowQRModal(true);
  };

  const estaCargando = cargando.viajes || cargando.calificaciones;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `url(${fondo})`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative', 
      overflowX: 'hidden' 
    }}>
      {/* Overlay blanco semitransparente como en DriverProfile */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(255, 255, 255, 0.65)', 
        zIndex: 0 
      }} />

      <Toaster position="top-right" />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar transparent={true}/>
        
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="shadow border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 p-4">
                  <h2 className="fw-bold mb-0" style={{ color: brandColor }}>
                    Mi Perfil de Pasajero
                  </h2>
                </Card.Header>
                
                <Row className="g-0">
                  {/* Columna izquierda - Foto y resumen - IGUAL QUE DRIVERPROFILE */}
                  <Col md={4} className="bg-light text-center p-4 border-end">
                    <div className="mb-3">
                      {usuario?.fotoPerfil ? (
                        <img 
                          src={usuario.fotoPerfil} 
                          alt="Perfil" 
                          className="rounded-circle shadow-sm"
                          style={{ 
                            width: '150px', 
                            height: '150px', 
                            objectFit: 'cover', 
                            border: `3px solid ${brandColor}` 
                          }}
                        />
                      ) : (
                        <FaUserCircle size={150} color={brandColor} className="shadow-sm rounded-circle bg-white p-2" />
                      )}
                    </div>
                    
                    <h3 className="fw-bold mb-1" style={{ color: '#333' }}>
                      {usuario?.nombre}
                    </h3>
                    
                    {estaCargando ? (
                      <Badge bg="secondary" className="px-3 rounded-pill mb-3">Cargando...</Badge>
                    ) : (
                      <Badge style={{ backgroundColor: accentColor }} className="px-3 rounded-pill mb-3 text-white">
                        <FaStar className="me-1" /> 
                        {formatearCalificacion(estadisticas.promedioCalificacion)} 
                        ({estadisticas.totalCalificaciones || 0})
                      </Badge>
                    )}
                    
                    {/* Botón de QR - MISMO ESTILO que DriverProfile */}
                    <Button 
                      onClick={generarQr}
                      variant="outline-primary" 
                      className="w-100 mb-3 rounded-pill fw-bold"
                      style={{ 
                        borderColor: accentColor, 
                        color: accentColor,
                        borderWidth: '2px'
                      }}
                    >
                      <FaQrcode className="me-2" />
                      Generar QR de acceso
                    </Button>
                    
                    <hr />
                    
                    {/* Información de estadísticas - MISMO ESTILO que DriverProfile */}
                    <div className="text-start px-3">
                      <p className="small text-muted mb-1 text-uppercase fw-bold"> 
                        <FaCalendarAlt className="me-2" style={{ color: accentColor }} /> 
                        Miembro desde 
                      </p>
                      <p className="fw-bold mb-3">{formatearFecha(usuario?.creadoEn)}</p>
                      
                      <p className="small text-muted mb-1 text-uppercase fw-bold"> 
                        <FaRoute className="me-2" style={{ color: accentColor }} /> 
                        Viajes realizados 
                      </p>
                      <p className="fw-bold mb-3">{estadisticas.totalViajes} viajes</p>
                      
                      <p className="small text-muted mb-1 text-uppercase fw-bold"> 
                        <FaWallet className="me-2" style={{ color: accentColor }} /> 
                        Total Gastado 
                      </p>
                      <p className="fw-bold" style={{ color: accentColor, fontSize: '1.2rem' }}>
                        {formatearMoneda(estadisticas.totalGastado)}
                      </p>
                    </div>
                  </Col>

                  {/* Columna derecha - Información detallada - ESTILO DRIVERPROFILE */}
                  <Col md={8} className="p-4 bg-white">
                    <h4 className="fw-bold mb-4" style={{ color: brandColor }}>
                      Información de Cuenta
                    </h4>
                    
                    {/* Tarjetas de información - ESTILO DRIVERPROFILE */}
                    <Row className="mb-4">
                      <Col md={6} className="mb-3">
                        <Card className="border-0 rounded-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                          <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                              <FaUser size={16} style={{ color: accentColor }} className="me-2" />
                              <span className="fw-bold small text-uppercase" style={{ color: brandColor }}>
                                Nombre Completo
                              </span>
                            </div>
                            <p className="fw-bold mb-0 fs-5" style={{ color: '#333' }}>
                              {usuario?.nombre}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Card className="border-0 rounded-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                          <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                              <FaIdCard size={16} style={{ color: accentColor }} className="me-2" />
                              <span className="fw-bold small text-uppercase" style={{ color: brandColor }}>
                                Teléfono
                              </span>
                            </div>
                            <p className="fw-bold mb-0 fs-5" style={{ color: '#333' }}>
                              {usuario?.telefono || 'No registrado'}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={12}>
                        <Card className="border-0 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                          <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                              <FaWallet size={16} style={{ color: accentColor }} className="me-2" />
                              <span className="fw-bold small text-uppercase" style={{ color: brandColor }}>
                                Correo Electrónico
                              </span>
                            </div>
                            <p className="fw-bold mb-0 fs-5" style={{ color: '#333' }}>
                              {usuario?.email}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <h4 className="fw-bold mb-3 mt-4" style={{ color: brandColor }}>
                      Resumen de Actividad
                    </h4>
                    
                    {/* Tarjetas de estadísticas - MISMO ESTILO que DriverProfile */}
                    <Row className="g-3 mb-4">
                      <Col sm={4}>
                        <Card className="p-3 border-0 rounded-3 h-100 text-center shadow-sm" style={{ backgroundColor: '#fff' }}>
                          <h5 className="fw-bold mb-0" style={{ color: accentColor, fontSize: '2rem' }}>
                            {estadisticas.viajesCompletados}
                          </h5>
                          <small className="text-muted fw-bold text-uppercase">Completados</small>
                        </Card>
                      </Col>
                      <Col sm={4}>
                        <Card className="p-3 border-0 rounded-3 h-100 text-center shadow-sm" style={{ backgroundColor: '#fff' }}>
                          <h5 className="fw-bold mb-0" style={{ color: accentColor, fontSize: '2rem' }}>
                            {estadisticas.viajesCancelados}
                          </h5>
                          <small className="text-muted fw-bold text-uppercase">Cancelados</small>
                        </Card>
                      </Col>
                      <Col sm={4}>
                        <Card className="p-3 border-0 rounded-3 h-100 text-center shadow-sm" style={{ backgroundColor: '#fff' }}>
                          <h5 className="fw-bold mb-0 d-flex align-items-center justify-content-center" style={{ color: accentColor, fontSize: '2rem' }}>
                            <FaStar className="me-2" size={24} style={{ color: accentColor }} />
                            {formatearCalificacion(estadisticas.promedioCalificacion)}
                          </h5>
                          <small className="text-muted fw-bold text-uppercase">Calificación</small>
                        </Card>
                      </Col>
                    </Row>

                    {/* Botón de volver - MISMO ESTILO que DriverProfile */}
                    <div className="d-flex gap-2 mt-4">
                      <Button 
                        className="w-100 border-0 fw-bold py-2 rounded-pill"
                        style={{ backgroundColor: accentColor, color: 'white' }}
                        onClick={() => navigate('/user-home')}
                      >
                        <FaHistory className="me-2" />
                        Volver al Inicio
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <QRModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        qrValue={qrValue}
        usuario={usuario}
        titulo="Tu QR de Acceso"
        mensajeExpiracion="Válido para abordar"
      />
    </div>
  );
}

export default Profile;