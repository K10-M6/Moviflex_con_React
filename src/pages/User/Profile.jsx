import React, { useState, useEffect } from "react";
// Eliminamos las importaciones de imágenes de fondo previas
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaUser, FaStar, FaQrcode, FaUserCircle, FaCalendarAlt, FaRoute, FaWallet } from "react-icons/fa";
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

function Profile() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  
  // Color solicitado
  const brandColor = "#56bca7";

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

  // Efectos de carga de datos (Se mantienen igual para no romper la lógica)
  useEffect(() => {
    const obtenerViajes = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargando(prev => ({ ...prev, viajes: true }));
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/usuario-viajes/mis-viajes`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (respuesta.ok) {
          const data = await respuesta.json();
          const viajesData = Array.isArray(data) ? data : [];
          const completados = viajesData.filter(v => v.estado === 'COMPLETADO').length;
          const totalGastado = viajesData.reduce((sum, v) => sum + (v.precioFinal || 0), 0);
          setEstadisticas(prev => ({ ...prev, totalViajes: viajesData.length, viajesCompletados: completados, totalGastado }));
        }
      } catch (error) { toast.error("Error al cargar viajes"); }
      finally { setCargando(prev => ({ ...prev, viajes: false })); }
    };
    obtenerViajes();
  }, [token, usuario?.idUsuarios]);

  useEffect(() => {
    const obtenerCalificaciones = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargando(prev => ({ ...prev, calificaciones: true }));
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/calificaciones/${usuario.idUsuarios}/promedio`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (respuesta.ok) {
          const data = await respuesta.json();
          setEstadisticas(prev => ({ ...prev, promedioCalificacion: data.promedio || 0, totalCalificaciones: data.totalCalificaciones || 0 }));
        }
      } catch (error) { console.error(error); }
      finally { setCargando(prev => ({ ...prev, calificaciones: false })); }
    };
    obtenerCalificaciones();
  }, [token, usuario?.idUsuarios]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '---';
    return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatearMoneda = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0);

  const generarQr = () => {
    if (!token) return toast.error("No hay Token disponible.");
    setQrValue(`${token}|${usuario?.nombre || ''}`);
    setShowQRModal(true);
  };

  const estaCargando = cargando.viajes || cargando.calificaciones;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}> {/* Fondo neutro sin imágenes */}
      <Toaster position="top-right" />
      
      {/* Navbar con el nuevo color verde */}
      <div style={{ background: brandColor, width: '100%', position: 'relative', zIndex: 10 }}>
        <Navbar />
      </div>
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
              <Card.Header className="bg-white border-0 p-4">
                <h2 className="fw-bold mb-0" style={{ color: '#333' }}>Mi Perfil</h2>
              </Card.Header>
              
              <Row className="g-0">
                <Col md={4} className="bg-light text-center p-4 border-end">
                  <div className="mb-3">
                    {usuario?.fotoPerfil ? (
                      <img 
                        src={usuario.fotoPerfil} 
                        alt="Perfil" 
                        className="rounded-circle shadow-sm"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: `3px solid ${brandColor}` }}
                      />
                    ) : (
                      <FaUserCircle size={150} color={brandColor} className="shadow-sm rounded-circle bg-white p-2" />
                    )}
                  </div>
                  
                  <h3 className="fw-bold mb-1">{usuario?.nombre}</h3>
                  
                  {estaCargando ? (
                    <Badge bg="secondary" className="px-3 rounded-pill mb-3">Cargando...</Badge>
                  ) : (
                    <Badge style={{ backgroundColor: brandColor }} className="px-3 rounded-pill mb-3">
                      <FaStar className="me-1" /> 
                      {estadisticas.promedioCalificacion.toFixed(1)} 
                      ({estadisticas.totalCalificaciones})
                    </Badge>
                  )}
                  
                  <Button 
                    onClick={generarQr}
                    variant="outline-primary" 
                    className="w-100 mb-3 rounded-pill fw-bold"
                    style={{ borderColor: brandColor, color: brandColor, borderWeight: '2px' }}
                  >
                    <FaQrcode className="me-2" />
                    Generar QR de acceso
                  </Button>
                  
                  <hr />
                  <div className="text-start px-3">
                    <p className="small text-muted mb-1 uppercase fw-bold"> <FaCalendarAlt className="me-2" /> Miembro desde </p>
                    <p className="fw-bold">{formatearFecha(usuario?.creadoEn)}</p>
                    
                    <p className="small text-muted mb-1 mt-3 uppercase fw-bold"> <FaRoute className="me-2" /> Viajes realizados </p>
                    <p className="fw-bold">{estadisticas.totalViajes} viajes</p>
                    
                    <p className="small text-muted mb-1 mt-3 uppercase fw-bold"> <FaWallet className="me-2" /> Total Gastado </p>
                    <p className="fw-bold" style={{ color: brandColor }}>
                      {formatearMoneda(estadisticas.totalGastado)}
                    </p>
                  </div>
                </Col>

                <Col md={8} className="p-4 bg-white">
                  <h4 className="fw-bold mb-4">Información de Cuenta</h4>
                  
                  <Row className="mb-4">
                    <Col md={6} className="mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f0fdfa', borderLeft: `4px solid ${brandColor}` }}>
                        <label className="small text-muted text-uppercase mb-1">Nombre Completo</label>
                        <p className="fw-bold mb-0 fs-5">{usuario?.nombre}</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f0fdfa', borderLeft: `4px solid ${brandColor}` }}>
                        <label className="small text-muted text-uppercase mb-1">Teléfono</label>
                        <p className="fw-bold mb-0 fs-5">{usuario?.telefono || 'No registrado'}</p>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={12}>
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#f0fdfa', borderLeft: `4px solid ${brandColor}` }}>
                        <label className="small text-muted text-uppercase mb-1">Correo Electrónico</label>
                        <p className="fw-bold mb-0 fs-5">{usuario?.email}</p>
                      </div>
                    </Col>
                  </Row>

                  <h4 className="fw-bold mb-3 mt-4">Resumen de Estadísticas</h4>
                  <Row className="g-3 mb-4">
                    <Col sm={6}>
                      <Card className="p-3 border-0 rounded-3 h-100 text-center shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <h5 className="fw-bold mb-0" style={{ color: brandColor, fontSize: '2rem' }}>
                          {estadisticas.viajesCompletados}
                        </h5>
                        <small className="text-muted fw-bold">VIAJES COMPLETADOS</small>
                      </Card>
                    </Col>
                    <Col sm={6}>
                      <Card className="p-3 border-0 rounded-3 h-100 text-center shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <h5 className="fw-bold mb-0 d-flex align-items-center justify-content-center" style={{ color: brandColor, fontSize: '2rem' }}>
                          <FaStar className="me-2" size={24} />
                          {estadisticas.promedioCalificacion.toFixed(1)}
                        </h5>
                        <small className="text-muted fw-bold">CALIFICACIÓN PROMEDIO</small>
                      </Card>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-4">
                    <Button 
                      variant="dark"
                      className="flex-grow-1 py-2 fw-bold"
                      style={{ borderRadius: '10px' }}
                      onClick={() => navigate('/user-home')}
                    >
                      Volver al Inicio
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

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