import React from "react";
import { Container, Row, Col, Card, Image, Button, Badge } from "react-bootstrap";
import { FaUserEdit, FaStar, FaShieldAlt } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";

const DriverProfile = () => {
    const { usuario } = useAuth();
    return (
        <div style={{ background: 'linear-gradient(20deg, #EDE7FF 30%, #a385ff 100%)', minHeight: '100vh' }}>
            <Navbar />
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="shadow border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                            <div style={{ height: '120px', background: 'linear-gradient(90deg, #a385ff, #8a65ff)' }}></div>
                            <Card.Body className="text-center" style={{ marginTop: '-60px' }}>
                                <Image src="https://via.placeholder.com" roundedCircle border="5" className="bg-white mb-3 shadow" />
                                <h3 className="fw-bold">{usuario?.nombre}</h3>
                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    <Badge bg="warning" text="dark" className="px-3 rounded-pill"><FaStar /> 4.9</Badge>
                                    <Badge bg="info" className="px-3 rounded-pill text-white"><FaShieldAlt /> Conductor Verificado</Badge>
                                </div>
                                <hr className="my-4" />
                                <Row className="text-start px-3">
                                    <Col xs={6} className="mb-3">
                                        <small className="text-muted d-block">CORREO</small>
                                        <span className="fw-bold">{usuario?.email}</span>
                                    </Col>
                                    <Col xs={6} className="mb-3">
                                        <small className="text-muted d-block">TELÉFONO</small>
                                        <span className="fw-bold">{usuario?.telefono}</span>
                                    </Col>
                                </Row>
                                <Button className="w-100 mt-4 rounded-pill py-2 border-0 fw-bold" style={{ background: 'linear-gradient(135deg, #a385ff, #8a65ff)' }}>
                                    <FaUserEdit /> Editar Perfil
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
export default DriverProfile;
