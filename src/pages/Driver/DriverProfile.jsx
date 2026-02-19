import React, { useState, useEffect } from "react";
import img1 from "../Imagenes/DNNYPYGT65C3JHMUEEZKEUM7AY.jpg";
import img2 from "../Imagenes/salir-a-carretera-gonhergo.jpg";
import img3 from "../Imagenes/viaje-en-carro1.jpg";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import { FaCar, FaIdCard, FaStar, FaSave, FaQrcode, FaUserCircle, FaEnvelope, FaPhone, FaFileAlt } from "react-icons/fa"; // ← AÑADÍ FaFileAlt
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom"; // ← AÑADIR ESTA LÍNEA


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
              opacity: i === index ? (fade ? 1 : 1) : (fade && (i === (index + images.length - 1) % images.length) ? 0 : 0),
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
  const { usuario, token, logout } = useAuth();
  const navigate = useNavigate(); // ← AÑADIR ESTA LÍNEA
  
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [imagenUrl, setImagenUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  
  const backgroundImages = [img1, img2, img3];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenUrl(URL.createObjectURL(file));
    }
  };

  const generarQr = () => {
    if (!token) {
      alert("No hay Token disponible. Inicia sesión nuevamente.");
      return;
    }

    const qrData = `${token}|${usuario?.nombre || ''}`;
    console.log("🔍 ===== GENERANDO QR CONDUCTOR =====");
    console.log("🔍 Longitud total:", qrData.length, "caracteres");
    console.log("🔑 Token:", token.substring(0, 30) + "...");
    console.log("👤 Nombre incluido:", usuario?.nombre || 'sin nombre');
    console.log("🔍 ===== FIN GENERACIÓN =====\n");
    
    setQrValue(qrData);
    setShowQRModal(true);
  };

  // ← NUEVA FUNCIÓN PARA IR A DOCUMENTACIÓN
  const irADocumentacion = () => {
    navigate("/documentacion");
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BackgroundSlider images={backgroundImages} interval={2500} overlayColor={'rgba(163,133,255,0.35)'} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#a385ff', width: '100%', position: 'relative', zIndex: 10 }}>
          <Navbar />
        </div>
        
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="shadow border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 p-4">
                  <h2 className="fw-bold mb-0" style={{ color: '#a385ff' }}>Mi Perfil de Conductor</h2>
                </Card.Header>
                
                <Row className="g-0">
                  <Col md={4} className="bg-light text-center p-4 border-end">
                    <div className="mb-3">
                      {imagenUrl || usuario?.foto ? (
                        <img 
                          src={imagenUrl || usuario?.foto} 
                          alt="Perfil" 
                          className="rounded-circle shadow"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUserCircle size={150} color="#a385ff" className="shadow-sm rounded-circle bg-white p-2" />
                      )}
                    </div>
                    
                    <h3 className="fw-bold mb-1">{nombre || usuario?.nombre}</h3>
                    <Badge bg="warning" text="dark" className="px-3 rounded-pill mb-3">
                      <FaStar className="me-1" /> 4.9 Conductor
                    </Badge>
                    
                    <Form.Group controlId="formFile" className="mb-3">
                      <Form.Label className="btn btn-outline-primary w-100 rounded-pill">
                        Cambiar Foto
                      </Form.Label>
                      <Form.Control type="file" onChange={handleImageChange} style={{ display: 'none' }} />
                    </Form.Group>
                    
                    {/* ← NUEVO BOTÓN PARA DOCUMENTACIÓN (arriba del QR) */}
                    <Button 
                      onClick={irADocumentacion}
                      variant="outline-success" 
                      className="w-100 mb-3 rounded-pill"
                      style={{ borderColor: '#28a745', color: '#28a745' }}
                    >
                      <FaFileAlt className="me-2" />
                      Subir Documentación
                    </Button>
                    
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
                      <p className="small text-muted mb-1">MIEMBRO DESDE</p>
                      <p className="fw-bold">Enero 2025</p>
                      <p className="small text-muted mb-1">VIAJES COMPLETADOS</p>
                      <p className="fw-bold">154 servicios</p>
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
                            <p className="mb-0 small">Licencia: <span className="text-success fw-bold">VIGENTE</span></p>
                            <p className="mb-0 small">SOAT: <span className="text-success fw-bold">VIGENTE</span></p>
                          </Card>
                        </Col>
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <FaCar className="text-primary me-2" />
                              <span className="fw-bold small">MI VEHÍCULO</span>
                            </div>
                            <p className="mb-0 small">Placa: <span className="fw-bold">KHM-456</span></p>
                            <p className="mb-0 small">Modelo: <span className="fw-bold">Sedán 2022</span></p>
                          </Card>
                        </Col>
                      </Row>

                      <Row className="g-3 mb-4">
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaEnvelope className="text-primary me-2" />
                              <span className="fw-bold small">ESTADÍSTICAS</span>
                            </div>
                            <p className="mb-0 small">Calificación promedio: 4.9</p>
                            <p className="mb-0 small">Viajes este mes: 45</p>
                          </Card>
                        </Col>
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaPhone className="text-primary me-2" />
                              <span className="fw-bold small">VERIFICACIÓN</span>
                            </div>
                            <p className="mb-0 small">Teléfono: <span className="text-success">✓</span></p>
                            <p className="mb-0 small">Documentos: <span className="text-success">✓</span></p>
                          </Card>
                        </Col>
                      </Row>

                      <div className="d-flex gap-2">
                        <Button 
                          className="flex-grow-1 border-0 fw-bold" 
                          style={{ background: 'linear-gradient(135deg, #a385ff, #8a65ff)' }}
                        >
                          <FaSave className="me-2" /> Guardar Cambios
                        </Button>
                        <Button variant="outline-danger" onClick={logout}>Salir</Button>
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