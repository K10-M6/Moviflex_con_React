import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup } from "react-bootstrap";
import { FaUser, FaRoute, FaWallet, FaHistory, FaStar, FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();
    const brandColor = "#56bca7";
    const darkBorder = "#1a1a1a";

    const backgroundImages = [
        "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=2070",
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2070",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=2070"
    ];

    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);
    const cardStyle = {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: '16px',
        border: `1.5px solid ${darkBorder}`,
        boxShadow: "4px 4px 0px rgba(0,0,0,0.08)",
        overflow: "hidden"
    };

    const [viajesRecientes, setViajesRecientes] = useState([]);
    const [cargandoViajes, setCargandoViajes] = useState(false);
    const [errorViajes, setErrorViajes] = useState("");

    const [pagosRecientes, setPagosRecientes] = useState([]);
    const [cargandoPagos, setCargandoPagos] = useState(false);
    const [errorPagos, setErrorPagos] = useState("");

    const [estadisticas, setEstadisticas] = useState({
        totalViajes: 0,
        viajesCompletados: 0,
        viajesCancelados: 0,
        totalGastado: 0
    });

    const [calificaciones, setCalificaciones] = useState({
        promedio: 0,
        total: 0
    });

    useEffect(() => {
        const obtenerViajes = async () => {
            if (!token || !usuario?.idUsuarios) return;
            
            try {
                setCargandoViajes(true);
                const respuesta = await fetch(
                    `https://backendmovi-production-c657.up.railway.app/api/usuario-viajes/mis-viajes?limit=5`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    console.log("Viajes de usuario:", data);
                    
                    const viajesData = Array.isArray(data) ? data : [];
                    setViajesRecientes(viajesData.slice(0, 3));
                    
                    const completados = viajesData.filter(v => v.estado === 'COMPLETADO').length;
                    const cancelados = viajesData.filter(v => v.estado === 'CANCELADO').length;
                    const totalGastado = viajesData.reduce((sum, v) => sum + (v.precioFinal || 0), 0);
                    
                    setEstadisticas({
                        totalViajes: viajesData.length,
                        viajesCompletados: completados,
                        viajesCancelados: cancelados,
                        totalGastado: totalGastado
                    });
                }
            } catch (error) {
                console.error("Error al obtener viajes:", error);
                setErrorViajes("Error al cargar viajes");
            } finally {
                setCargandoViajes(false);
            }
        };

        obtenerViajes();
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerPagos = async () => {
            if (!token || !usuario?.idUsuarios) return;
            
            try {
                setCargandoPagos(true);
                const respuesta = await fetch(
                    `https://backendmovi-production-c657.up.railway.app/api/pagos/usuario/`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    console.log("Pagos de usuario:", data);
                    
                    const pagosData = Array.isArray(data) ? data : [];
                    setPagosRecientes(pagosData);
                }
            } catch (error) {
                console.error("Error al obtener pagos:", error);
                setErrorPagos("Error al cargar pagos");
            } finally {
                setCargandoPagos(false);
            }
        };

        obtenerPagos();
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerCalificaciones = async () => {
            if (!token || !usuario?.idUsuarios) return;
            
            try {
                const respuesta = await fetch(
                    `https://backendmovi-production-c657.up.railway.app/api/`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    const calificacionesData = Array.isArray(data) ? data : [];
                    
                    if (calificacionesData.length > 0) {
                        const suma = calificacionesData.reduce((acc, c) => acc + c.puntuacion, 0);
                        setCalificaciones({
                            promedio: suma / calificacionesData.length,
                            total: calificacionesData.length
                        });
                    }
                }
            } catch (error) {
                console.error("Error al obtener calificaciones:", error);
            }
        };

        obtenerCalificaciones();
    }, [token, usuario?.idUsuarios]);

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'COMPLETADO': return 'success';
            case 'CANCELADO': return 'danger';
            case 'RESERVADO': return 'info';
            case 'EN_CURSO': return 'warning';
            default: return 'secondary';
        }
    };

    const getEstadoTexto = (estado) => {
        switch(estado) {
            case 'COMPLETADO': return 'Completado';
            case 'CANCELADO': return 'Cancelado';
            case 'RESERVADO': return 'Reservado';
            case 'EN_CURSO': return 'En curso';
            default: return estado || 'Desconocido';
        }
    };

    const getPagoEstadoColor = (estado) => {
        switch(estado) {
            case 'PAGADO': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'FALLIDO': return 'danger';
            default: return 'secondary';
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

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor || 0);
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

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
                        opacity: bgIndex === i ? 0.35 : 0,
                        transition: 'opacity 2s ease-in-out',
                        backgroundColor: '#f4f4f4'
                    }}
                />
            ))}
  
            <div style={{ backgroundColor: brandColor, borderBottom: `1.5px solid ${darkBorder}`, position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>
            
            <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
                <Card className="mb-4" style={cardStyle}>
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-0" style={{ color: darkBorder }}>
                                ¡Bienvenido, <span style={{ color: brandColor }}>{usuario?.nombre?.split(' ')[0] || 'Usuario'}</span>!
                            </h2>
                            <p className="text-muted mb-0">Explora y gestiona tus viajes como pasajero</p>
                        </div>
                        <div className="text-end">
                            <span className="small text-uppercase fw-bold text-muted d-block">Total Gastado</span>
                            <h3 className="fw-bold mb-0" style={{ color: brandColor }}>
                                {formatearMoneda(estadisticas.totalGastado)}
                            </h3>
                        </div>
                    </Card.Body>
                </Card>

                <Row className="g-4">
                    <Col lg={7}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <FaUser size={22} style={{ color: brandColor }} className="me-2" />
                                    <h5 className="mb-0 fw-bold" style={{ color: darkBorder }}>Mi Actividad</h5>
                                </div>
                                
                                <Row className="g-3">
                                    <Col xs={6}>
                                        <div className="p-3 rounded-3 text-center" style={{ border: `1.5px solid ${darkBorder}`, backgroundColor: '#fff' }}>
                                            <h3 className="fw-bold mb-0" style={{ color: brandColor }}>{estadisticas.totalViajes}</h3>
                                            <small className="text-muted">Viajes totales</small>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="p-3 rounded-3 text-center" style={{ border: `1.5px solid ${darkBorder}`, backgroundColor: '#fff' }}>
                                            <h3 className="fw-bold mb-0" style={{ color: brandColor }}>{estadisticas.viajesCompletados}</h3>
                                            <small className="text-muted">Completados</small>
                                        </div>
                                    </Col>
                                </Row>
                                
                                <Button 
                                    variant="link" 
                                    className="mt-4 p-0 text-decoration-none fw-bold small shadow-none" 
                                    style={{ color: darkBorder }}
                                    onClick={() => navigate(`/profile`)}
                                >
                                    VER PERFIL COMPLETO <FaArrowRight size={12} className="ms-1" style={{ color: brandColor }} />
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={5}>
                        <Card className="h-100" style={cardStyle}>
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="d-flex align-items-center mb-4">
                                    <FaWallet size={22} style={{ color: brandColor }} className="me-2" />
                                    <h5 className="mb-0 fw-bold" style={{ color: darkBorder }}>Pagos Recientes</h5>
                                </div>
                                
                                {cargandoPagos ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm" style={{ color: brandColor }} />
                                    </div>
                                ) : errorPagos ? (
                                    <p className="text-danger small">{errorPagos}</p>
                                ) : pagosRecientes.length === 0 ? (
                                    <div className="text-center py-4">
                                        <FaWallet size={30} className="text-muted mb-2 opacity-50" />
                                        <p className="text-muted small">No hay pagos recientes</p>
                                    </div>
                                ) : (
                                    <ListGroup variant="flush" className="mb-auto">
                                        {pagosRecientes.map((pago) => (
                                            <ListGroup.Item key={pago.idPago} className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                                <div>
                                                    <div className="fw-bold small">{pago.tipoPago || 'Pago de viaje'}</div>
                                                    <small className="text-muted">{formatearFecha(pago.fechaPago)}</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold" style={{ color: brandColor }}>
                                                        {formatearMoneda(pago.monto)}
                                                    </div>
                                                    <Badge bg={getPagoEstadoColor(pago.estado)} className="rounded-pill" style={{ fontSize: '0.6rem' }}>
                                                        {pago.estado || 'PENDIENTE'}
                                                    </Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                
                                <Button 
                                    className="w-100 mt-4 fw-bold py-2 shadow-sm" 
                                    style={{ backgroundColor: darkBorder, color: 'white', border: 'none', borderRadius: '8px' }}
                                    onClick={() => navigate("/pagos")}
                                >
                                    VER TODOS LOS PAGOS
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col lg={12}>
                        <Card style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center" style={{ color: brandColor }}>
                                        <FaHistory size={24} className="me-2" />
                                        <h5 className="mb-0 fw-bold">Viajes Recientes</h5>
                                    </div>
                                    <Badge bg="info" className="rounded-pill">
                                        {estadisticas.viajesCompletados} completados
                                    </Badge>
                                </div>
                                
                                {cargandoViajes ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" style={{ color: brandColor }} />
                                    </div>
                                ) : errorViajes ? (
                                    <div className="text-center py-4">
                                        <p className="text-danger">{errorViajes}</p>
                                    </div>
                                ) : viajesRecientes.length === 0 ? (
                                    <div className="text-center py-4">
                                        <FaHistory size={30} className="text-muted mb-2" />
                                        <p className="text-muted">No hay viajes recientes</p>
                                    </div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {viajesRecientes.map((viaje) => (
                                            <ListGroup.Item key={viaje.idViajes} className="px-0">
                                                <Row className="align-items-center">
                                                    <Col xs={1} className="text-center">
                                                        <FaRoute size={20} color={brandColor} />
                                                    </Col>
                                                    <Col xs={4}>
                                                        <p className="mb-0 fw-bold">Viaje a {viaje.destino || 'destino'}</p>
                                                        <small className="text-muted">
                                                            {formatearFecha(viaje.fechaHoraSalida)}
                                                        </small>
                                                    </Col>
                                                    <Col xs={3}>
                                                        <small className="text-muted d-block">
                                                            {viaje.asientosReservados || 1} {viaje.asientosReservados === 1 ? 'pasajero' : 'pasajeros'}
                                                        </small>
                                                        {viaje.precioFinal && (
                                                            <small className="fw-bold" style={{ color: brandColor }}>
                                                                {formatearMoneda(viaje.precioFinal)}
                                                            </small>
                                                        )}
                                                    </Col>
                                                    <Col xs={4} className="text-end">
                                                        <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill me-2">
                                                            {getEstadoTexto(viaje.estado)}
                                                        </Badge>
                                                        {viaje.calificacion && (
                                                            <Badge bg="warning" className="rounded-pill">
                                                                <FaStar size={8} className="me-1" />{viaje.calificacion}
                                                            </Badge>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </div>
    );
};

export default UserHome;