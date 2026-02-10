import React from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup } from "react-bootstrap";
import { FaCar, FaIdCard, FaHistory } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";

const DriverHome = () => {
    const { usuario } = useAuth();
    return (
        <div style={{ background: 'linear-gradient(20deg, #EDE7FF 30%, #a385ff 100%)', minHeight: '100vh' }}>
            <Navbar />
            <Container className="py-5">
                <Card className="shadow border-0 mb-4 bg-white text-dark" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-0" style={{ color: '#6f42c1' }}>Panel de Conductor</h2>
                            <p className="text-muted mb-0">Gestiona tu actividad diaria</p>
                        </div>
                        <div className="text-end">
                            <span className="small text-muted d-block">Ganancias hoy</span>
                            <h3 className="fw-bold text-success mb-0">$128.50</h3>
                        </div>
                    </Card.Body>
                </Card>
                <Row className="g-4">
                    <Col lg={7}>
                        <Card className="shadow border-0 h-100" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4 text-primary">
                                    <FaCar size={24} className="me-2" />
                                    <h5 className="mb-0 fw-bold">Vehículo Activo</h5>
                                </div>
                                <Row className="align-items-center">
                                    <Col xs={4} className="text-center">
                                        <div className="p-3 bg-light rounded-circle d-inline-block" style={{fontSize: '2rem'}}>🚘</div>
                                    </Col>
                                    <Col xs={8}>
                                        <p className="mb-1"><strong>Toyota Corolla 2022</strong></p>
                                        <p className="mb-1 text-muted">Placa: ABC-1234</p>
                                        <Badge bg="success" className="px-3 rounded-pill">Verificado</Badge>
                                    </Col>
                                </Row>
                                <Button variant="link" className="mt-4 p-0 text-decoration-none fw-bold" style={{ color: '#a385ff' }}>Actualizar datos</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={5}>
                        <Card className="shadow border-0 h-100" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4 text-primary">
                                    <FaIdCard size={24} className="me-2" />
                                    <h5 className="mb-0 fw-bold">Documentación</h5>
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 mb-2">
                                        Licencia <Badge bg="success" className="rounded-pill">Válida</Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0">
                                        SOAT <Badge bg="success" className="rounded-pill">Válido</Badge>
                                    </ListGroup.Item>
                                </ListGroup>
                                <Button variant="dark" className="w-100 mt-3 rounded-pill fw-bold" style={{ background: '#2D3436', border: 'none' }}>Subir Documentos</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
export default DriverHome;
