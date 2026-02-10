import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup } from "react-bootstrap";
import { FaCar, FaIdCard, FaStar, FaSave } from "react-icons/fa";

function DriverProfile() {
  const { usuario, logout } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || 'Julian');
  const [telefono, setTelefono] = useState(usuario?.telefono || '3107002178');

  return (
    <div style={{ background: 'linear-gradient(20deg, #EDE7FF 30%, #a385ff 100%)', minHeight: '100vh' }}>
      <Navbar />
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
  );
}

export default DriverProfile;
