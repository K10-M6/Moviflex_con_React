import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal, Alert, Spinner, Form, InputGroup } from "react-bootstrap";
import { FaCar, FaIdCard, FaInfoCircle, FaWallet, FaArrowRight, FaFileAlt, FaArrowLeft, FaHistory, FaClock, FaRoute, FaCheckCircle, FaSearch, FaMapMarkerAlt, FaFilter } from "react-icons/fa";
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import fondo from "../Imagenes/AutoresContacto.png";
import toast from "react-hot-toast";

const DriverHome = () => {
    const { usuario, token } = useAuth();
    const { socket } = useSocket();
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

    // Nuevos estados para búsqueda y filtros
    const [busquedaViajes, setBusquedaViajes] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
    const [showDetalleViaje, setShowDetalleViaje] = useState(false);

    // Nuevos estados para analíticas avanzadas
    const [statsAvanzadas, setStatsAvanzadas] = useState({
        ganancias: { total: 0, historial: [] },
        tiempoEnLinea: { totalHoras: 0, historial: [] },
        rutasFrecuentes: [],
        resumenViajes: { total: 0, rol: '' }
    });
    const [periodo, setPeriodo] = useState('mensual');
    const [cargandoStats, setCargandoStats] = useState(false);

    // Estados para solicitud de cambio de vehículo
    const [showSolicitudModal, setShowSolicitudModal] = useState(false);
    const [formDataSolicitud, setFormDataSolicitud] = useState({
        marca: '',
        modelo: '',
        placa: '',
        capacidad: ''
    });
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
    const [mensajeSolicitud, setMensajeSolicitud] = useState({ tipo: '', texto: '' });

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

    // Función para filtrar viajes
    const filtrarViajes = (viajes) => {
        return viajes.filter(viaje => {
            // Búsqueda por texto
            const textoBusqueda = busquedaViajes.toLowerCase();
            const coincideBusqueda = textoBusqueda === '' || 
                viaje.idViajes.toString().includes(textoBusqueda) ||
                (viaje.ruta?.nombre?.toLowerCase().includes(textoBusqueda));
            
            // Filtro por estado
            const coincideEstado = filtroEstado === 'TODOS' || viaje.estado === filtroEstado;
            
            return coincideBusqueda && coincideEstado;
        });
    };

    const viajesFiltrados = filtrarViajes(todosLosViajes);

    // Función para traer estadísticas avanzadas desde el nuevo service
    const traerEstadisticasAvanzadas = async () => {
        if (!token) return;
        try {
            setCargandoStats(true);
            const headers = { "Authorization": "Bearer " + token };

            const [resGanancias, resTime, resRutas, resViajes] = await Promise.all([
                fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/ganancias?periodo=${periodo}`, { headers }),
                fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/online-time?periodo=${periodo}`, { headers }),
                fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/rutas`, { headers }),
                fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/viajes`, { headers })
            ]);

            const nuevasStats = { ...statsAvanzadas };

            if (resGanancias.ok) nuevasStats.ganancias = await resGanancias.json();
            if (resTime.ok) nuevasStats.tiempoEnLinea = await resTime.json();
            if (resRutas.ok) nuevasStats.rutasFrecuentes = await resRutas.json();
            if (resViajes.ok) nuevasStats.resumenViajes = await resViajes.json();

            setStatsAvanzadas(nuevasStats);
        } catch (error) {
            console.error("Error al traer estadísticas avanzadas:", error);
        } finally {
            setCargandoStats(false);
        }
    };

    useEffect(() => {
        traerEstadisticasAvanzadas();
    }, [token, periodo]);

    const obtenerVehiculos = useCallback(async () => {
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
    }, [token]);

    useEffect(() => {
        obtenerVehiculos();
    }, [obtenerVehiculos]);

    useEffect(() => {
        if (socket) {
            const handleProcessed = (data) => {
                toast(data.aprobado ? '¡Tu cambio de vehículo fue aprobado!' : 'Tu cambio de vehículo fue rechazado.', {
                    icon: data.aprobado ? '✅' : '❌',
                    duration: 6000
                });
                obtenerVehiculos();
            };

            socket.on("vehicle_change_processed", handleProcessed);
            return () => socket.off("vehicle_change_processed", handleProcessed);
        }
    }, [socket, obtenerVehiculos]);

    const handleAbrirSolicitud = () => {
        const v = vehiculos.length > 0 ? vehiculos[0] : null;
        if (v) {
            setFormDataSolicitud({
                marca: v.marca || '',
                modelo: v.modelo || '',
                placa: v.placa || '',
                capacidad: v.capacidad || ''
            });
        }
        setMensajeSolicitud({ tipo: '', texto: '' });
        setShowSolicitudModal(true);
    };

    const enviarSolicitudCambio = async (e) => {
        e.preventDefault();
        const v = vehiculos.length > 0 ? vehiculos[0] : null;
        if (!v) return;

        try {
            setEnviandoSolicitud(true);
            setMensajeSolicitud({ tipo: '', texto: '' });

            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/vehiculos/${v.idVehiculos}/solicitar-cambio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formDataSolicitud)
            });

            if (response.ok) {
                setMensajeSolicitud({
                    tipo: 'success',
                    texto: 'Tu solicitud ha sido enviada al administrador. Recibirás una notificación cuando sea revisada.'
                });
                setTimeout(() => setShowSolicitudModal(false), 3000);
            } else {
                const err = await response.json();
                setMensajeSolicitud({ tipo: 'danger', texto: err.error || 'Error al enviar la solicitud' });
            }
        } catch (error) {
            setMensajeSolicitud({ tipo: 'danger', texto: 'Error de conexión con el servidor' });
        } finally {
            setEnviandoSolicitud(false);
        }
    };

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

            <Navbar transparent={true}/>


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
                        <div className="d-flex align-items-center gap-3">
                            <div className="text-end me-3 d-none d-md-block">
                                <span className="small text-uppercase fw-bold text-muted d-block">Ganancias {periodo}</span>
                                <h3 className="fw-bold mb-0" style={{ color: brandColor }}>${Number(statsAvanzadas.ganancias.total).toLocaleString()}</h3>
                            </div>
                            <div className="bg-light p-1 rounded-3 d-flex gap-1 border">
                                <Badge
                                    bg={periodo === 'diario' ? 'primary' : 'light'}
                                    text={periodo === 'diario' ? 'white' : 'dark'}
                                    className="cursor-pointer py-2 px-3"
                                    onClick={() => setPeriodo('diario')}
                                    style={{ cursor: 'pointer', backgroundColor: periodo === 'diario' ? brandColor : '' }}
                                >Día</Badge>
                                <Badge
                                    bg={periodo === 'mensual' ? 'primary' : 'light'}
                                    text={periodo === 'mensual' ? 'white' : 'dark'}
                                    className="cursor-pointer py-2 px-3"
                                    onClick={() => setPeriodo('mensual')}
                                    style={{ cursor: 'pointer', backgroundColor: periodo === 'mensual' ? brandColor : '' }}
                                >Mes</Badge>
                                <Badge
                                    bg={periodo === 'anual' ? 'primary' : 'light'}
                                    text={periodo === 'anual' ? 'white' : 'dark'}
                                    className="cursor-pointer py-2 px-3"
                                    onClick={() => setPeriodo('anual')}
                                    style={{ cursor: 'pointer', backgroundColor: periodo === 'anual' ? brandColor : '' }}
                                >Año</Badge>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Nuevas tarjetas de analíticas */}
                <Row className="g-4 mb-4">
                    <Col xs={12} sm={6} lg={3}>
                        <Card style={{ ...cardStyle, borderBottom: `4px solid ${brandColor}` }}>
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '50px', height: '50px', backgroundColor: `${brandColor}15`, color: brandColor }}>
                                    <FaWallet size={20} />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0 small">Ganancias</h6>
                                    <h4 className="fw-bold mb-0">${Number(statsAvanzadas.ganancias.total).toLocaleString()}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card style={{ ...cardStyle, borderBottom: '4px solid #3b82f6' }}>
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '50px', height: '50px', backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                                    <FaClock size={20} />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0 small">Tiempo en Línea</h6>
                                    <h4 className="fw-bold mb-0">{statsAvanzadas.tiempoEnLinea.totalHoras}h</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card style={{ ...cardStyle, borderBottom: '4px solid #10b981' }}>
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '50px', height: '50px', backgroundColor: '#d1fae5', color: '#10b981' }}>
                                    <FaCheckCircle size={20} />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0 small">Viajes Finalizados</h6>
                                    <h4 className="fw-bold mb-0">{statsAvanzadas.resumenViajes.total}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card style={{ ...cardStyle, borderBottom: '4px solid #f59e0b' }}>
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '50px', height: '50px', backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                                    <FaRoute size={20} />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0 small">Ruta Principal</h6>
                                    <h4 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
                                        {statsAvanzadas.rutasFrecuentes[0]?.name || 'N/A'}
                                    </h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4 mb-4">
                    <Col lg={8}>
                        <Card style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">Tendencia de Ganancias</h5>
                                    <Badge bg="light" text="dark" className="border">Historial {periodo}</Badge>
                                </div>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={statsAvanzadas.ganancias.historial}>
                                            <defs>
                                                <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={brandColor} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke={brandColor} fillOpacity={1} fill="url(#colorGanancias)" name="Ganancias ($)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card style={cardStyle}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Horas en Línea</h5>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statsAvanzadas.tiempoEnLinea.historial}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Horas" barSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className="g-4 mb-4">
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
                                    <div className="d-flex flex-column gap-2 mt-3">
                                        <Button
                                            variant="outline-primary"
                                            className="w-100 fw-semibold rounded-pill py-2"
                                            style={{ borderColor: brandColor, color: brandColor }}
                                            onClick={handleAbrirSolicitud}
                                        >
                                            Solicitar Cambio de Datos
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="p-0 text-decoration-none fw-semibold small shadow-none"
                                            style={{ color: '#666' }}
                                            onClick={() => navigate("/vehicle-registration")}
                                        >
                                            Registrar Otro Vehículo
                                            <FaArrowRight size={12} className="ms-1" style={{ color: brandColor }} />
                                        </Button>
                                    </div>
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
                                                <ListGroup.Item 
                                                    key={viaje.idViajes} 
                                                    className="px-0 border-0 py-3" 
                                                    style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setViajeSeleccionado(viaje);
                                                        setShowDetalleViaje(true);
                                                    }}
                                                >
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
                                                        <Col xs={3}>
                                                            <p className="mb-0 fw-semibold" style={{ color: '#333' }}>Viaje #{viaje.idViajes}</p>
                                                            <small className="text-muted">
                                                                {formatearFecha(viaje.fechaHoraSalida)}
                                                            </small>
                                                        </Col>
                                                        <Col xs={4}>
                                                            <div className="d-flex align-items-center">
                                                                <FaRoute size={12} color={brandColor} className="me-1" />
                                                                <small className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                    {viaje.ruta?.nombre || 'Ruta no disponible'}
                                                                </small>
                                                            </div>
                                                        </Col>
                                                        <Col xs={2}>
                                                            <small className="text-muted">
                                                                {viaje.cuposTotales - viaje.cuposDisponibles}/{viaje.cuposTotales} pasajeros
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

            {/* Modal de Historial Completo con Búsqueda */}
            <Modal show={showHistorialCompleto} onHide={() => setShowHistorialCompleto(false)} size="xl" centered>
                <Modal.Header closeButton style={{ borderBottom: 'none', padding: '1.5rem 1.5rem 0.5rem' }}>
                    <Modal.Title className="fw-semibold" style={{ color: brandColor }}>
                        <FaHistory className="me-2" /> Historial Completo de Viajes
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem 1.5rem' }}>
                    
                    {/* Barra de búsqueda y filtros */}
                    <Row className="mb-4 g-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'white', borderColor: '#e0e0e0' }}>
                                    <FaSearch color={brandColor} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por # de viaje o nombre de ruta..."
                                    value={busquedaViajes}
                                    onChange={(e) => setBusquedaViajes(e.target.value)}
                                    style={{ borderColor: '#e0e0e0' }}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'white', borderColor: '#e0e0e0' }}>
                                    <FaFilter color={brandColor} />
                                </InputGroup.Text>
                                <Form.Select
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                    style={{ borderColor: '#e0e0e0' }}
                                >
                                    <option value="TODOS">Todos los estados</option>
                                    <option value="FINALIZADO">Completados</option>
                                    <option value="EN_CURSO">En curso</option>
                                    <option value="CANCELADO">Cancelados</option>
                                    <option value="PUBLICADO">Publicados</option>
                                    <option value="CREADO">Creados</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={2} className="text-end">
                            <Badge bg="light" text="dark" className="p-3" style={{ fontSize: '0.9rem' }}>
                                {viajesFiltrados.length} viajes
                            </Badge>
                        </Col>
                    </Row>

                    {viajesFiltrados.length === 0 ? (
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
                            <p className="text-muted">No se encontraron viajes con los filtros seleccionados</p>
                            <Button
                                variant="link"
                                onClick={() => {
                                    setBusquedaViajes('');
                                    setFiltroEstado('TODOS');
                                }}
                                style={{ color: brandColor }}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {viajesFiltrados.map((viaje) => (
                                <ListGroup.Item 
                                    key={viaje.idViajes} 
                                    className="py-3 border-0" 
                                    style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                                    onClick={() => {
                                        setViajeSeleccionado(viaje);
                                        setShowDetalleViaje(true);
                                    }}
                                >
                                    <Row className="align-items-center">
                                        <Col xs={1} className="text-center">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                backgroundColor: `${brandColor}10`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FaCar size={20} color={brandColor} />
                                            </div>
                                        </Col>
                                        <Col xs={2}>
                                            <p className="mb-0 fw-semibold" style={{ color: '#333' }}>Viaje #{viaje.idViajes}</p>
                                            <small className="text-muted">
                                                {formatearFecha(viaje.fechaHoraSalida)}
                                            </small>
                                        </Col>
                                        <Col xs={3}>
                                            <div className="d-flex align-items-center">
                                                <FaRoute size={12} color={brandColor} className="me-1" />
                                                <small className="fw-semibold">Ruta:</small>
                                                <span className="ms-2 text-muted small">{viaje.ruta?.nombre || 'No disponible'}</span>
                                            </div>
                                        </Col>
                                        <Col xs={2}>
                                            <small className="text-muted">
                                                {viaje.cuposTotales - viaje.cuposDisponibles}/{viaje.cuposTotales} pasajeros
                                            </small>
                                        </Col>
                                        <Col xs={2}>
                                            <small className="text-muted d-block">
                                                <FaClock className="me-1" size={10} />
                                                {Math.round((viaje.cuposTotales - viaje.cuposDisponibles) * 100 / viaje.cuposTotales)}% ocupado
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

            {/* Modal de Detalle de Viaje */}
            <Modal show={showDetalleViaje} onHide={() => setShowDetalleViaje(false)} size="lg" centered>
                <Modal.Header closeButton style={{ background: `linear-gradient(135deg, ${brandColor}20, white)`, borderBottom: 'none', padding: '1.5rem' }}>
                    <Modal.Title className="fw-semibold" style={{ color: '#333' }}>
                        <FaCar className="me-2" style={{ color: brandColor }} /> Detalle del Viaje #{viajeSeleccionado?.idViajes}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {viajeSeleccionado && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Card style={{ backgroundColor: '#F9FAFB', border: 'none', borderRadius: '16px' }}>
                                        <Card.Body>
                                            <h6 className="fw-bold mb-3" style={{ color: brandColor }}>Información General</h6>
                                            <ListGroup variant="flush">
                                                <ListGroup.Item className="d-flex justify-content-between px-0 border-0 bg-transparent">
                                                    <span className="text-muted">Fecha y hora:</span>
                                                    <span className="fw-semibold">{formatearFecha(viajeSeleccionado.fechaHoraSalida)}</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between px-0 border-0 bg-transparent">
                                                    <span className="text-muted">Estado:</span>
                                                    <Badge bg={getEstadoColor(viajeSeleccionado.estado)} className="rounded-pill px-3 py-2">
                                                        {getEstadoTexto(viajeSeleccionado.estado)}
                                                    </Badge>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between px-0 border-0 bg-transparent">
                                                    <span className="text-muted">Capacidad:</span>
                                                    <span className="fw-semibold">{viajeSeleccionado.cuposTotales} pasajeros</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between px-0 border-0 bg-transparent">
                                                    <span className="text-muted">Ocupación:</span>
                                                    <span className="fw-semibold">
                                                        {viajeSeleccionado.cuposTotales - viajeSeleccionado.cuposDisponibles} / {viajeSeleccionado.cuposTotales}
                                                        ({Math.round((viajeSeleccionado.cuposTotales - viajeSeleccionado.cuposDisponibles) * 100 / viajeSeleccionado.cuposTotales)}%)
                                                    </span>
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card style={{ backgroundColor: '#F9FAFB', border: 'none', borderRadius: '16px' }}>
                                        <Card.Body>
                                            <h6 className="fw-bold mb-3" style={{ color: brandColor }}>Ruta del Viaje</h6>
                                            <ListGroup variant="flush">
                                                {viajeSeleccionado.ruta?.nombre && (
                                                    <ListGroup.Item className="d-flex px-0 border-0 bg-transparent">
                                                        <FaRoute size={14} color="#3b82f6" className="me-2 mt-1" />
                                                        <div>
                                                            <span className="text-muted">Ruta:</span>
                                                            <span className="fw-semibold d-block">{viajeSeleccionado.ruta.nombre}</span>
                                                        </div>
                                                    </ListGroup.Item>
                                                )}
                                                {viajeSeleccionado.ruta?.descripcion && (
                                                    <ListGroup.Item className="d-flex px-0 border-0 bg-transparent">
                                                        <FaInfoCircle size={14} color="#666" className="me-2 mt-1" />
                                                        <div>
                                                            <span className="text-muted">Descripción:</span>
                                                            <span className="d-block">{viajeSeleccionado.ruta.descripcion}</span>
                                                        </div>
                                                    </ListGroup.Item>
                                                )}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {viajeSeleccionado.ruta?.paradas && viajeSeleccionado.ruta.paradas.length > 0 && (
                                <Card style={{ backgroundColor: '#F9FAFB', border: 'none', borderRadius: '16px' }}>
                                    <Card.Body>
                                        <h6 className="fw-bold mb-3" style={{ color: brandColor }}>Paradas del Recorrido</h6>
                                        <ListGroup variant="flush">
                                            {viajeSeleccionado.ruta.paradas
                                                .sort((a, b) => a.orden - b.orden)
                                                .map((parada, index) => (
                                                    <ListGroup.Item key={parada.idParada} className="d-flex align-items-center px-0 border-0 bg-transparent">
                                                        <div style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            backgroundColor: index === 0 ? brandColor : index === viajeSeleccionado.ruta.paradas.length - 1 ? '#f59e0b' : '#e0e0e0',
                                                            color: index === 0 || index === viajeSeleccionado.ruta.paradas.length - 1 ? 'white' : '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '12px',
                                                            marginRight: '12px'
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <span className="fw-semibold">{parada.nombre || `Parada ${parada.orden}`}</span>
                                                            {parada.tipo && (
                                                                <Badge bg="light" text="dark" className="ms-2" style={{ fontSize: '10px' }}>
                                                                    {parada.tipo}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '1rem 1.5rem 1.5rem' }}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowDetalleViaje(false)}
                        className="rounded-pill px-4"
                        style={{ borderColor: '#e0e0e0', color: '#666' }}
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

            {/* Modal de Solicitud de Cambio de Vehículo */}
            <Modal show={showSolicitudModal} onHide={() => !enviandoSolicitud && setShowSolicitudModal(false)} centered>
                <Modal.Header closeButton={!enviandoSolicitud} className="border-0 pb-0">
                    <Modal.Title className="fw-bold" style={{ color: '#333' }}>
                        Solicitar Cambio de Vehículo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <p className="text-muted small mb-4">
                        Completa los nuevos datos. Tu solicitud será revisada por un administrador antes de aplicarse.
                    </p>

                    {mensajeSolicitud.texto && (
                        <Alert variant={mensajeSolicitud.tipo} className="py-2 small">
                            {mensajeSolicitud.texto}
                        </Alert>
                    )}

                    <form onSubmit={enviarSolicitudCambio}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Marca</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formDataSolicitud.marca}
                                onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, marca: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Modelo</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formDataSolicitud.modelo}
                                onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, modelo: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Placa</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formDataSolicitud.placa}
                                onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, placa: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">Capacidad (Pasajeros)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formDataSolicitud.capacidad}
                                onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, capacidad: e.target.value })}
                                required
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <Button
                                variant="light"
                                className="w-100 fw-semibold py-2 rounded-pill"
                                onClick={() => setShowSolicitudModal(false)}
                                disabled={enviandoSolicitud}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="w-100 fw-semibold py-2 rounded-pill border-0"
                                style={{ backgroundColor: brandColor, color: 'white' }}
                                disabled={enviandoSolicitud}
                            >
                                {enviandoSolicitud ? <Spinner animation="border" size="sm" /> : "Enviar Solicitud"}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default DriverHome;