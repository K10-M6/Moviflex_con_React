import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaChartLine, FaRoute, FaWallet } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";

const UserHome = () => {
    const { usuario } = useAuth();

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f4f3f1',
            position: 'relative', 
            overflow: 'hidden'
        }}>
            {/* Contenido principal */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                
                {/* NAVBAR CON COLOR SÓLIDO */}
                <div style={{ backgroundColor: '#070707', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    <Navbar />
                </div>

                <Container className="py-5"> 
                    <Row className="align-items-center" style={{ minHeight: '80vh' }}>
                        
                        {/* Lado Izquierdo: Bienvenida */}
                        <Col lg={5} className="text-white mb-4 mb-lg-0">
                            <div style={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                padding: '40px', 
                                borderRadius: '20px', 
                                color: '#0c0c0c',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                border: '1px solid #000000'
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
                                    <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px', border: '1px solid #000000' }}>
                                        <Card.Body>
                                            <div className="mb-3" style={{ fontSize: '2.5rem', color: '#000000' }}><FaChartLine /></div>
                                            <Card.Title className="fw-bold">Estadísticas</Card.Title>
                                            <Button 
                                                variant="dark" 
                                                className="rounded-pill px-4 btn-sm fw-bold mt-2"
                                                style={{ backgroundColor: '#000000', borderColor: '#000000' }}
                                            >
                                                Ver más
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                
                                <Col xs={12} md={6}>
                                    <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px', border: '1px solid #000000' }}>
                                        <Card.Body>
                                            <div className="mb-3" style={{ fontSize: '2.5rem', color: '#000000' }}><FaRoute /></div>
                                            <Card.Title className="fw-bold">Mis Viajes</Card.Title>
                                            <Button 
                                                variant="dark" 
                                                className="rounded-pill px-4 btn-sm fw-bold mt-2"
                                                style={{ backgroundColor: '#000000', borderColor: '#000000' }}
                                            >
                                                Ver más
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12}>
                                    <Card className="shadow border-0 text-center py-3" style={{ borderRadius: '15px', border: '1px solid #000000' }}>
                                        <Card.Body className="d-flex align-items-center justify-content-around flex-wrap">
                                            <div>
                                                <div style={{ fontSize: '2rem', color: '#000000' }}><FaWallet /></div>
                                                <Card.Title className="fw-bold m-0">Pagos</Card.Title>
                                            </div>
                                            <div className="text-start">
                                                <p className="text-muted m-0 small">Saldo disponible</p>
                                                <h4 className="fw-bold">$00.00</h4>
                                            </div>
                                            <Button 
                                                variant="dark" 
                                                className="rounded-pill px-4 fw-bold"
                                                style={{ backgroundColor: '#000000', borderColor: '#000000' }}
                                            >
                                                Recargar
                                            </Button>
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