import React, { useState, useEffect } from "react";
import img1 from "../Imagenes/DNNYPYGT65C3JHMUEEZKEUM7AY.jpg";
import img2 from "../Imagenes/salir-a-carretera-gonhergo.jpg";
import img3 from "../Imagenes/viaje-en-carro1.jpg";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import { FaCar, FaIdCard, FaStar, FaSave, FaQrcode, FaUserCircle, FaFileAlt } from "react-icons/fa";
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

function DriverProfile() {
  const { usuario, token, logout, setUsuario } = useAuth();
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehiculo, setVehiculo] = useState(null);
  const [cargandoVehiculo, setCargandoVehiculo] = useState(true);
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);
  const [totalCalificaciones, setTotalCalificaciones] = useState(0);
  const [totalViajes, setTotalViajes] = useState(0);
  const [documentacion, setDocumentacion] = useState({
    licencia: { estado: 'PENDIENTE' },
    soat: { estado: 'PENDIENTE' }
  });
  
  const backgroundImages = [img1, img2, img3];

  useEffect(() => {
    const obtenerVehiculo = async () => {
      if (!token) return;
      
      try {
        const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/vehiculos/mis-vehiculos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          if (Array.isArray(data) && data.length > 0) {
            setVehiculo(data[0]);
          } else if (data && typeof data === 'object') {
            setVehiculo(data);
          }
        }
      } catch (error) {
        console.error("Error al obtener vehículo:", error);
      } finally {
        setCargandoVehiculo(false);
      }
    };

    obtenerVehiculo();
  }, [token]);

  useEffect(() => {
    const obtenerCalificaciones = async () => {
      if (!token || !usuario?.idUsuarios) return;
      
      try {
        const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/calificaciones/${usuario.idUsuarios}/PROMEDIO`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          setCalificaciones(data);
          
          if (Array.isArray(data) && data.length > 0) {
            const suma = data.reduce((acc, cal) => acc + cal.puntuacion, 0);
            setPromedioCalificacion(suma / data.length);
            setTotalCalificaciones(data.length);
          }
        }
      } catch (error) {
        console.error("Error al obtener calificaciones:", error);
      }
    };

    const obtenerEstadisticasViajes = async () => {
      if (!token || !usuario?.idUsuarios) return;
      
      try {
        const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/viajes/mis-viajes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          setTotalViajes(data.totalViajes || 0);
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };

    const obtenerDocumentacion = async () => {
      if (!token || !usuario?.idUsuarios) return;
      
      try {
        const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/documentacion/usuario/${usuario.idUsuarios}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          setDocumentacion({
            licencia: { estado: data.licencia?.estado || 'PENDIENTE' },
            soat: { estado: data.soat?.estado || 'PENDIENTE' }
          });
        }
      } catch (error) {
        console.error("Error al obtener documentación:", error);
      }
    };

    obtenerCalificaciones();
    obtenerEstadisticasViajes();
    obtenerDocumentacion();
  }, [token, usuario?.idUsuarios]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
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

  const irADocumentacion = () => {
    navigate("/documentacion");
  };

  const guardarCambios = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/${usuario.idUsuarios}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombre,
          telefono: telefono
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUsuario({
          ...usuario,
          nombre: nombre,
          telefono: telefono
        });
        toast.success('Datos actualizados correctamente');
      } else {
        toast.error(data.error || 'Error al actualizar los datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const fotoAMostrar = usuario?.fotoPerfil;

  const getBadgeColor = (estado) => {
    return estado === 'APROBADO' || estado === 'VIGENTE' ? 'success' : 
           estado === 'PENDIENTE' ? 'warning' : 'danger';
  };

  const getEstadoTexto = (estado) => {
    return estado === 'APROBADO' ? 'VIGENTE' : 
           estado === 'PENDIENTE' ? 'PENDIENTE' : 'VENCIDO';
  };

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
                  <h2 className="fw-bold mb-0" style={{ color: '#124c83' }}>Mi Perfil de Conductor</h2>
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
                    
                    <h3 className="fw-bold mb-1">{nombre || usuario?.nombre}</h3>
                    <Badge bg="warning" text="dark" className="px-3 rounded-pill mb-3">
                      <FaStar className="me-1" /> {promedioCalificacion.toFixed(1)} ({totalCalificaciones} {totalCalificaciones === 1 ? 'reseña' : 'reseñas'})
                    </Badge>
                    
                    <Button 
                      onClick={irADocumentacion}
                      variant="outline-success" 
                      className="w-100 mb-3 rounded-pill"
                      style={{ borderColor: '#28a745', color: '#28a745' }}
                      disabled={loading}
                    >
                      <FaFileAlt className="me-2" />
                      Subir Documentación
                    </Button>
                    
                    <Button 
                      onClick={generarQr}
                      variant="outline-primary" 
                      className="w-100 mb-3 rounded-pill"
                      style={{ borderColor: '#a385ff', color: '#a385ff' }}
                      disabled={loading}
                    >
                      <FaQrcode className="me-2" />
                      Generar QR de acceso
                    </Button>
                    
                    <hr />
                    <div className="text-start px-3">
                      <p className="small text-muted mb-1">MIEMBRO DESDE</p>
                      <p className="fw-bold">{formatearFecha(usuario?.creadoEn)}</p>
                      <p className="small text-muted mb-1">VIAJES COMPLETADOS</p>
                      <p className="fw-bold">{totalViajes} servicios</p>
                    </div>
                  </Col>

                  <Col md={8} className="p-4">
                    <h4 className="fw-bold mb-4">Información de Cuenta</h4>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">NOMBRE COMPLETO</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={nombre} 
                              onChange={(e) => setNombre(e.target.value)} 
                              placeholder="Ingresa tu nombre"
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">TELÉFONO</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={telefono} 
                              onChange={(e) => setTelefono(e.target.value)} 
                              placeholder="Ingresa tu teléfono"
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">CORREO ELECTRÓNICO</Form.Label>
                        <Form.Control type="email" value={usuario?.email} disabled />
                      </Form.Group>

                      <h4 className="fw-bold mb-3">Credenciales de Conducción</h4>
                      <Row className="g-3 mb-4">
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <FaIdCard className="text-primary me-2" />
                              <span className="fw-bold small">DOCUMENTACIÓN</span>
                            </div>
                            <p className="mb-0 small">
                              Licencia: <Badge bg={getBadgeColor(documentacion.licencia.estado)} className="rounded-pill">
                                {getEstadoTexto(documentacion.licencia.estado)}
                              </Badge>
                            </p>
                            <p className="mb-0 small">
                              SOAT: <Badge bg={getBadgeColor(documentacion.soat.estado)} className="rounded-pill">
                                {getEstadoTexto(documentacion.soat.estado)}
                              </Badge>
                            </p>
                          </Card>
                        </Col>
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <FaCar className="text-primary me-2" />
                              <span className="fw-bold small">MI VEHÍCULO</span>
                            </div>
                            {cargandoVehiculo ? (
                              <p className="mb-0 small text-muted">Cargando...</p>
                            ) : vehiculo ? (
                              <>
                                <p className="mb-0 small">Placa: <span className="fw-bold">{vehiculo.placa || 'No registrada'}</span></p>
                                <p className="mb-0 small">
                                  Modelo: <span className="fw-bold">
                                    {vehiculo.marca || ''} {vehiculo.modelo || ''} {vehiculo.año ? vehiculo.año : ''}
                                  </span>
                                </p>
                                {vehiculo.color && (
                                  <p className="mb-0 small">Color: <span className="fw-bold">{vehiculo.color}</span></p>
                                )}
                              </>
                            ) : (
                              <p className="mb-0 small text-muted">No hay vehículo registrado</p>
                            )}
                          </Card>
                        </Col>
                      </Row>

                      <div className="d-flex gap-2">
                        <Button 
                          className="flex-grow-1 border-0 fw-bold" 
                          style={{ background: 'linear-gradient(135deg, #a385ff, #8a65ff)' }}
                          onClick={guardarCambios}
                          disabled={loading}
                        >
                          <FaSave className="me-2" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button variant="outline-danger" onClick={logout} disabled={loading}>Salir</Button>
                      </div>
                    </Form>
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
        titulo="Tu QR de Acceso Rápido - Conductor"
        mensajeExpiracion="Válido por 3 horas"
      />
    </div>
  );
}

export default DriverProfile;