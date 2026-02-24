import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal } from "react-bootstrap";
import { FaCar, FaIdCard, FaInfoCircle, FaWallet, FaArrowRight, FaFileAlt } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DriverHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    // Paleta de colores elegante
    const brandColor = "#56bca7";
    const darkBorder = "#1a1a1a";

    // --- LÓGICA DE FONDO OPTIMIZADA (CROSS-FADE REAL) ---
    const backgroundImages = [
        "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=2070",
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2070",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=2070"
    ];

    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        }, 6000); // Cambia imagen cada 6 segundos
        return () => clearInterval(timer);
    }, []);

    // Estilos de los contenedores elegantes
    const cardStyle = {
        background: "rgba(255, 255, 255, 0.95)", // Levemente traslúcido para integrarse con el fondo
        borderRadius: '16px',
        border: `1.5px solid ${darkBorder}`,
        boxShadow: "4px 4px 0px rgba(0,0,0,0.08)", // Sombra plana minimalista
        overflow: "hidden"
    };

    // --- ESTADO Y LÓGICA DE DATOS ---
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [vehiculos, setVehiculos] = useState([]);
    const [cargandoVehiculo, setCargandoVehiculo] = useState(true);
    const [errorVehiculo, setErrorVehiculo] = useState("");

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem("tutorial_conductor_visto");
        if (!hasSeenTutorial) setShowTutorial(true);
    }, []);

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

    // Estilos de los pasos del tutorial
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

    const vehiculoPrincipal = vehiculos.length > 0 ? vehiculos[0] : null;

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            
            {/* CAPAS DE FONDO PARA EL CROSS-FADE */}
            {backgroundImages.map((img, i) => (
                <div
                    key={i}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: -1,
                        opacity: bgIndex === i ? 0.35 : 0, // Ajusta 0.35 si quieres más o menos visibilidad del fondo
                        transition: 'opacity 2s ease-in-out',
                        backgroundColor: '#f4f4f4' // Fondo sólido detrás de las imágenes
                    }}
                />
            ))}
            
            {/* NAVBAR */}
            <div style={{ backgroundColor: brandColor, borderBottom: `1.5px solid ${darkBorder}`, position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>
            
            <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
                {/* TARJETA DE BIENVENIDA */}
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
                    {/* TARJETA DE VEHÍCULO */}
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
                    
                    {/* TARJETA DE DOCUMENTACIÓN */}
                    <Col lg={5}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="d-flex align-items-center mb-4">
                                    <FaIdCard size={22} style={{ color: brandColor }} className="me-2" />
                                    <h5 className="mb-0 fw-bold" style={{ color: darkBorder }}>Documentación</h5>
                                </div>
                                <ListGroup variant="flush" className="mb-auto">
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                        <span className="text-muted">Licencia de conducción</span>
                                        <Badge style={{ backgroundColor: brandColor, color: 'white', border: `1px solid ${darkBorder}` }}>Válida</Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 bg-transparent border-0">
                                        <span className="text-muted">SOAT Vigente</span>
                                        <Badge style={{ backgroundColor: brandColor, color: 'white', border: `1px solid ${darkBorder}` }}>Válido</Badge>
                                    </ListGroup.Item>
                                </ListGroup>
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
            </Container>

            {/* MODAL DEL TUTORIAL INTERACTIVO */}
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