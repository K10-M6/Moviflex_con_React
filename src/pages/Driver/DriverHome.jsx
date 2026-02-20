import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal } from "react-bootstrap";
import { FaCar, FaIdCard, FaInfoCircle, FaWallet, FaArrowRight, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DriverHome = () => {
    useAuth();
    const navigate = useNavigate();

    // Color Principal Solicitado
    const primaryBlue = "#124c83";

    // --- ESTADOS PARA EL TUTORIAL ---
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem("tutorial_conductor_visto");
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const manejarSiguiente = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            localStorage.setItem("tutorial_conductor_visto", "true");
            setShowTutorial(false);
            navigate("/documentacion"); 
        }
    };

    const manejarAtras = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const saltarTutorial = () => {
        localStorage.setItem("tutorial_conductor_visto", "true");
        setShowTutorial(false);
    };

    const repetirTutorial = () => {
        setCurrentStep(1);
        setShowTutorial(true);
    };

    // --- ESTILOS PERSONALIZADOS PARA EL STEPPER ---
    const stepCircleStyle = (stepNumber) => ({
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "1.2rem",
        zIndex: 2,
        transition: "all 0.3s ease",
        // Color sólido en lugar de degradado
        background: currentStep >= stepNumber ? primaryBlue : "#f8f9fa",
        color: currentStep >= stepNumber ? "#fff" : "#adb5bd",
        border: currentStep >= stepNumber ? "none" : "2px solid #dee2e6",
        boxShadow: currentStep === stepNumber ? `0 0 10px rgba(18, 76, 131, 0.3)` : "none"
    });

    const stepLineStyle = (stepNumber) => ({
        flex: 1,
        height: "4px",
        background: currentStep > stepNumber ? primaryBlue : "#e9ecef",
        margin: "0 -2px",
        zIndex: 1,
        transition: "all 0.3s ease"
    });

    return (
        // Fondo con color sólido #124c83
        <div style={{ backgroundColor: primaryBlue, minHeight: '100vh' }}>
            <Navbar />
            <Container className="py-5">
                
                {/* CABECERA PRINCIPAL */}
                <Card className="shadow border-0 mb-4 bg-white text-dark" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h2 className="fw-bold mb-0" style={{ color: primaryBlue }}>Panel de Conductor</h2>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="rounded-pill border-0 shadow-sm"
                                    onClick={repetirTutorial}
                                    style={{ background: '#f0f4f8', color: primaryBlue }}
                                >
                                    <FaInfoCircle className="me-1" /> Ayuda
                                </Button>
                            </div>
                            <p className="text-muted mb-0">Gestiona tu actividad diaria</p>
                        </div>
                        <div className="text-end">
                            <span className="small text-muted d-block">Ganancias hoy</span>
                            <h3 className="fw-bold text-success mb-0">$128.50</h3>
                        </div>
                    </Card.Body>
                </Card>

                {/* FILA DE CONTENIDO: VEHÍCULO Y DOCUMENTACIÓN */}
                <Row className="g-4">
                    <Col lg={7}>
                        <Card className="shadow border-0 h-100" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4" style={{ color: primaryBlue }}>
                                    <FaCar size={24} className="me-2" />
                                    <h5 className="mb-0 fw-bold">Vehículo Activo</h5>
                                </div>
                                <Row className="align-items-center">
                                    <Col xs={4} className="text-center">
                                        <div className="p-3 bg-light rounded-circle d-inline-block" style={{ fontSize: '2.5rem' }}>🚘</div>
                                    </Col>
                                    <Col xs={8}>
                                        <p className="mb-1"><strong>Modelo:</strong> Toyota Corolla 2022</p>
                                        <p className="mb-1"><strong>Placa:</strong> ABC-1234</p>
                                        <Badge bg="success" className="px-3 rounded-pill">Verificado</Badge>
                                    </Col>
                                </Row>
                                <Button variant="link" className="mt-4 p-0 text-decoration-none fw-bold" style={{ color: primaryBlue }}>Actualizar datos</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={5}>
                        <Card className="shadow border-0 mb-4" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4" style={{ color: primaryBlue }}>
                                    <FaIdCard size={24} className="me-2" />
                                    <h5 className="mb-0 fw-bold">Documentación</h5>
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                                        Licencia <Badge bg="success" className="rounded-pill">Válida</Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                                        SOAT <Badge bg="success" className="rounded-pill">Válido</Badge>
                                    </ListGroup.Item>
                                </ListGroup>
                                <Button 
                                    variant="dark" 
                                    className="w-100 mt-3 rounded-pill fw-bold" 
                                    style={{ background: '#2D3436' }}
                                    onClick={() => navigate("/documentacion")}
                                >
                                    Subir Documentos
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- MODAL DE TUTORIAL GRANDE CON STEPPER --- */}
            <Modal 
                show={showTutorial} 
                onHide={saltarTutorial} 
                centered 
                size="lg" 
                backdrop="static" 
                contentClassName="border-0 shadow-lg"
                style={{ borderRadius: '25px' }}
            >
                <Modal.Body className="p-5">
                    
                    {/* INDICADOR DE PASOS (STEPPER) */}
                    <div className="d-flex align-items-center justify-content-center mb-5">
                        <div style={stepCircleStyle(1)}>1</div>
                        <div style={stepLineStyle(1)}></div>
                        <div style={stepCircleStyle(2)}>2</div>
                        <div style={stepLineStyle(2)}></div>
                        <div style={stepCircleStyle(3)}>3</div>
                    </div>

                    {/* CONTENIDO SEGÚN EL PASO */}
                    <div className="text-center" style={{ minHeight: '300px' }}>
                        {currentStep === 1 && (
                            <div className="animate__animated animate__fadeIn">
                                <div className="p-4 bg-light rounded-circle d-inline-block mb-4">
                                    <FaWallet size={60} style={{ color: primaryBlue }} />
                                </div>
                                <h2 className="fw-bold mb-3">Tus Ganancias</h2>
                                <p className="text-muted fs-5">
                                    Monitorea tus ingresos diarios de forma transparente. 
                                    Verás el acumulado de tus viajes en tiempo real.
                                </p>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate__animated animate__fadeIn">
                                <div className="p-4 bg-light rounded-circle d-inline-block mb-4">
                                    <FaCar size={60} style={{ color: primaryBlue }} />
                                </div>
                                <h2 className="fw-bold mb-3">Vehículo Verificado</h2>
                                <p className="text-muted fs-5">
                                    Asegúrate de que los datos de tu vehículo sean los correctos. 
                                    Esto garantiza la seguridad de tus pasajeros y la tuya.
                                </p>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate__animated animate__fadeIn">
                                <div className="p-4 bg-light rounded-circle d-inline-block mb-4">
                                    <FaFileAlt size={60} style={{ color: primaryBlue }} />
                                </div>
                                <h2 className="fw-bold mb-3">Carga de Documentos</h2>
                                <p className="text-muted fs-5">
                                    ¡Último paso! Para activar tu cuenta, necesitamos validar tu documentación. 
                                    Te llevaremos a la sección de carga ahora mismo.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="mt-5 text-center">
                        <div className="d-flex gap-3 justify-content-center">
                            {currentStep > 1 && (
                                <Button 
                                    variant="light" 
                                    onClick={manejarAtras}
                                    className="rounded-pill px-4 fw-bold border"
                                >
                                    <FaArrowLeft className="me-2" /> Atrás
                                </Button>
                            )}
                            <Button 
                                className="px-5 py-2 fw-bold border-0 rounded-pill shadow"
                                style={{ 
                                    backgroundColor: primaryBlue, // Color sólido
                                    color: '#fff',
                                    fontSize: '1.1rem',
                                    minWidth: '200px'
                                }}
                                onClick={manejarSiguiente}
                            >
                                {currentStep === 3 ? "Ir a Documentos" : "Siguiente Paso"} <FaArrowRight className="ms-2" />
                            </Button>
                        </div>
                        <div className="mt-4">
                            <Button variant="link" className="text-muted text-decoration-none" onClick={saltarTutorial}>
                                Saltar recorrido
                            </Button>
                        </div>
                    </div>

                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DriverHome;