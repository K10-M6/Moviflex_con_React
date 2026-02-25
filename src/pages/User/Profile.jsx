import React, { useState, useEffect } from "react";
import img1 from "../Imagenes/DNNYPYGT65C3JHMUEEZKEUM7AY.jpg";
import img2 from "../Imagenes/salir-a-carretera-gonhergo.jpg";
import img3 from "../Imagenes/viaje-en-carro1.jpg";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaUser, FaStar, FaQrcode, FaUserCircle, FaCalendarAlt, FaRoute, FaWallet } from "react-icons/fa";
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const BackgroundSlider = ({ images = [], interval = 2500, overlayColor = 'rgba(163,133,255,0.35)' }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!images || images.length === 0) return;
    setFade(true);
    const timeout = setTimeout(() => setFade(false), interval - 1000);
    const t = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % images.length);
        setFade(false);
      }, 1000);
    }, interval);
    return () => {
      clearInterval(t);
      clearTimeout(timeout);
    };
  }, [images, interval]);

  return (
    <div aria-hidden="true">
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === index ? (fade ? 1 : 1) : 0,
              transition: 'opacity 1s cubic-bezier(.4,0,.2,1)',
              filter: 'grayscale(10%) contrast(95%) brightness(95%)',
              zIndex: i === index ? 1 : 0,
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: overlayColor, transition: 'background 300ms', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

function Profile() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  
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

  const backgroundImages = [img1, img2, img3];

  useEffect(() => {
    const obtenerViajes = async () => {
      if (!token || !usuario?.idUsuarios) return;
      
      try {
        setCargando(prev => ({ ...prev, viajes: true }));
        const respuesta = await fetch(
          `https://backendmovi-production-c657.up.railway.app/api/usuario-viajes/mis-viajes`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("📊 Viajes de usuario:", data);
          
          const viajesData = Array.isArray(data) ? data : [];
          
          const completados = viajesData.filter(v => v.estado === 'COMPLETADO').length;
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
        console.error("Error al obtener viajes:", error);
        toast.error("Error al cargar viajes");
      } finally {
        setCargando(prev => ({ ...prev, viajes: false }));
      }
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
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("⭐ Calificaciones recibidas:", data);        
          setEstadisticas(prev => ({
            ...prev,
            promedioCalificacion: data.promedio || 0,
            totalCalificaciones: data.totalCalificaciones || 0
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
    if (!fecha) return 'Fecha no disponible';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor || 0);
  };

  const generarQr = () => {
    if (!token) {
      toast.error("No hay Token disponible. Inicia sesión nuevamente.");
      return;
    }
    const qrData = `${token}|${usuario?.nombre || ''}`;
    setQrValue(qrData);
    setShowQRModal(true);
  };

  const fotoAMostrar = usuario?.fotoPerfil;

  const estaCargando = cargando.viajes || cargando.calificaciones;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4acfbd',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <BackgroundSlider images={backgroundImages} interval={2500} overlayColor={'rgba(163,133,255,0.35)'} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#124c83', width: '100%', position: 'relative', zIndex: 10 }}>
          <Navbar />
        </div>
        
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="shadow border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 p-4">
                  <h2 className="fw-bold mb-0" style={{ color: '#124c83' }}>Mi Perfil</h2>
                </Card.Header>
                
                <Row className="g-0">
                  <Col md={4} className="bg-light text-center p-4 border-end">
                    <div className="mb-3">
                      {fotoAMostrar ? (
                        <img 
                          src={fotoAMostrar} 
                          alt="Perfil" 
                          className="rounded-circle shadow"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUserCircle size={150} color="#124c83" className="shadow-sm rounded-circle bg-white p-2" />
                      )}
                    </div>
                    
                    <h3 className="fw-bold mb-1">{usuario?.nombre}</h3>
                    
                    {estaCargando ? (
                      <Badge bg="secondary" className="px-3 rounded-pill mb-3">
                        <div className="spinner-border spinner-border-sm me-2" />
                        Cargando...
                      </Badge>
                    ) : (
                      <Badge bg="warning" text="dark" className="px-3 rounded-pill mb-3">
                        <FaStar className="me-1" /> 
                        {estadisticas.promedioCalificacion.toFixed(1)} 
                        ({estadisticas.totalCalificaciones} {estadisticas.totalCalificaciones === 1 ? 'reseña' : 'reseñas'})
                      </Badge>
                    )}
                    
                    <Button 
                      onClick={generarQr}
                      variant="outline-primary" 
                      className="w-100 mb-3 rounded-pill"
                      style={{ borderColor: '#a385ff', color: '#a385ff' }}
                    >
                      <FaQrcode className="me-2" />
                      Generar QR de acceso
                    </Button>
                    
                    <hr />
                    <div className="text-start px-3">
                      <p className="small text-muted mb-1">
                        <FaCalendarAlt className="me-2" />
                        MIEMBRO DESDE
                      </p>
                      <p className="fw-bold">{formatearFecha(usuario?.creadoEn)}</p>
                      
                      <p className="small text-muted mb-1 mt-3">
                        <FaRoute className="me-2" />
                        VIAJES REALIZADOS
                      </p>
                      <p className="fw-bold">{estadisticas.totalViajes} viajes</p>
                      
                      <p className="small text-muted mb-1 mt-3">
                        <FaWallet className="me-2" />
                        TOTAL GASTADO
                      </p>
                      <p className="fw-bold" style={{ color: '#124c83' }}>
                        {formatearMoneda(estadisticas.totalGastado)}
                      </p>
                    </div>
                  </Col>

                  <Col md={8} className="p-4">
                    <h4 className="fw-bold mb-4">Información de Cuenta</h4>
                    
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="bg-light p-3 rounded-3">
                          <label className="small text-muted text-uppercase mb-1">Nombre Completo</label>
                          <p className="fw-bold mb-0 fs-5">{usuario?.nombre}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="bg-light p-3 rounded-3">
                          <label className="small text-muted text-uppercase mb-1">Teléfono</label>
                          <p className="fw-bold mb-0 fs-5">{usuario?.telefono || 'No registrado'}</p>
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={12}>
                        <div className="bg-light p-3 rounded-3">
                          <label className="small text-muted text-uppercase mb-1">Correo Electrónico</label>
                          <p className="fw-bold mb-0 fs-5">{usuario?.email}</p>
                        </div>
                      </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4">
                      <Button 
                        variant="outline-secondary"
                        className="flex-grow-1"
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
      </div>

      <QRModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        qrValue={qrValue}
        usuario={usuario}
        titulo="Tu QR de Acceso Rápido"
        mensajeExpiracion="Válido por 3 horas"
      />
    </div>
  );
}

export default Profile;