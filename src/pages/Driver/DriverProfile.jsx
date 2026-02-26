import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import { FaCar, FaIdCard, FaStar, FaSave, FaQrcode, FaUserCircle, FaFileAlt } from "react-icons/fa";
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

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
  
  // CORRECCIÓN: Estado para documentos usando array (como en DriverHome)
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
          console.log("⭐ Datos de calificación recibidos:", data);
          
          if (typeof data === 'number') {
            setDatosCalificacion({
              promedio: data,
              total: 0
            });
          } else if (data.promedio !== undefined) {
            setDatosCalificacion({
              promedio: data.promedio,
              total: data.total || 0
            });
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
          console.log("📊 Viajes recibidos en DriverProfile:", data);
          
          if (Array.isArray(data)) {
            const viajesCompletados = data.filter(v => v.estado === 'FINALIZADO');
            setTotalViajes(viajesCompletados.length);
          } else if (data.viajes && Array.isArray(data.viajes)) {
            const viajesCompletados = data.viajes.filter(v => v.estado === 'FINALIZADO');
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

  // CORRECCIÓN: Función para obtener documentos (adaptada de DriverHome)
  const obtenerDocumentos = async () => {
    if (!token || !usuario?.idUsuarios) {
      console.log("No hay token disponible para obtener documentos");
      return;
    }

    try {
      setCargandoDocumentos(true);
      setErrorDocumentos("");

      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/documentacion/documentacion_mis", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver documentos");
        }
        if (response.status === 404) {
          console.log("No se encontraron documentos");
          setDocumentos([]);
          setCargandoDocumentos(false);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📄 Documentos recibidos en DriverProfile:", data);

      // MISMA LÓGICA FLEXIBLE QUE EN DRIVERHOME
      let documentosArray = [];
      
      if (Array.isArray(data)) {
        documentosArray = data; // Si es array directo
      } else if (data && Array.isArray(data.documentos)) {
        documentosArray = data.documentos; // Si viene con propiedad 'documentos'
      } else if (data && typeof data === 'object') {
        documentosArray = [data]; // Si es un objeto único, lo convertimos en array
      }

      setDocumentos(documentosArray);

    } catch (error) {
      console.error("Error al obtener documentos:", error);
      setErrorDocumentos(error.message);
      setDocumentos([]);
    } finally {
      setCargandoDocumentos(false);
    }
  };

  useEffect(() => {
    obtenerDocumentos();
  }, [token, usuario?.idUsuarios]);

  // CORRECCIÓN: Función para obtener la licencia del array de documentos
  const obtenerLicencia = () => {
    if (!documentos || documentos.length === 0) return null;
    
    // Buscar el primer documento que sea licencia
    const licencia = documentos.find(doc => 
      doc.tipoDocumento?.toLowerCase().includes('licencia') || 
      doc.tipoDocumento?.toLowerCase().includes('conducir') ||
      !doc.tipoDocumento // Si no hay tipo, asumimos que es licencia
    );
    
    return licencia || documentos[0]; // Si no encuentra por tipo, devuelve el primero
  };

  const licencia = obtenerLicencia();

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  const formatearFechaDocumento = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Formato inválido';
    }
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
    switch (estado?.toUpperCase()) {
      case 'APROBADO':
      case 'VÁLIDO':
      case 'VALIDO':
        return 'success';
      case 'PENDIENTE':
      case 'REVISION':
        return 'warning';
      case 'RECHAZADO':
      case 'VENCIDO':
        return 'danger';
      default:
        return 'secondary';
    }
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
                      <FaStar className="me-1" /> {datosCalificacion.promedio.toFixed(1)} ({datosCalificacion.total} {datosCalificacion.total === 1 ? 'reseña' : 'reseñas'})
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
                              <span className="fw-bold small">LICENCIA DE CONDUCIR</span>
                            </div>
                            {cargandoDocumentos ? (
                              <p className="mb-0 small text-muted">Cargando...</p>
                            ) : errorDocumentos ? (
                              <p className="mb-0 small text-danger">{errorDocumentos}</p>
                            ) : licencia ? (
                              <>
                                <p className="mb-0 small">
                                  Número: <span className="fw-bold">{licencia.numeroDocumento || 'No disponible'}</span>
                                </p>
                                <p className="mb-0 small">
                                  Expedición: <span className="fw-bold">{formatearFechaDocumento(licencia.fechaExpedicion)}</span>
                                </p>
                                <p className="mb-0 small">
                                  Estado: <Badge bg={getBadgeColor(licencia.estado)} className="rounded-pill">
                                    {licencia.estado || 'PENDIENTE'}
                                  </Badge>
                                </p>
                              </>
                            ) : (
                              <p className="mb-0 small text-muted">No hay licencia registrada</p>
                            )}
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
                                <p className="mb-0 small">
                                  Capacidad: <span className="fw-bold">{vehiculo.capacidad || 'No especificada'} pasajeros</span>
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