import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import { FaCar, FaIdCard, FaStar, FaSave, FaQrcode, FaUserCircle, FaFileAlt } from "react-icons/fa";
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import fondo from "../Imagenes/AutoresContacto.png";

function DriverProfile() {
  const { usuario, token, setUsuario } = useAuth();
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehiculo, setVehiculo] = useState(null);
  const [cargandoVehiculo, setCargandoVehiculo] = useState(true);
  const [datosCalificacion, setDatosCalificacion] = useState({
    promedio: 0,
    total: 0
  });
  const [totalViajes, setTotalViajes] = useState(0);
  
  const [documentos, setDocumentos] = useState([]);
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
  const [errorDocumentos, setErrorDocumentos] = useState("");

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
          if (typeof data === 'number') {
            setDatosCalificacion({ promedio: data, total: 0 });
          } else if (data.promedio !== undefined) {
            setDatosCalificacion({ promedio: data.promedio, total: data.total || 0 });
          }
        }
      } catch (error) {
        console.error("Error al obtener calificaciones:", error);
      }
    };
    obtenerCalificaciones();
  }, [token, usuario?.idUsuarios]);

  useEffect(() => {
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
          if (Array.isArray(data)) {
            const viajesCompletados = data.filter(v => v.estado === 'FINALIZADO');
            setTotalViajes(viajesCompletados.length);
          } else if (data.totalViajes) {
            setTotalViajes(data.totalViajes);
          }
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };
    obtenerEstadisticasViajes();
  }, [token, usuario?.idUsuarios]);

  const obtenerDocumentos = async () => {
    if (!token || !usuario?.idUsuarios) return;
    try {
      setCargandoDocumentos(true);
      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/documentacion/documentacion_mis", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocumentos(Array.isArray(data) ? data : data.documentos || [data]);
      }
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    } finally {
      setCargandoDocumentos(false);
    }
  };

  useEffect(() => {
    obtenerDocumentos();
  }, [token, usuario?.idUsuarios]);

  const obtenerLicencia = () => {
    if (!documentos || documentos.length === 0) return null;
    return documentos.find(doc => 
      doc.tipoDocumento?.toLowerCase().includes('licencia') || 
      doc.tipoDocumento?.toLowerCase().includes('conducir')
    ) || documentos[0];
  };

  const licencia = obtenerLicencia();

  const guardarCambios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/${usuario.idUsuarios}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, telefono })
      });
      if (response.ok) {
        setUsuario({ ...usuario, nombre, telefono });
        toast.success('Datos actualizados correctamente');
      } else {
        toast.error('Error al actualizar los datos');
      }
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADO': case 'VÁLIDO': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'RECHAZADO': return 'danger';
      default: return 'secondary';
    }
  };

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
      {/* Capa de legibilidad (Overlay) */}
      <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(255, 255, 255, 0.65)', 
          zIndex: 0 
      }} />

      <Toaster position="top-right" />
      
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
                      {usuario?.fotoPerfil ? (
                        <img src={usuario.fotoPerfil} alt="Perfil" className="rounded-circle shadow" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                      ) : (
                        <FaUserCircle size={150} color="#124c83" className="shadow-sm rounded-circle bg-white p-2" />
                      )}
                    </div>
                    
                    <h3 className="fw-bold mb-1">{nombre || usuario?.nombre}</h3>
                    <Badge bg="warning" text="dark" className="px-3 rounded-pill mb-3">
                      <FaStar className="me-1" /> {datosCalificacion.promedio.toFixed(1)} ({datosCalificacion.total} reseñas)
                    </Badge>
                    
                    <Button onClick={() => navigate("/documentacion")} variant="outline-success" className="w-100 mb-3 rounded-pill">
                      <FaFileAlt className="me-2" /> Subir Documentación
                    </Button>
                    
                    <Button onClick={() => { setQrValue(`${token}|${usuario?.nombre}`); setShowQRModal(true); }} variant="outline-primary" className="w-100 mb-3 rounded-pill" style={{ borderColor: '#a385ff', color: '#a385ff' }}>
                      <FaQrcode className="me-2" /> Generar QR
                    </Button>
                    
                    <hr />
                    <div className="text-start px-3">
                      <p className="small text-muted mb-1">VIAJES COMPLETADOS</p>
                      <p className="fw-bold">{totalViajes} servicios</p>
                    </div>
                  </Col>

                  <Col md={8} className="p-4 bg-white">
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
                      
                      <h4 className="fw-bold mt-4 mb-3">Credenciales y Vehículo</h4>
                      <Row className="g-3 mb-4">
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <FaIdCard className="text-primary me-2" />
                              <span className="fw-bold small">LICENCIA</span>
                            </div>
                            <p className="mb-0 small">Estado: <Badge bg={getBadgeColor(licencia?.estado)}>{licencia?.estado || 'N/A'}</Badge></p>
                          </Card>
                        </Col>
                        <Col sm={6}>
                          <Card className="p-3 border-0 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <FaCar className="text-primary me-2" />
                              <span className="fw-bold small">VEHÍCULO</span>
                            </div>
                            <p className="mb-0 small">Placa: <span className="fw-bold">{vehiculo?.placa || 'No registrada'}</span></p>
                          </Card>
                        </Col>
                      </Row>

                      <Button 
                        className="w-100 border-0 fw-bold py-2" 
                        style={{ backgroundColor: '#54c7b8', color: 'white' }}
                        onClick={guardarCambios}
                        disabled={loading}
                      >
                        <FaSave className="me-2" /> {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                      </Button>
                    </Form>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <QRModal show={showQRModal} onHide={() => setShowQRModal(false)} qrValue={qrValue} usuario={usuario} />
    </div>
  );
}

export default DriverProfile;