import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal } from "react-bootstrap";
import { FaCar, FaIdCard, FaInfoCircle, FaWallet, FaArrowRight, FaFileAlt, FaArrowLeft, FaHistory } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DriverHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    const brandColor = "#124c83";
    const darkBorder = "#000000";

    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [vehiculos, setVehiculos] = useState([]);
    const [cargandoVehiculo, setCargandoVehiculo] = useState(true);
    const [errorVehiculo, setErrorVehiculo] = useState("");

    const [ganancias, setGanancias] = useState({
        hoy: 0,
        estaSemana: 0,
        esteMes: 0
    });

    const [documentos, setDocumentos] = useState({
        licencia: { estado: 'PENDIENTE', fechaVencimiento: null },
        soat: { estado: 'PENDIENTE', fechaVencimiento: null },
        tecnomecanica: { estado: 'PENDIENTE', fechaVencimiento: null },
        seguro: { estado: 'PENDIENTE', fechaVencimiento: null }
    });

    const [cargarDocumentos, setCargarDocumentos] = useState(false);
    const [errorDocumentos, setErrorDocumentos] = useState("");

    const [viajesRecientes, setViajesRecientes] = useState([]);
    const [cargandoViajes, setCargandoViajes] = useState(false);
    const [errorViajes, setErrorViajes] = useState("");
    const [estadisticasViajes, setEstadisticasViajes] = useState({
        completados: 0,
        cancelados: 0,
        enCurso: 0
    });

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem("tutorial_conductor_visto");
        if (!hasSeenTutorial) setShowTutorial(true);
    }, []);

    useEffect(() => {
        const obtenerGanancias = async () => {
            if (!token  || !usuario?.idUsuarios) {
                console.log("No hay token disponible para obtener ganancias");
                return;
            }
            try {
                const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setGanancias({
                        hoy: data.hoy || 0,
                        estaSemana: data.estaSemana || 0,
                        esteMes: data.esteMes || 0
                    });
                } else {
                    console.log("Error al obtener ganancias:", respuesta.status);
                }
            } catch (error) {
                console.error("Error de conexión al obtener ganancias:", error);
            }
        };
        obtenerGanancias();
        const instervaloGanancias = setInterval(obtenerGanancias, 60000);
        return () => clearInterval(instervaloGanancias);
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerDocumentos = async () => {
            if (!token || !usuario?.idUsuarios) {
                console.log("No hay token disponible para obtener documentos");
                return;
            }
            try {
                setCargarDocumentos(true);
                setErrorDocumentos("");
                const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/documentacion/documentacion_mis`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setDocumentos({
                        licencia: data.licencia || { estado: 'PENDIENTE', fechaVencimiento: null },
                        soat: data.soat || { estado: 'PENDIENTE', fechaVencimiento: null },
                        tecnomecanica: data.tecnomecanica || { estado: 'PENDIENTE', fechaVencimiento: null },
                        seguro: data.seguro || { estado: 'PENDIENTE', fechaVencimiento: null }
                    });
                } else if (respuesta.status === 404) {
                    console.log("No se encontraron documentos para el usuario");
                } 
            } catch (error) {
                console.error("Error de conexión al obtener documentos:", error);
                    setErrorDocumentos("Error al obtener documentos");
                } finally {
                    setCargarDocumentos(false);
                }
            };
        obtenerDocumentos();
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerViajes = async () => {
            if (!token || !usuario?.idUsuarios) {
                console.log("No hay token disponible para obtener viajes");
                return;
            }
            
            try {
                setCargandoViajes(true);
                setErrorViajes("");
                
                const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/viajes/mis-viajes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    console.log("Viajes recibidos:", data);
                    
                    const viajesData = Array.isArray(data) ? data : [];
                    setViajesRecientes(viajesData.slice(0, 3)); 
                    
                    const completados = viajesData.filter(v => v.estado === 'FINALIZADO').length;
                    const cancelados = viajesData.filter(v => v.estado === 'CANCELADO').length;
                    const enCurso = viajesData.filter(v => v.estado === 'EN_CURSO').length;
                    
                    setEstadisticasViajes({ completados, cancelados, enCurso });
                    
                } else if (respuesta.status === 404) {
                    console.log("No se encontraron viajes");
                    setViajesRecientes([]);
                } else {
                    const errorText = await respuesta.text();
                    console.log("Error response:", errorText);
                    setErrorViajes(`Error ${respuesta.status}: No se pudieron cargar los viajes`);
                }
            } catch (error) {
                console.error("Error de conexión al obtener viajes:", error);
                setErrorViajes("Error de conexión con el servidor");
            } finally {
                setCargandoViajes(false);
            }
        };

        obtenerViajes();
        
        const intervaloViajes = setInterval(obtenerViajes, 60000);
        return () => clearInterval(intervaloViajes);
        
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerVehiculos = async () => {
            if (!token) return;
            try {
                setCargandoVehiculo(true);
                setErrorVehiculo("");
                const respuesta = await fetch(`https://backendmovi-production-c657.up.railway.app/api/vehiculos/mis-vehiculos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    if (Array.isArray(data)) setVehiculos(data);
                    else if (data && typeof data === 'object') setVehiculos([data]);
                    else setVehiculos([]);
                } else if (respuesta.status === 404) {
                    setVehiculos([]);
                } else {
                    setErrorVehiculo(`Error ${respuesta.status}: No se pudieron cargar los datos`);
                }
            } catch (error) {
                setErrorVehiculo("Error de conexión con el servidor");
            } finally {
                setCargandoVehiculo(false);
            }
        };
        obtenerVehiculos();
    }, [token]);

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'FINALIZADO': return 'success';
            case 'CANCELADO': return 'danger';
            case 'EN_CURSO': return 'warning';
            case 'PUBLICADO': return 'info';
            case 'CREADO': return 'secondary';
            default: return 'secondary';
        }
    };

    const getEstadoTexto = (estado) => {
        switch(estado) {
            case 'FINALIZADO': return 'Completado';
            case 'CANCELADO': return 'Cancelado';
            case 'EN_CURSO': return 'En curso';
            case 'PUBLICADO': return 'Publicado';
            case 'CREADO': return 'Creado';
            default: return estado || 'Desconocido';
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        const date = new Date(fecha);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        if (date.toDateString() === hoy.toDateString()) {
            return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === ayer.toDateString()) {
            return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleString('es-ES', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getDocumentoBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'VÁLIDO':
            case 'VALIDO':
            case 'APROBADO':
                return <Badge bg="success" className="rounded-pill">Válido</Badge>;
            case 'VENCIDO':
            case 'RECHAZADO':
                return <Badge bg="danger" className="rounded-pill">Vencido</Badge>;
            case 'PENDIENTE':
            case 'REVISION':
                return <Badge bg="warning" className="rounded-pill">Pendiente</Badge>;
            default:
                return <Badge bg="secondary" className="rounded-pill">No subido</Badge>;
        }
    };

    const estaVencido = (fechaVencimiento) => {
        if (!fechaVencimiento) return false;
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        return vencimiento < hoy;
    };

    // --- LÓGICA DEL TUTORIAL ---
    const manejarSiguiente = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
        else {
            localStorage.setItem("tutorial_conductor_visto", "true");
            setShowTutorial(false);
            navigate("/documentacion"); 
        }
    };

    const manejarAtras = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
    const saltarTutorial = () => { localStorage.setItem("tutorial_conductor_visto", "true"); setShowTutorial(false); };
    const repetirTutorial = () => { setCurrentStep(1); setShowTutorial(true); };

    const stepCircleStyle = (stepNumber) => ({
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        zIndex: 2,
        transition: "all 0.3s ease",
        background: currentStep >= stepNumber ? brandColor : "#fff",
        color: currentStep >= stepNumber ? "#fff" : darkBorder,
        border: `1.5px solid ${darkBorder}`
    });

    const stepLineStyle = (stepNumber) => ({
        flex: 1,
        height: "2px",
        background: darkBorder,
        opacity: currentStep > stepNumber ? 1 : 0.2,
        zIndex: 1
    });

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: '16px',
        border: `1.5px solid ${darkBorder}`,
        boxShadow: "4px 4px 0px rgba(0,0,0,0.08)",
        overflow: "hidden"
    };

    const vehiculoPrincipal = vehiculos.length > 0 ? vehiculos[0] : null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f3f1', position: 'relative', overflowX: 'hidden' }}>
            
            <div style={{ backgroundColor: brandColor, borderBottom: `1.5px solid ${darkBorder}`, position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>
            
            <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
                <Card className="mb-4" style={cardStyle}>
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h2 className="fw-bold mb-0" style={{ color: darkBorder }}>Panel de Conductor</h2>
                                <Button 
                                    variant="link" 
                                    className="p-0 ms-2 fw-bold text-decoration-none shadow-none"
                                    onClick={repetirTutorial}
                                    style={{ color: brandColor }}
                                >
                                    <FaInfoCircle className="me-1" /> Ayuda
                                </Button>
                            </div>
                            <p className="text-muted mb-0">Bienvenido, gestiona tu actividad diaria</p>
                        </div>
                        <div className="text-end">
                            <span className="small text-uppercase fw-bold text-muted d-block">Ganancias Hoy</span>
                            <h3 className="fw-bold mb-0" style={{ color: brandColor }}>00.00 COP</h3>
                        </div>
                    </Card.Body>
                </Card>

                <Row className="g-4">
                    <Col lg={7}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <FaCar size={22} style={{ color: brandColor }} className="me-2" />
                                    <h5 className="mb-0 fw-bold" style={{ color: darkBorder }}>Vehículo Activo</h5>
                                </div>
                                
                                {cargandoVehiculo ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border" style={{ color: brandColor }} />
                                    </div>
                                ) : errorVehiculo ? (
                                    <div className="text-center py-4 border rounded-3" style={{ borderStyle: 'dashed !important' }}>
                                        <p className="small text-danger mb-2">{errorVehiculo}</p>
                                        <Button variant="outline-dark" size="sm" onClick={() => window.location.reload()}>Reintentar</Button>
                                    </div>
                                ) : vehiculoPrincipal ? (
                                    <div className="p-3 rounded-3" style={{ border: `1.5px solid ${darkBorder}`, backgroundColor: '#fff' }}>
                                        <Row className="align-items-center">
                                            <Col xs={3} className="text-center display-6">🚘</Col>
                                            <Col xs={9}>
                                                <h6 className="fw-bold mb-1">{vehiculoPrincipal.marca} {vehiculoPrincipal.modelo}</h6>
                                                <p className="mb-1 text-muted small">Placa: <span className="text-dark fw-bold">{vehiculoPrincipal.placa}</span></p>
                                                <p className="mb-2 text-muted small">Capacidad: {vehiculoPrincipal.capacidad} pasajeros</p>
                                                <Badge style={{ backgroundColor: brandColor, color: 'white', border: `1px solid ${darkBorder}` }} className="px-3 py-2">
                                                    {vehiculoPrincipal.estado === 'ACTIVO' ? '✓ Verificado' : '• Pendiente'}
                                                </Badge>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 border rounded-3" style={{ borderStyle: 'dashed !important' }}>
                                        <p className="text-muted small">No tienes un vehículo registrado</p>
                                        <Button 
                                            style={{ backgroundColor: brandColor, borderColor: darkBorder, color: 'white' }} 
                                            className="fw-bold px-4" 
                                            onClick={() => navigate("/registrar-vehiculo")}
                                        >
                                            Registrar ahora
                                        </Button>
                                    </div>
                                )}
                                
                                {vehiculoPrincipal && (
                                    <Button 
                                        variant="link" 
                                        className="mt-4 p-0 text-decoration-none fw-bold small shadow-none" 
                                        style={{ color: darkBorder }}
                                        onClick={() => navigate(`/driver-home`)}
                                    >
                                        GESTIONAR VEHÍCULO <FaArrowRight size={12} className="ms-1" style={{ color: brandColor }} />
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={5}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="d-flex align-items-center mb-4">
                                    <FaIdCard size={22} style={{ color: brandColor }} className="me-2" />
                                    <h5 className="mb-0 fw-bold" style={{ color: darkBorder }}>Documentación</h5>
                                </div>
                                
                                {cargarDocumentos ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm" style={{ color: brandColor }} />
                                    </div>
                                ) : errorDocumentos ? (
                                    <p className="text-danger small">{errorDocumentos}</p>
                                ) : (
                                    <ListGroup variant="flush" className="mb-auto">
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                            <span className="text-muted">Licencia</span>
                                            {getDocumentoBadge(documentos.licencia.estado)}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                            <span className="text-muted">SOAT</span>
                                            {getDocumentoBadge(documentos.soat.estado)}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                            <span className="text-muted">Tecno-mecánica</span>
                                            {getDocumentoBadge(documentos.tecnomecanica.estado)}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 bg-transparent">
                                            <span className="text-muted">Seguro</span>
                                            {getDocumentoBadge(documentos.seguro.estado)}
                                        </ListGroup.Item>
                                    </ListGroup>
                                )}
                                
                                <Button 
                                    className="w-100 mt-4 fw-bold py-2 shadow-sm" 
                                    style={{ backgroundColor: darkBorder, color: 'white', border: 'none', borderRadius: '8px' }}
                                    onClick={() => navigate("/documentacion")}
                                >
                                    ACTUALIZAR ARCHIVOS
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col lg={12}>
                        <Card className="shadow border-0" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center" style={{ color: brandColor }}>
                                        <FaHistory size={24} className="me-2" />
                                        <h5 className="mb-0 fw-bold">Viajes Recientes</h5>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Badge bg="success" className="rounded-pill">
                                            {estadisticasViajes.completados} Completados
                                        </Badge>
                                        {estadisticasViajes.enCurso > 0 && (
                                            <Badge bg="warning" className="rounded-pill">
                                                {estadisticasViajes.enCurso} En curso
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                
                                {cargandoViajes ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Cargando viajes...</p>
                                    </div>
                                ) : errorViajes ? (
                                    <div className="text-center py-4">
                                        <p className="text-danger">{errorViajes}</p>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => window.location.reload()}
                                        >
                                            Reintentar
                                        </Button>
                                    </div>
                                ) : viajesRecientes.length === 0 ? (
                                    <div className="text-center py-4">
                                        <FaHistory size={30} className="text-muted mb-2" />
                                        <p className="text-muted">No hay viajes recientes</p>
                                    </div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {viajesRecientes.map((viaje) => (
                                            <ListGroup.Item key={viaje.idViajes} className="px-0">
                                                <Row className="align-items-center">
                                                    <Col xs={1} className="text-center">
                                                        <FaCar size={20} color={brandColor} />
                                                    </Col>
                                                    <Col xs={5}>
                                                        <p className="mb-0 fw-bold">Viaje #{viaje.idViajes}</p>
                                                        <small className="text-muted">
                                                            {formatearFecha(viaje.fechaHoraSalida)}
                                                        </small>
                                                    </Col>
                                                    <Col xs={3}>
                                                        <small className="text-muted">
                                                            {viaje.cuposTotales - viaje.cuposDisponibles}/{viaje.cuposTotales} pasajeros
                                                        </small>
                                                    </Col>
                                                    <Col xs={3} className="text-end">
                                                        <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill">
                                                            {getEstadoTexto(viaje.estado)}
                                                        </Badge>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>

            <Modal show={showTutorial} onHide={saltarTutorial} centered size="lg" backdrop="static">
                <Modal.Body className="p-5" style={{ border: `2px solid ${darkBorder}`, borderRadius: '15px' }}>
                    <div className="d-flex align-items-center justify-content-center mb-5">
                        <div style={stepCircleStyle(1)}>1</div>
                        <div style={stepLineStyle(1)}></div>
                        <div style={stepCircleStyle(2)}>2</div>
                        <div style={stepLineStyle(2)}></div>
                        <div style={stepCircleStyle(3)}>3</div>
                    </div>

                    <div className="text-center animate__animated animate__fadeIn" style={{ minHeight: '200px' }}>
                        {currentStep === 1 && (
                            <div>
                                <FaWallet size={60} style={{ color: brandColor }} className="mb-3" />
                                <h3 className="fw-bold" style={{ color: darkBorder }}>Tus Ganancias</h3>
                                <p className="text-muted fs-5">Monitorea tus ingresos diarios de forma transparente.</p>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div>
                                <FaCar size={60} style={{ color: brandColor }} className="mb-3" />
                                <h3 className="fw-bold" style={{ color: darkBorder }}>Vehículo Verificado</h3>
                                <p className="text-muted fs-5">Seguridad garantizada para ti y tus pasajeros.</p>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div>
                                <FaFileAlt size={60} style={{ color: brandColor }} className="mb-3" />
                                <h3 className="fw-bold" style={{ color: darkBorder }}>Carga de Documentos</h3>
                                <p className="text-muted fs-5">¡Casi listo! Solo falta validar tu documentación oficial.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 d-flex flex-column align-items-center">
                        <div className="d-flex gap-3 w-100 justify-content-center">
                            {currentStep > 1 && (
                                <Button 
                                    variant="outline-dark" 
                                    onClick={manejarAtras} 
                                    className="rounded-pill px-4"
                                    style={{ border: `1.5px solid ${darkBorder}` }}
                                >
                                    Atrás
                                </Button>
                            )}
                            <Button 
                                style={{ backgroundColor: brandColor, borderColor: darkBorder, color: 'white', border: `1.5px solid ${darkBorder}` }}
                                className="px-5 fw-bold rounded-pill"
                                onClick={manejarSiguiente}
                            >
                                {currentStep === 3 ? "Finalizar" : "Siguiente"}
                            </Button>
                        </div>
                        <Button variant="link" className="text-muted mt-3 text-decoration-none small shadow-none" onClick={saltarTutorial}>
                            Saltar recorrido
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DriverHome;