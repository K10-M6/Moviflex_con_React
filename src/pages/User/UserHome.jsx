import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaChartLine, FaRoute, FaWallet } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";

const UserHome = () => {
    const { usuario } = useAuth();
    return (
        <div style={{ background: 'linear-gradient(20deg, #EDE7FF 30%, #a385ff 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container className="py-5 flex-grow-1 d-flex flex-column justify-content-center">
                <div className="text-center mb-5 text-white">
                    <h1 className="fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>¡Hola, {usuario?.nombre}! 👋</h1>
                    <p className="lead">Tu viaje seguro comienza aquí.</p>
                </div>
                <Row className="justify-content-center g-4">
                    <Col xs={12} md={4} lg={3}>
                        <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px' }}>
                            <Card.Body>
                                <div className="mb-3" style={{ fontSize: '2.5rem', color: '#a385ff' }}><FaChartLine /></div>
                                <Card.Title className="fw-bold">Estadísticas</Card.Title>
                                <p className="text-muted small">Ahorro acumulado: $50</p>
                                <Button variant="outline-primary" className="rounded-pill px-4 btn-sm fw-bold">Ver más</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px' }}>
                            <Card.Body>
                                <div className="mb-3" style={{ fontSize: '2.5rem', color: '#a385ff' }}><FaRoute /></div>
                                <Card.Title className="fw-bold">Mis Viajes</Card.Title>
                                <p className="text-muted small">Tienes 1 viaje hoy</p>
                                <Button style={{ backgroundColor: "#a385ff", border: 'none' }} className="rounded-pill px-4 btn-sm fw-bold text-white">Ver ruta</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px' }}>
                            <Card.Body>
                                <div className="mb-3" style={{ fontSize: '2.5rem', color: '#a385ff' }}><FaWallet /></div>
                                <Card.Title className="fw-bold">Pagos</Card.Title>
                                <p className="text-muted small">Saldo: $25.00</p>
                                <Button variant="outline-success" className="rounded-pill px-4 btn-sm fw-bold">Recargar</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
export default UserHome;
