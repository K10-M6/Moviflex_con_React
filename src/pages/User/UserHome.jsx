import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaChartLine, FaRoute, FaWallet } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";

const UserHome = () => {
    const { usuario } = useAuth();
    
    const backgrounds = [
        "https://mitsubishi-motors.com.co/blog/wp-content/uploads/2023/08/Viaje-de-carretera-en-carro.jpg",
        "https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2017/05/si-te-gusta-viajar-en-coche-esta-es-tu-ruta-759x500.jpg",
        "https://cdn.buttercms.com/NYZzPM4kTIyVmfDwT3RK"
    ];

    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [backgrounds.length]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            position: 'relative', 
            overflow: 'hidden',
            backgroundColor: '#124c83' 
        }}>
            {/* Capa de fondo con transición de Fade */}
            {backgrounds.map((bg, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'opacity 1.5s ease-in-out',
                        opacity: currentBg === index ? 1 : 0,
                        zIndex: 0
                    }}
                />
            ))}

            {/* Contenido principal */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                
                {/* --- NAVBAR CON COLOR SÓLIDO --- */}
                <div style={{ backgroundColor: '#124c83a4', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    <Navbar />
                </div>

                <Container className="py-5"> 
                    <Row className="align-items-center" style={{ minHeight: '80vh' }}>
                        
                        {/* Lado Izquierdo: Bienvenida */}
                        <Col lg={5} className="text-white mb-4 mb-lg-0">
                            <div style={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.85)', // Un poco más sólido para legibilidad
                                padding: '40px', 
                                borderRadius: '20px', 
                                color: '#0c0c0c',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                            }}>
                                <h1 className="fw-bold m-0 text-dark">
                                    ¡Bienvenido, <br/>
                                    <span style={{ color: '#124c83' }}>{usuario?.nombre}!</span> 
                                </h1>
                                <p className="mt-3 text-muted fw-semibold">
                                    Qué gusto verte de nuevo. Aquí tienes un resumen de tu actividad.
                                </p>
                            </div>
                        </Col>

                        {/* Lado Derecho: Tarjetas */}
                        <Col lg={7}>
                            <Row className="g-3">
                                <Col xs={12} md={6}>
                                    <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px' }}>
                                        <Card.Body>
                                            <div className="mb-3" style={{ fontSize: '2.5rem', color: '#000000' }}><FaChartLine /></div>
                                            <Card.Title className="fw-bold">Estadísticas</Card.Title>
                                            <Button variant="outline-primary" className="rounded-pill px-4 btn-sm fw-bold mt-2">Ver más</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                
                                <Col xs={12} md={6}>
                                    <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px' }}>
                                        <Card.Body>
                                            <div className="mb-3" style={{ fontSize: '2.5rem', color: '#000000' }}><FaRoute /></div>
                                            <Card.Title className="fw-bold">Mis Viajes</Card.Title>
                                            <Button variant="outline-primary" className="rounded-pill px-4 btn-sm fw-bold mt-2">Ver más</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12}>
                                    <Card className="shadow border-0 text-center py-3" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="d-flex align-items-center justify-content-around flex-wrap">
                                            <div>
                                                <div style={{ fontSize: '2rem', color: '#000000' }}><FaWallet /></div>
                                                <Card.Title className="fw-bold m-0">Pagos</Card.Title>
                                            </div>
                                            <div className="text-start">
                                                <p className="text-muted m-0 small">Saldo disponible</p>
                                                <h4 className="fw-bold">$00.00</h4>
                                            </div>
                                            <Button variant="outline-success" className="rounded-pill px-4 fw-bold">Recargar</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default UserHome;