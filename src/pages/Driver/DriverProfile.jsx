import React, { useState, useEffect } from "react";
import img1 from "../Imagenes/DNNYPYGT65C3JHMUEEZKEUM7AY.jpg";
import img2 from "../Imagenes/salir-a-carretera-gonhergo.jpg";
import img3 from "../Imagenes/viaje-en-carro1.jpg";
// Slider de fondo con fade
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
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup } from "react-bootstrap";
import { FaCar, FaIdCard, FaStar, FaSave } from "react-icons/fa";

function DriverProfile() {
  const { usuario, logout } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || 'Julian');
  const [telefono, setTelefono] = useState(usuario?.telefono || '3107002178');
  const backgroundImages = [img1, img2, img3];

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
                <Row className="g-0">
                  {/* Columna Izquierda: Foto y Resumen */}
                  <Col md={4} className="bg-light text-center p-4 border-end">
                    <div className="mb-3 mt-3">
                      <img src="https://via.placeholder.com" className="rounded-circle shadow p-1 bg-white" alt="Perfil" style={{width: '150px', height: '150px'}} />
                    </div>
                    <h3 className="fw-bold mb-1">{nombre}</h3>
                    <Badge bg="warning" text="dark" className="px-3 rounded-pill mb-3">
                      <FaStar className="me-1" /> 4.9 Conductor
                    </Badge>
                    <Button variant="outline-primary" size="sm" className="w-100 mb-3 rounded-pill">Cambiar Foto</Button>
                    <hr />
                    <div className="text-start px-3">
                      <p className="small text-muted mb-1">MIEMBRO DESDE</p>
                      <p className="fw-bold">Enero 2025</p>
                      <p className="small text-muted mb-1">VIAJES COMPLETADOS</p>
                      <p className="fw-bold">154 servicios</p>
                    </div>
                  </Col>

                  {/* Columna Derecha: Formulario y Datos Técnicos */}
                  <Col md={8} className="p-4">
                    <h4 className="fw-bold mb-4">Información de Cuenta</h4>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">NOMBRE COMPLETO</Form.Label>
                            <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">TELÉFONO</Form.Label>
                            <Form.Control type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">CORREO ELECTRÓNICO</Form.Label>
                        <Form.Control type="email" value={usuario?.email || 'cauceron2002@gmail.com'} disabled />
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

                      <div className="d-flex gap-2">
                        <Button className="flex-grow-1 border-0 fw-bold" style={{ background: 'linear-gradient(135deg, #a385ff, #8a65ff)' }}>
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
    </div>
  );
}

export default DriverProfile;
