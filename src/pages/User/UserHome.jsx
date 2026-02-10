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
                    {.map((item, idx) => (
                        <Col key={idx} xs={12} md={4} lg={3}>
                            <Card className="shadow border-0 text-center h-100 py-3" style={{ borderRadius: '15px' }}>
                                <Card.Body>
                                    <div className="mb-3" style={{ fontSize: '2.5rem', color: '#a385ff' }}>{item.icon}</div>
                                    <Card.Title className="fw-bold">{item.title}</Card.Title>
                                    <p className="text-muted small">{item.text}</p>
                                    <Button 
                                        variant={item.variant} 
                                        className="rounded-pill px-4 btn-sm fw-bold"
                                        style={item.bg ? { backgroundColor: item.bg, border: 'none' } : {}}
                                    >
                                        {item.btn}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};
export default UserHome;
