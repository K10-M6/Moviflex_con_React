import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FaQrcode, FaUserCircle, FaEnvelope, FaPhone, FaSave } from "react-icons/fa";
import { useAuth } from "../../pages/context/AuthContext";
import Navbar from "../../components/Navbar";
import QRModal from "../../components/QRModal";

function Profile() {
  const navigate = useNavigate();
  const { usuario, token } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [imagenUrl, setImagenUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert("Datos de perfil actualizados (simulación)");
  };

  const generarQr = () => {
    if (!token) {
      alert("No hay Token disponible. Inicia sesión nuevamente.");
      return;
    }

    const qrData = `${token}|${usuario?.nombre || ''}`;
    console.log("🔍 Generando QR con formato token|nombre");
    console.log("🔍 Longitud total:", qrData.length, "caracteres");
    console.log("🔍 Token:", token.substring(0, 30) + "...");
    console.log("🔍 Nombre incluido:", usuario?.nombre || 'sin nombre');
    
    setQrValue(qrData);
    setShowQRModal(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f3f1', position: 'relative' }}>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#124c83', width: '100%', position: 'relative', zIndex: 10 }}>
          <Navbar />
        </div>

        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 p-4">
                  <h2 className="fw-bold mb-0" style={{ color: '#0f0f0f' }}>Mi Perfil</h2>
                </Card.Header>
                
                <Card.Body className="p-4">
                  <Form onSubmit={handleSaveChanges}>
                    <Row className="align-items-center mb-4">
                      <Col md={4} className="text-center">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          {imagenUrl || usuario?.foto ? (
                            <img 
                              src={imagenUrl || usuario?.foto} 
                              alt="Perfil" 
                              className="rounded-circle shadow"
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                          ) : (
                            <FaUserCircle size={150} color="#141414" className="shadow-sm rounded-circle bg-white p-2" />
                          )}
                          <Form.Group controlId="formFile" className="mt-3">
                            <Form.Label className="btn btn-outline-primary btn-sm rounded-pill px-4" style={{ borderColor: '#1f1f1f', color: '#0c0c0c' }}>
                              Cambiar Foto
                            </Form.Label>
                            <Form.Control type="file" onChange={handleImageChange} style={{ display: 'none' }} />
                          </Form.Group>
                        </div>
                      </Col>
                      
                      <Col md={8}>
                        <div className="bg-light p-4 rounded-3">
                          <h5 className="fw-bold mb-3" style={{ color: '#242424' }}>Información Personal</h5>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Label className="small fw-bold">NOMBRE COMPLETO</Form.Label>
                              <Form.Control 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ingresa tu nombre"
                              />
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Label className="small fw-bold">TELÉFONO</Form.Label>
                              <Form.Control 
                                type="tel" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Ingresa tu teléfono"
                              />
                            </Col>
                          </Row>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">CORREO ELECTRÓNICO</Form.Label>
                            <Form.Control type="email" value={usuario?.email} disabled />
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>

                    <hr className="my-4" />

                    <Row className="g-3">
                      <Col md={6}>
                        <Card className="border-0 bg-light p-3 h-100">
                          <div className="d-flex align-items-center mb-2">
                            <FaEnvelope className="text-primary me-2" />
                            <span className="fw-bold small">ESTADÍSTICAS</span>
                          </div>
                          <p className="mb-1 small">Miembro desde: 2025</p>
                          <p className="mb-0 small">Viajes realizados: 0</p>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="border-0 bg-light p-3 h-100">
                          <div className="d-flex align-items-center mb-2">
                            <FaPhone className="text-primary me-2" />
                            <span className="fw-bold small">CONTACTO</span>
                          </div>
                          <p className="mb-1 small">Teléfono verificado: Sí</p>
                          <p className="mb-0 small">Email verificado: Sí</p>
                        </Card>
                      </Col>
                    </Row>

                    <div className="d-flex gap-3 mt-4">
                      <Button
                        onClick={generarQr}
                        variant="outline-primary"
                        className="flex-grow-1"
                        style={{ borderColor: '#111111', color: '#0e0e0e' }}
                      >
                        <FaQrcode className="me-2" />
                        Generar QR de acceso
                      </Button>

                      <Button 
                        type="submit" 
                        className="flex-grow-1 border-0"
                        style={{ background: '#000000', color: 'white' }}
                      >
                        <FaSave className="me-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
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