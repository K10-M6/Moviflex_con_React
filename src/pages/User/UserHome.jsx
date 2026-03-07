import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal } from "react-bootstrap";
import { FaUser, FaRoute, FaWallet, FaHistory, FaStar, FaCalendarAlt, FaArrowRight, FaChartLine, FaSuitcase } from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import imagencontacto from "../Imagenes/AutoresContacto.png";

const UserHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    // Colores exactos del DriverProfile
    const brandColor = "#124c83"; // Azul oscuro del DriverProfile
    const accentColor = "#54c7b8"; // Verde turquesa de los botones
    const darkBorder = "#1a1a1a";

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: '16px',
        border: 'none',
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        overflow: "hidden"
    };

    const [viajesRecientes, setViajesRecientes] = useState([]);
    const [todosLosViajes, setTodosLosViajes] = useState([]);
    const [showViajesModal, setShowViajesModal] = useState(false);
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

    // Nuevos estados para analíticas de pasajero
    const [statsAvanzadas, setStatsAvanzadas] = useState({
        gastos: { total: 0, historial: [] },
        frecuencia: { total: 0, historial: [] }
    });
    const [periodo, setPeriodo] = useState('mensual');
    const [cargandoStats, setCargandoStats] = useState(false);

    useEffect(() => {
        const obtenerViajes = async () => {
            if (!token || !usuario?.idUsuarios) return;

            try {
                setCargandoViajes(true);
                const respuesta = await fetch(
                    `${API_URL}/viajes/mis-viajes`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );

                if (respuesta.ok) {
                    const data = await respuesta.json();
                    const viajesData = Array.isArray(data) ? data : [];
                    setTodosLosViajes(viajesData);
                    setViajesRecientes(viajesData.slice(0, 3));

                    const completados = viajesData.filter(v => v.estado === 'COMPLETADO' || v.estado === 'FINALIZADO').length;
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
                    `${API_URL}/pagos/usuario/`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setPagosRecientes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error al cargar pagos:", error);
            } finally {
                setCargandoPagos(false);
            }
        };
        obtenerPagos();
    }, [token, usuario?.idUsuarios]);

    const traerEstadisticasPasajero = async () => {
        if (!token) return;
        try {
            setCargandoStats(true);
            const headers = { "Authorization": "Bearer " + token };

            // Obtenemos gastos (Pagos) y frecuencia (Viajes historial)
            const [resGastos, resViajesHistory] = await Promise.all([
                fetch(`${API_URL}/estadisticas/ganancias?periodo=${periodo}`, { headers }),
                fetch(`${API_URL}/estadisticas/viajes?periodo=${periodo}`, { headers })
            ]);

            const nuevasStats = { ...statsAvanzadas };
            if (resGastos.ok) nuevasStats.gastos = await resGastos.json();
            if (resViajesHistory.ok) nuevasStats.frecuencia = await resViajesHistory.json();

            setStatsAvanzadas(nuevasStats);
        } catch (error) {
            console.error("Error al traer estadísticas del pasajero:", error);
        } finally {
            setCargandoStats(false);
        }
    };

    useEffect(() => {
        traerEstadisticasPasajero();
    }, [token, periodo]);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'COMPLETADO':
            case 'FINALIZADO': return 'success';
            case 'CANCELADO': return 'danger';
            case 'RESERVADO': return 'info';
            case 'EN_CURSO': return 'warning';
            default: return 'secondary';
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 'COMPLETADO':
            case 'FINALIZADO': return 'Completado';
            case 'CANCELADO': return 'Cancelado';
            case 'RESERVADO': return 'Reservado';
            case 'EN_CURSO': return 'En curso';
            default: return estado || 'Desconocido';
        }
    };

    const getPagoEstadoColor = (estado) => {
        switch (estado) {
            case 'PAGADO': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'FALLIDO': return 'danger';
            default: return 'secondary';
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        const date = new Date(fecha);
        return date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url(${imagencontacto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar transparent={true} />

                <Container className="py-5">
                    {/* Tarjeta de bienvenida */}
                    <Card className="mb-4 border-0 rounded-4 shadow">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-0" style={{ color: brandColor }}>
                                    ¡Hola, <span style={{ color: accentColor }}>{usuario?.nombre?.split(' ')[0] || 'Usuario'}</span>!
                                </h2>
                                <p className="text-muted mb-0">Gestiona tus viajes y pagos en MoviFlex</p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="text-end d-none d-md-block">
                                    <span className="small text-uppercase fw-bold text-muted d-block">Gastado {periodo}</span>
                                    <h3 className="fw-bold mb-0" style={{ color: accentColor }}>
                                        {formatearMoneda(statsAvanzadas.gastos.total)}
                                    </h3>
                                </div>
                                <div className="bg-light p-1 rounded-3 d-flex gap-1 border">
                                    <Badge
                                        bg={periodo === 'diario' ? 'primary' : 'light'}
                                        text={periodo === 'diario' ? 'white' : 'dark'}
                                        onClick={() => setPeriodo('diario')}
                                        style={{ cursor: 'pointer', backgroundColor: periodo === 'diario' ? accentColor : '', color: periodo === 'diario' ? 'white' : '#666' }}
                                        className="px-3 py-2"
                                    >Día</Badge>
                                    <Badge
                                        bg={periodo === 'mensual' ? 'primary' : 'light'}
                                        text={periodo === 'mensual' ? 'white' : 'dark'}
                                        onClick={() => setPeriodo('mensual')}
                                        style={{ cursor: 'pointer', backgroundColor: periodo === 'mensual' ? accentColor : '', color: periodo === 'mensual' ? 'white' : '#666' }}
                                        className="px-3 py-2"
                                    >Mes</Badge>
                                    <Badge
                                        bg={periodo === 'anual' ? 'primary' : 'light'}
                                        text={periodo === 'anual' ? 'white' : 'dark'}
                                        onClick={() => setPeriodo('anual')}
                                        style={{ cursor: 'pointer', backgroundColor: periodo === 'anual' ? accentColor : '', color: periodo === 'anual' ? 'white' : '#666' }}
                                        className="px-3 py-2"
                                    >Año</Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Row className="g-4 mb-4">
                        {/* Gráfico de hábitos de gasto */}
                        <Col lg={7}>
                            <Card className="border-0 rounded-4 shadow h-100">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="d-flex align-items-center">
                                            <FaChartLine size={20} style={{ color: accentColor }} className="me-2" />
                                            <h5 className="mb-0 fw-bold" style={{ color: brandColor }}>Hábitos de Gasto</h5>
                                        </div>
                                    </div>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={statsAvanzadas.gastos.historial}>
                                                <defs>
                                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="value" stroke={accentColor} fillOpacity={1} fill="url(#colorGastos)" name="Gastado ($)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Frecuencia de Viajes */}
                        <Col lg={5}>
                            <Card className="border-0 rounded-4 shadow h-100">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="d-flex align-items-center">
                                            <FaHistory size={20} style={{ color: brandColor }} className="me-2" />
                                            <h5 className="mb-0 fw-bold" style={{ color: brandColor }}>Frecuencia de Viajes</h5>
                                        </div>
                                    </div>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={statsAvanzadas.frecuencia.historial}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Bar dataKey="value" fill={brandColor} radius={[4, 4, 0, 0]} name="Viajes" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="g-4 mb-4">
                        {/* Mi Actividad Resumen */}
                        <Col lg={7}>
                            <Card className="border-0 rounded-4 shadow">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <FaUser size={22} style={{ color: accentColor }} className="me-2" />
                                        <h5 className="mb-0 fw-bold" style={{ color: brandColor }}>Resumen de Actividad</h5>
                                    </div>
                                    <Row className="g-3">
                                        <Col xs={4}>
                                            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                                                <h3 className="fw-bold mb-0" style={{ color: accentColor }}>{estadisticas.totalViajes}</h3>
                                                <small className="text-muted">Totales</small>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                                onClick={() => setShowViajesModal(true)}>
                                                <h3 className="fw-bold mb-0" style={{ color: brandColor }}>{estadisticas.viajesCompletados}</h3>
                                                <small className="text-muted fw-bold d-block mb-1">Completados</small>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                                                <h3 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{estadisticas.viajesCancelados}</h3>
                                                <small className="text-muted">Cancelados</small>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Button
                                        variant="link"
                                        className="mt-4 p-0 text-decoration-none fw-bold small shadow-none"
                                        style={{ color: brandColor }}
                                        onClick={() => navigate(`/profile`)}
                                    >
                                        CONFIGURAR PERFIL <FaArrowRight size={12} className="ms-1" style={{ color: accentColor }} />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Pagos Recientes */}
                        <Col lg={5}>
                            <Card className="border-0 rounded-4 shadow h-100">
                                <Card.Body className="p-4 d-flex flex-column">
                                    <div className="d-flex align-items-center mb-4">
                                        <FaWallet size={22} style={{ color: accentColor }} className="me-2" />
                                        <h5 className="mb-0 fw-bold" style={{ color: brandColor }}>Pagos Recientes</h5>
                                    </div>
                                    <ListGroup variant="flush">
                                        {pagosRecientes.slice(0, 3).map((pago) => (
                                            <ListGroup.Item key={pago.idPago} className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                                <div>
                                                    <div className="fw-bold small">{pago.tipoPago || 'Viaje'}</div>
                                                    <small className="text-muted">{new Date(pago.fechaPago).toLocaleDateString()}</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold" style={{ color: accentColor }}>{formatearMoneda(pago.monto)}</div>
                                                    <Badge bg={getPagoEstadoColor(pago.estado)} className="rounded-pill" style={{ fontSize: '0.6rem' }}>
                                                        {pago.estado}
                                                    </Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    <Button
                                        className="w-100 mt-auto border-0 fw-bold py-2 rounded-pill mt-3"
                                        style={{ backgroundColor: accentColor, color: 'white' }}
                                        onClick={() => navigate("/pagos")}
                                    >
                                        HISTORIAL DE PAGOS
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Viajes Recientes */}
                    <Card className="border-0 rounded-4 shadow">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center">
                                    <FaHistory size={24} style={{ color: accentColor }} className="me-2" />
                                    <h5 className="mb-0 fw-bold" style={{ color: brandColor }}>Viajes Recientes</h5>
                                </div>
                                <Button variant="link" style={{ color: brandColor }} className="fw-bold text-decoration-none shadow-none" onClick={() => setShowViajesModal(true)}>
                                    Ver Todos
                                </Button>
                            </div>
                            <ListGroup variant="flush">
                                {viajesRecientes.map((viaje) => (
                                    <ListGroup.Item key={viaje.idViajes} className="px-0 bg-transparent py-3">
                                        <Row className="align-items-center">
                                            <Col xs={1}><FaRoute size={20} color={accentColor} /></Col>
                                            <Col xs={4}>
                                                <p className="mb-0 fw-bold">A {viaje.ruta?.nombre || viaje.destino || "Destino"}</p>
                                                <small className="text-muted">{formatearFecha(viaje.fechaHoraSalida)}</small>
                                            </Col>
                                            <Col xs={3} className="fw-bold" style={{ color: accentColor }}>{formatearMoneda(viaje.precioFinal)}</Col>
                                            <Col xs={4} className="text-end">
                                                <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill px-3 py-2">
                                                    {getEstadoTexto(viaje.estado)}
                                                </Badge>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            <Modal show={showViajesModal} onHide={() => setShowViajesModal(false)} size="lg" centered>
                <Modal.Header closeButton style={{ background: brandColor, color: 'white' }}>
                    <Modal.Title><FaHistory className="me-2" /> Mis Viajes</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <ListGroup variant="flush">
                        {todosLosViajes.map((viaje) => (
                            <ListGroup.Item key={viaje.idViajes} className="px-0 py-3 border-bottom bg-transparent">
                                <Row className="align-items-center mx-2">
                                    <Col xs={1}><FaRoute size={20} color={accentColor} /></Col>
                                    <Col xs={5}>
                                        <p className="mb-0 fw-bold">{viaje.ruta?.nombre || "Viaje"}</p>
                                        <small className="text-muted">{formatearFecha(viaje.fechaHoraSalida)}</small>
                                    </Col>
                                    <Col xs={3} className="fw-bold" style={{ color: accentColor }}>{formatearMoneda(viaje.precioFinal)}</Col>
                                    <Col xs={3} className="text-end">
                                        <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill px-2 py-1">
                                            {getEstadoTexto(viaje.estado)}
                                        </Badge>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UserHome;