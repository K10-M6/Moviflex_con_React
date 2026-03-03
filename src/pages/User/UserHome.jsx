import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup } from "react-bootstrap";
import { FaUser, FaRoute, FaWallet, FaHistory, FaStar, FaCalendarAlt, FaArrowRight, FaChartLine, FaSuitcase } from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import imagencontacto from "../Imagenes/AutoresContacto.png";

const UserHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();
    const brandColor = "#56bca7";
    const darkBorder = "#1a1a1a";

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.85)",
        borderRadius: '16px',
        border: `1.5px solid ${darkBorder}`,
        boxShadow: "4px 4px 0px rgba(0,0,0,0.08)",
        overflow: "hidden"
    };

    // ... (Mantengo todos tus estados y useEffects intactos)
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

    // Nuevos estados para analíticas de pasajero
    const [statsAvanzadas, setStatsAvanzadas] = useState({
        gastos: { total: 0, historial: [] },
        frecuencia: { total: 0, historial: [] }
    });
    const [periodo, setPeriodo] = useState('mensual');
    const [cargandoStats, setCargandoStats] = useState(false);

    useEffect(() => {
        const obtenerViajes = async () => {
            if (!token || !usuario?.idUsuarios) {
                console.log("No hay token o usuario disponible");
                return;
            }

            try {
                setCargandoViajes(true);
                setErrorViajes("");

                console.log("Obteniendo viajes para usuario:", usuario.idUsuarios);

                const respuesta = await fetch(
                    `https://backendmovi-production-c657.up.railway.app/api/viajes/mis-viajes`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("Respuesta status:", respuesta.status);

                if (respuesta.ok) {
                    const data = await respuesta.json();
                    console.log("Viajes recibidos:", data);

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

                } else if (respuesta.status === 404) {
                    console.log("No se encontraron viajes");
                    setViajesRecientes([]);
                    setEstadisticas({
                        totalViajes: 0,
                        viajesCompletados: 0,
                        viajesCancelados: 0,
                        totalGastado: 0
                    });
                } else {
                    const errorText = await respuesta.text();
                    console.log("Error response:", errorText);
                    setErrorViajes(`Error ${respuesta.status}: No se pudieron cargar los viajes`);
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
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    const pagosData = Array.isArray(data) ? data : [];
                    setPagosRecientes(pagosData);
                }
            } catch (error) {
                setErrorPagos("Error al cargar pagos");
            } finally {
                setCargandoPagos(false);
            }
        };
        obtenerPagos();
    }, [token, usuario?.idUsuarios]);

    // Función para traer estadísticas avanzadas (gastos y frecuencia)
    const traerEstadisticasPasajero = async () => {
        if (!token) return;
        try {
            setCargandoStats(true);
            const headers = { "Authorization": "Bearer " + token };

            // Reutilizamos el endpoint de ganancias como 'gastos' para el pasajero
            // Y el de viajes como frecuencia
            const [resGastos, resViajes] = await Promise.all([
                fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/ganancias?periodo=${periodo}`, { headers }),
                fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/online-time?periodo=${periodo}`, { headers }) // Usamos online-time como ejemplo activo o viajes
            ]);

            const nuevasStats = { ...statsAvanzadas };

            if (resGastos.ok) nuevasStats.gastos = await resGastos.json();

            // Para frecuencia de viajes, el backend tiene un endpoint de resumen
            const resResumen = await fetch(`https://backendmovi-production-c657.up.railway.app/api/estadisticas/viajes`, { headers });
            if (resResumen.ok) nuevasStats.frecuencia = await resResumen.json();

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
            case 'COMPLETADO': return 'success';
            case 'CANCELADO': return 'danger';
            case 'RESERVADO': return 'info';
            case 'EN_CURSO': return 'warning';
            default: return 'secondary';
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 'COMPLETADO': return 'Completado';
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ backgroundColor: brandColor, borderBottom: `1.5px solid ${darkBorder}`, zIndex: 10 }}>
                <Navbar />
            </div>
            <div style={{
                flex: 1,
                backgroundImage: `url(${imagencontacto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                position: 'relative',
                padding: '40px 0'
            }}>

                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    zIndex: 1
                }} />

                <Container style={{ position: 'relative', zIndex: 2 }}>
                    <Card className="mb-4" style={cardStyle}>
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-0" style={{ color: darkBorder }}>
                                    ¡Bienvenido, <span style={{ color: brandColor }}>{usuario?.nombre?.split(' ')[0] || 'Usuario'}</span>!
                                </h2>
                                <p className="text-muted mb-0">Explora y gestiona tus viajes como pasajero</p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="text-end d-none d-md-block">
                                    <span className="small text-uppercase fw-bold text-muted d-block">Gastado {periodo}</span>
                                    <h3 className="fw-bold mb-0" style={{ color: brandColor }}>
                                        {formatearMoneda(statsAvanzadas.gastos.total)}
                                    </h3>
                                </div>
                                <div className="bg-light p-1 rounded-3 d-flex gap-1 border">
                                    <Badge
                                        bg={periodo === 'diario' ? 'primary' : 'light'}
                                        text={periodo === 'diario' ? 'white' : 'dark'}
                                        onClick={() => setPeriodo('diario')}
                                        style={{ cursor: 'pointer', backgroundColor: periodo === 'diario' ? brandColor : '' }}
                                    >Día</Badge>
                                    <Badge
                                        bg={periodo === 'mensual' ? 'primary' : 'light'}
                                        text={periodo === 'mensual' ? 'white' : 'dark'}
                                        onClick={() => setPeriodo('mensual')}
                                        style={{ cursor: 'pointer', backgroundColor: periodo === 'mensual' ? brandColor : '' }}
                                    >Mes</Badge>
                                    <Badge
                                        bg={periodo === 'anual' ? 'primary' : 'light'}
                                        text={periodo === 'anual' ? 'white' : 'dark'}
                                        onClick={() => setPeriodo('anual')}
                                        style={{ cursor: 'pointer', backgroundColor: periodo === 'anual' ? brandColor : '' }}
                                    >Año</Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Row className="g-4 mt-2 mb-4">
                        <Col lg={12}>
                            <Card style={cardStyle}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="d-flex align-items-center">
                                            <FaChartLine size={20} style={{ color: brandColor }} className="me-2" />
                                            <h5 className="mb-0 fw-bold" style={{ color: darkBorder }}>Hábitos de Gasto</h5>
                                        </div>
                                        <Badge bg="light" text="dark" className="border">Gastos en el tiempo ({periodo})</Badge>
                                    </div>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={statsAvanzadas.gastos.historial}>
                                                <defs>
                                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={brandColor} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="value" stroke={brandColor} fillOpacity={1} fill="url(#colorGastos)" name="Gastado ($)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="g-4 mb-4">
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
                                        <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: brandColor }} /></div>
                                    ) : (
                                        <ListGroup variant="flush" className="mb-auto">
                                            {pagosRecientes.slice(0, 4).map((pago) => (
                                                <ListGroup.Item key={pago.idPago} className="d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom">
                                                    <div>
                                                        <div className="fw-bold small">{pago.tipoPago || 'Pago de viaje'}</div>
                                                        <small className="text-muted">{formatearFecha(pago.fechaPago)}</small>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="fw-bold" style={{ color: brandColor }}>{formatearMoneda(pago.monto)}</div>
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

                    <Row>
                        <Col lg={12}>
                            <Card style={cardStyle}>
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center" style={{ color: brandColor }}>
                                            <FaHistory size={24} className="me-2" />
                                            <h5 className="mb-0 fw-bold">Viajes Recientes</h5>
                                        </div>
                                    </div>
                                    <ListGroup variant="flush">
                                        {viajesRecientes.map((viaje) => (
                                            <ListGroup.Item key={viaje.idViajes} className="px-0 bg-transparent">
                                                <Row className="align-items-center">
                                                    <Col xs={1}><FaRoute size={20} color={brandColor} /></Col>
                                                    <Col xs={4}>
                                                        <p className="mb-0 fw-bold">Viaje a {viaje.destino}</p>
                                                        <small className="text-muted">{formatearFecha(viaje.fechaHoraSalida)}</small>
                                                    </Col>
                                                    <Col xs={3} className="fw-bold" style={{ color: brandColor }}>{formatearMoneda(viaje.precioFinal)}</Col>
                                                    <Col xs={4} className="text-end">
                                                        <Badge bg={getEstadoColor(viaje.estado)} className="rounded-pill">
                                                            {getEstadoTexto(viaje.estado)}
                                                        </Badge>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div >
        </div >
    );
};

export default UserHome;