import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal, Alert, Spinner } from "react-bootstrap";
import { FaCar, FaIdCard, FaInfoCircle, FaWallet, FaArrowRight, FaFileAlt, FaArrowLeft, FaHistory } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import fondo from "../Imagenes/AutoresContacto.png";

const DriverHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    const brandColor = "#54c7b8";
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
    const [documentos, setDocumentos] = useState([]);
    const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
    const [errorDocumentos, setErrorDocumentos] = useState("");

    const [viajesRecientes, setViajesRecientes] = useState([]);
    const [todosLosViajes, setTodosLosViajes] = useState([]);
    const [cargandoViajes, setCargandoViajes] = useState(false);
    const [errorViajes, setErrorViajes] = useState("");
    const [showHistorialCompleto, setShowHistorialCompleto] = useState(false);
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
            if (!token || !usuario?.idUsuarios) {
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
        const intervaloGanancias = setInterval(obtenerGanancias, 60000);
        return () => clearInterval(intervaloGanancias);
    }, [token, usuario?.idUsuarios]);

    async function obtenerDocumentos() {
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
            console.log("Documentos recibidos:", data);

            let documentosArray = [];

            if (Array.isArray(data)) {
                documentosArray = data;
            } else if (data && Array.isArray(data.documentos)) {
                documentosArray = data.documentos;
            } else if (data && typeof data === 'object') {
                documentosArray = [data];
            }

            setDocumentos(documentosArray);

        } catch (error) {
            console.error("Error al obtener documentos:", error);
            setErrorDocumentos(error.message);
            setDocumentos([]);
        } finally {
            setCargandoDocumentos(false);
        }
    }

    useEffect(() => {
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
                    setTodosLosViajes(viajesData);
                    setViajesRecientes(viajesData.slice(0, 3));

                    const completados = viajesData.filter(v => v.estado === 'FINALIZADO').length;
                    const cancelados = viajesData.filter(v => v.estado === 'CANCELADO').length;
                    const enCurso = viajesData.filter(v => v.estado === 'EN_CURSO').length;

                    setEstadisticasViajes({ completados, cancelados, enCurso });

                } else if (respuesta.status === 404) {
                    console.log("No se encontraron viajes");
                    setViajesRecientes([]);
                    setTodosLosViajes([]);
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
        switch (estado) {
            case 'FINALIZADO': return 'success';
            case 'CANCELADO': return 'danger';
            case 'EN_CURSO': return 'warning';
            case 'PUBLICADO': return 'info';
            case 'CREADO': return 'secondary';
            default: return 'secondary';
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
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

    // Función para fechas de expedición (STRING) - se muestra directamente
    const formatearFechaExpedicion = (fecha) => {
        if (!fecha) return 'No disponible';
        return fecha; // Es string, lo mostramos directamente
    };

    // Función para fecha de subida (DATETIME)
    const formatearFechaSubida = (fecha) => {
        if (!fecha) return 'No disponible';
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const getDocumentoBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'APROBADO':
                return <Badge bg="success" className="rounded-pill">Aprobado</Badge>;
            case 'RECHAZADO':
                return <Badge bg="danger" className="rounded-pill">Rechazado</Badge>;
            case 'PENDIENTE':
                return <Badge bg="warning" className="rounded-pill">Pendiente</Badge>;
            default:
                return <Badge bg="secondary" className="rounded-pill">No disponible</Badge>;
        }
    };

    const obtenerLicencia = () => {
        if (!documentos || documentos.length === 0) return null;
        const licencia = documentos.find(doc =>
            doc.tipoDocumento?.toLowerCase().includes('licencia') ||
            doc.tipoDocumento?.toLowerCase().includes('conducir') ||
            !doc.tipoDocumento
        );

        return licencia;
    };

    const licencia = obtenerLicencia();

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
        color: currentStep >= stepNumber ? "#fff" : "#333",
        border: "none",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    });

    const stepLineStyle = (stepNumber) => ({
        flex: 1,
        height: "2px",
        background: "#e0e0e0",
        opacity: currentStep > stepNumber ? 1 : 0.3,
        zIndex: 1
    });

    // Estilo de tarjetas sin bordes oscuros, solo sombras
    const cardStyle = {
        background: "#ffffff",
        borderRadius: '20px',
        border: 'none',
        boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.02)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
    };

    const vehiculoPrincipal = vehiculos.length > 0 ? vehiculos[0] : null;

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
                backgroundColor: 'rgba(255, 255, 255, 0.88)', 
                zIndex: 0 
            }} />

            <div style={{ backgroundColor: brandColor, position: 'relative', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Navbar />
            </div>

            <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
                {/* Tarjeta de bienvenida */}
                <Card className="mb-4" style={cardStyle}>
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h2 className="fw-bold mb-0" style={{ color: '#333' }}>Panel de Conductor</h2>
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
                    {/* Tarjeta de Vehículo */}
                    <Col lg={7}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '12px', 
                                        backgroundColor: `${brandColor}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <FaCar size={20} style={{ color: brandColor }} />
                                    </div>
                                    <h5 className="mb-0 fw-semibold" style={{ color: '#333' }}>Vehículo Activo</h5>
                                </div>

                                {cargandoVehiculo ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" style={{ color: brandColor }} />
                                    </div>
                                ) : errorVehiculo ? (
                                    <div className="text-center py-4" style={{ backgroundColor: '#FEF2F2', borderRadius: '16px' }}>
                                        <p className="small text-danger mb-2">{errorVehiculo}</p>
                                        <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>Reintentar</Button>
                                    </div>
                                ) : vehiculoPrincipal ? (
                                    <div style={{ 
                                        padding: '16px', 
                                        borderRadius: '16px', 
                                        backgroundColor: '#F9FAFB',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <Row className="align-items-center">
                                            <Col xs={3} className="text-center">
                                                <div style={{ 
                                                    fontSize: '2.5rem',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    padding: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                                }}>
                                                    🚘
                                                </div>
                                            </Col>
                                            <Col xs={9}>
                                                <h6 className="fw-semibold mb-1" style={{ color: '#333', fontSize: '1.1rem' }}>
                                                    {vehiculoPrincipal.marca} {vehiculoPrincipal.modelo}
                                                </h6>
                                                <p className="mb-1 text-muted small">Placa: <span className="text-dark fw-semibold">{vehiculoPrincipal.placa}</span></p>
                                                <p className="mb-0 text-muted small">Capacidad: {vehiculoPrincipal.capacidad} pasajeros</p>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                    <div className="text-center py-4" style={{ backgroundColor: '#F9FAFB', borderRadius: '16px' }}>
                                        <p className="text-muted small mb-3">No tienes un vehículo registrado</p>
                                        <Button
                                            style={{ backgroundColor: brandColor, border: 'none', color: 'white' }}
                                            className="fw-semibold px-4 py-2"
                                            onClick={() => navigate("/registrar-vehiculo")}
                                        >
                                            Registrar ahora
                                        </Button>
                                    </div>
                                )}

                                {vehiculoPrincipal && (
                                    <Button
                                        variant="link"
                                        className="mt-3 p-0 text-decoration-none fw-semibold small shadow-none"
                                        style={{ color: '#666' }}
                                        onClick={() => navigate("/vehicle-registration")}
                                    >
                                        Registrar Vehículo
                                        <FaArrowRight size={12} className="ms-1" style={{ color: brandColor }} />
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={5}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="d-flex align-items-center mb-4">
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '12px', 
                                        backgroundColor: `${brandColor}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <FaIdCard size={20} style={{ color: brandColor }} />
                                    </div>
                                    <h5 className="mb-0 fw-semibold" style={{ color: '#333' }}>Licencia de Conducir</h5>
                                </div>

                                {cargandoDocumentos ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" size="sm" style={{ color: brandColor }} />
                                        <p className="mt-2 text-muted small">Cargando documentos...</p>
                                    </div>
                                ) : errorDocumentos ? (
                                    <Alert variant="danger" className="py-2">
                                        <small>{errorDocumentos}</small>
                                    </Alert>
                                ) : licencia ? (
                                    <div className="mb-auto">
                                        <ListGroup variant="flush">
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 py-2">
                                                <span className="text-muted small">Número</span>
                                                <span className="fw-semibold" style={{ color: '#333' }}>{licencia.numeroDocumento || 'Sin número'}</span>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 py-2">
                                                <span className="text-muted small">Expedición</span>
                                                <span className="fw-semibold" style={{ color: '#333' }}>{formatearFechaExpedicion(licencia.fechaExpedicion)}</span>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 py-2">
                                                <span className="text-muted small">Subida</span>
                                                <span className="fw-semibold" style={{ color: '#333' }}>{formatearFechaSubida(licencia.fechaSubida)}</span>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 py-2">
                                                <span className="text-muted small">Estado</span>
                                                {getDocumentoBadge(licencia.estado)}
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted small">No tienes una licencia registrada</p>
                                        <Button
                                            className="mt-2 fw-semibold py-2"
                                            style={{ backgroundColor: brandColor, border: 'none', color: 'white' }}
                                            onClick={() => navigate("/documentacion")}
                                        >
                                            Subir licencia
                                        </Button>
                                    </div>
                                )}

                                {licencia && (
                                    <Button
                                        className="w-100 mt-4 fw-semibold py-2"
                                        style={{ 
                                            backgroundColor: brandColor,
                                            color: 'white',
                                            border: 'none', 
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(84, 199, 184, 0.3)'
                                        }}
                                        onClick={() => navigate("/documentacion")}
                                    >
                                        ACTUALIZAR LICENCIA
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col lg={12}>
                        {documentos && documentos.some(d => d.estado === 'RECHAZADO') && (
                            <Alert variant="danger" className="border-0 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>
                                <div className="d-flex align-items-center">
                                    <FaInfoCircle size={24} className="me-3" />
                                    <div>
                                        <h5 className="mb-1 fw-semibold">Documentación Rechazada</h5>
                                        <p className="mb-0 small">Tu documentación no ha sido aprobada. No podrás publicar nuevos viajes hasta que actualices tus documentos.</p>
                                    </div>
                                    <Button
                                        variant="danger"
                                        className="ms-auto rounded-pill px-4 fw-semibold border-0"
                                        style={{ boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                                        onClick={() => navigate("/documentacion")}
                                    >
                                        ACTUALIZAR
                                    </Button>
                                </div>
                            </Alert>
                        )}
                        
                        {/* Tarjeta de Viajes */}
                        <Card className="border-0" style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center">
                                        <div style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            borderRadius: '12px', 
                                            backgroundColor: `${brandColor}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px'
                                        }}>
                                            <FaHistory size={20} style={{ color: brandColor }} />
                                        </div>
                                        <h5 className="mb-0 fw-semibold" style={{ color: '#333' }}>Viajes Recientes</h5>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Badge bg="success" className="rounded-pill px-3 py-2 fw-normal">
                                            {estadisticasViajes.completados} Completados
                                        </Badge>
                                        {estadisticasViajes.enCurso > 0 && (
                                            <Badge bg="warning" className="rounded-pill px-3 py-2 fw-normal">
                                                {estadisticasViajes.enCurso} En curso
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {cargandoViajes ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" style={{ color: brandColor }} />
                                        <p className="mt-2 text-muted small">Cargando viajes...</p>
                                    </div>
                                ) : errorViajes ? (
                                    <div className="text-center py-4">
                                        <p className="text-danger small">{errorViajes}</p>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => window.location.reload()}
                                        >
                                            Reintentar
                                        </Button>
                                    </div>
                                ) : viajesRecientes.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div style={{ 
                                            width: '60px', 
                                            height: '60px', 
                                            borderRadius: '50%', 
                                            backgroundColor: '#F3F4F6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 16px'
                                        }}>
                                            <FaHistory size={24} className="text-muted" />
                                        </div>
                                        <p className="text-muted mb-0">No hay viajes recientes</p>
                                    </div>
                                ) : (
                                    <>
                                        <ListGroup variant="flush">
                                            {viajesRecientes.map((viaje) => (
                                                <ListGroup.Item key={viaje.idViajes} className="px-0 border-0 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Row className="align-items-center">
                                                        <Col xs={1} className="text-center">
                                                            <div style={{ 
                                                                width: '32px', 
                                                                height: '32px', 
                                                                borderRadius: '10px', 
                                                                backgroundColor: `${brandColor}10`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <FaCar size={16} color={brandColor} />
                                                            </div>
                                                        </Col>
                                                        <Col xs={5}>
                                                            <p className="mb-0 fw-semibold" style={{ color: '#333' }}>Viaje #{viaje.idViajes}</p>
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
                                                            <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill px-3 py-2 fw-normal">
                                                                {getEstadoTexto(viaje.estado)}
                                                            </Badge>
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>

                                        {todosLosViajes.length > 3 && (
                                            <div className="text-center mt-4">
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => setShowHistorialCompleto(true)}
                                                    className="rounded-pill px-4 py-2 fw-semibold border-0"
                                                    style={{ backgroundColor: '#F9FAFB', color: '#666' }}
                                                >
                                                    Ver historial completo ({todosLosViajes.length} viajes)
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal de Historial Completo */}
            <Modal show={showHistorialCompleto} onHide={() => setShowHistorialCompleto(false)} size="lg" centered>
                <Modal.Header closeButton style={{ borderBottom: 'none', padding: '1.5rem 1.5rem 0.5rem' }}>
                    <Modal.Title className="fw-semibold" style={{ color: brandColor }}>
                        <FaHistory className="me-2" /> Historial Completo de Viajes
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem 1.5rem' }}>
                    {todosLosViajes.length === 0 ? (
                        <p className="text-center text-muted py-4">No hay viajes para mostrar</p>
                    ) : (
                        <ListGroup variant="flush">
                            {todosLosViajes.map((viaje) => (
                                <ListGroup.Item key={viaje.idViajes} className="py-3 border-0" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <Row className="align-items-center">
                                        <Col xs={1} className="text-center">
                                            <div style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                borderRadius: '10px', 
                                                backgroundColor: `${brandColor}10`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FaCar size={16} color={brandColor} />
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <p className="mb-0 fw-semibold" style={{ color: '#333' }}>Viaje #{viaje.idViajes}</p>
                                            <small className="text-muted">
                                                {formatearFecha(viaje.fechaHoraSalida)}
                                            </small>
                                        </Col>
                                        <Col xs={2}>
                                            <small className="text-muted">
                                                {viaje.cuposTotales - viaje.cuposDisponibles}/{viaje.cuposTotales}
                                            </small>
                                        </Col>
                                        <Col xs={2} className="text-end">
                                            <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill px-3 py-2 fw-normal">
                                                {getEstadoTexto(viaje.estado)}
                                            </Badge>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '0.5rem 1.5rem 1.5rem' }}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowHistorialCompleto(false)}
                        className="rounded-pill px-4 border-0"
                        style={{ backgroundColor: '#F9FAFB', color: '#666' }}
                    >
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Tutorial */}
            <Modal show={showTutorial} onHide={saltarTutorial} centered size="lg" backdrop="static">
                <Modal.Body className="p-5" style={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <div className="d-flex align-items-center justify-content-center mb-5">
                        <div style={stepCircleStyle(1)}>1</div>
                        <div style={stepLineStyle(1)}></div>
                        <div style={stepCircleStyle(2)}>2</div>
                        <div style={stepLineStyle(2)}></div>
                        <div style={stepCircleStyle(3)}>3</div>
                    </div>

                    <div className="text-center" style={{ minHeight: '200px' }}>
                        {currentStep === 1 && (
                            <div>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '50%', 
                                    backgroundColor: `${brandColor}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px'
                                }}>
                                    <FaWallet size={40} style={{ color: brandColor }} />
                                </div>
                                <h3 className="fw-semibold mb-3" style={{ color: '#333' }}>Tus Ganancias</h3>
                                <p className="text-muted">Monitorea tus ingresos diarios de forma transparente.</p>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '50%', 
                                    backgroundColor: `${brandColor}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px'
                                }}>
                                    <FaCar size={40} style={{ color: brandColor }} />
                                </div>
                                <h3 className="fw-semibold mb-3" style={{ color: '#333' }}>Vehículo</h3>
                                <p className="text-muted">Seguridad garantizada para ti y tus pasajeros.</p>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '50%', 
                                    backgroundColor: `${brandColor}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px'
                                }}>
                                    <FaFileAlt size={40} style={{ color: brandColor }} />
                                </div>
                                <h3 className="fw-semibold mb-3" style={{ color: '#333' }}>Documentación</h3>
                                <p className="text-muted">¡Casi listo! Solo falta validar tu documentación oficial.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 d-flex flex-column align-items-center">
                        <div className="d-flex gap-3 w-100 justify-content-center">
                            {currentStep > 1 && (
                                <Button
                                    variant="outline-secondary"
                                    onClick={manejarAtras}
                                    className="rounded-pill px-4 border-0"
                                    style={{ backgroundColor: '#F3F4F6', color: '#666' }}
                                >
                                    Atrás
                                </Button>
                            )}
                            <Button
                                style={{ backgroundColor: brandColor, border: 'none', color: 'white', boxShadow: '0 4px 12px rgba(84, 199, 184, 0.3)' }}
                                className="px-5 fw-semibold rounded-pill"
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