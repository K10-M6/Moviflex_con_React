import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { FaUser, FaRoute, FaWallet, FaHistory, FaStar, FaCalendarAlt, FaArrowRight, FaChartLine, FaSearch, FaFilter, FaClock } from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import imagencontacto from "../Imagenes/AutoresContacto.png";

// Componentes personalizados
const EstadoViajeBadge = ({ estado }) => {
    const estilos = {
        FINALIZADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        COMPLETADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        EN_CURSO: { backgroundColor: '#113d69', color: '#ffffff' },
        CANCELADO: { backgroundColor: '#cccbd2af', color: '#113d69' },
        RESERVADO: { backgroundColor: '#cccbd2af', color: '#113d69' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    const getTexto = () => {
        switch(estado) {
            case 'FINALIZADO':
            case 'COMPLETADO': return 'Completado';
            case 'EN_CURSO': return 'En curso';
            case 'CANCELADO': return 'Cancelado';
            case 'RESERVADO': return 'Reservado';
            default: return estado || 'Desconocido';
        }
    };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {getTexto()}
        </span>
    );
};

const PagoBadge = ({ estado }) => {
    const estilos = {
        PAGADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        PENDIENTE: { backgroundColor: '#cccbd2af', color: '#113d69' },
        FALLIDO: { backgroundColor: '#113d69', color: '#ffffff' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.7rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {estado || 'N/A'}
        </span>
    );
};

const StatsBadge = ({ children, bgColor, color, isWhite = false }) => {
    if (isWhite) {
        return (
            <span style={{
                backgroundColor: '#ffffff',
                color: '#62d8d9',
                border: '1px solid #62d8d9',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {children}
            </span>
        );
    }

    return (
        <span style={{
            backgroundColor: bgColor,
            color: color,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
};

const PeriodoBadge = ({ periodo, actual, onClick, children }) => {
    const isActive = periodo === actual;
    return (
        <span
            onClick={onClick}
            style={{
                cursor: 'pointer',
                backgroundColor: isActive ? '#62d8d9' : 'transparent',
                color: isActive ? '#ffffff' : '#113d69',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-block',
                transition: 'all 0.2s'
            }}
        >
            {children}
        </span>
    );
};

const AccionButton = ({ variant, onClick, children, disabled, style }) => {
    const getButtonStyle = () => {
        const baseStyle = {
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        };

        if (variant === 'outline-primary') {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#62d8d9',
                borderColor: '#62d8d9'
            };
        } else if (variant === 'primary') {
            return {
                ...baseStyle,
                backgroundColor: '#62d8d9',
                color: '#ffffff',
                borderColor: '#62d8d9'
            };
        } else if (variant === 'outline-secondary') {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#113d69',
                borderColor: '#113d69'
            };
        } else if (variant === 'secondary') {
            return {
                ...baseStyle,
                backgroundColor: '#113d69',
                color: '#ffffff',
                borderColor: '#113d69'
            };
        } else if (variant === 'link') {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#113d69',
                border: 'none',
                textDecoration: 'none'
            };
        }
        return baseStyle;
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ ...getButtonStyle(), ...style }}
        >
            {children}
        </button>
    );
};

const cardStyle = {
    background: "#ffffff",
    borderRadius: '1rem',
    border: 'none',
    boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.02)",
    overflow: "hidden"
};

const UserHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    const brandColor = "#113d69"; // Azul oscuro
    const accentColor = "#62d8d9"; // Verde turquesa

    const [viajesRecientes, setViajesRecientes] = useState([]);
    const [todosLosViajes, setTodosLosViajes] = useState([]);
    const [showViajesModal, setShowViajesModal] = useState(false);
    const [cargandoViajes, setCargandoViajes] = useState(false);
    const [errorViajes, setErrorViajes] = useState("");
    const [pagosRecientes, setPagosRecientes] = useState([]);
    const [cargandoPagos, setCargandoPagos] = useState(false);
    const [errorPagos, setErrorPagos] = useState("");
    
    // Estados para filtros de viajes
    const [busquedaViajes, setBusquedaViajes] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
    const [showDetalleViaje, setShowDetalleViaje] = useState(false);

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
                    const totalGastado = viajesData
                        .filter(v => v.estado === 'COMPLETADO' || v.estado === 'FINALIZADO')
                        .reduce((sum, v) => sum + Number(v.precioFinal || 0), 0);

                    // Las estadísticas estáticas ya no son necesarias si todo es dinámico,
                    // pero las mantenemos por si se usan en otro lado sin filtro temporal.
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
                    `${API_URL}/pagos/usuario/`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setPagosRecientes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error al cargar pagos:", error);
                setErrorPagos("Error al cargar pagos");
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

    // Función para filtrar viajes (igual que en DriverHome)
    const filtrarViajes = (viajes) => {
        return viajes.filter(viaje => {
            const textoBusqueda = busquedaViajes.toLowerCase();
            const coincideBusqueda = textoBusqueda === '' ||
                viaje.idViajes.toString().includes(textoBusqueda) ||
                (viaje.ruta?.nombre?.toLowerCase().includes(textoBusqueda));

            const coincideEstado = filtroEstado === 'TODOS' || viaje.estado === filtroEstado;

            return coincideBusqueda && coincideEstado;
        });
    };

    const viajesFiltrados = filtrarViajes(todosLosViajes);

    // --- CÁLCULO DE FRECUENCIA EN EL FRONTEND ---
    const agruparFrecuencia = (viajesLista, periodoActual) => {
        const gruposF = {};

        viajesLista.forEach(v => {
            const fecha = new Date(v.fechaHoraSalida || v.creadoEn || new Date());
            let key;
            if (periodoActual === 'diario') {
                key = `${fecha.getHours()}:00`;
            } else if (periodoActual === 'mensual') {
                key = `Día ${fecha.getDate()}`;
            } else if (periodoActual === 'anual') {
                const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                key = meses[fecha.getMonth()];
            }
            gruposF[key] = (gruposF[key] || 0) + 1;
        });

        return {
            frecuencia: Object.entries(gruposF).map(([name, value]) => ({ name, value }))
        };
    };

    const ahora = new Date();
    let fechaInicioFiltro;
    if (periodo === 'diario') {
        fechaInicioFiltro = new Date(ahora.setHours(0, 0, 0, 0));
    } else if (periodo === 'mensual') {
        fechaInicioFiltro = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    } else if (periodo === 'anual') {
        fechaInicioFiltro = new Date(ahora.getFullYear(), 0, 1);
    }

    const viajesCompletadosPorPeriodo = todosLosViajes.filter(v => 
        (v.estado === 'FINALIZADO' || v.estado === 'COMPLETADO' || v.estado === 'CONFIRMADO') && 
        new Date(v.fechaHoraSalida || v.creadoEn) >= fechaInicioFiltro
    );

    const agrupadosFrecuencia = agruparFrecuencia(viajesCompletadosPorPeriodo, periodo);
    
    // --- ESTADÍSTICAS DEL RESUMEN POR PERIODO ---
    const viajesTotalesPorPeriodo = todosLosViajes.filter(v => 
        new Date(v.fechaHoraSalida || v.creadoEn) >= fechaInicioFiltro
    );
    const completadosPeriodo = viajesTotalesPorPeriodo.filter(v => v.estado === 'COMPLETADO' || v.estado === 'FINALIZADO' || v.estado === 'CONFIRMADO').length;
    const canceladosPeriodo = viajesTotalesPorPeriodo.filter(v => v.estado === 'CANCELADO').length;
    // --------------------------------------------

    // --- CÁLCULO DE GASTOS CONFIRMADOS EN EL FRONTEND ---
    let gastoTotalCalculado = 0;
    const gruposG = {};

    // Asumimos que un viaje COMPLETADO o FINALIZADO o CONFIRMADO representa un gasto real
    viajesCompletadosPorPeriodo.forEach(v => {
        gastoTotalCalculado += Number(v.precioFinal || 0);

        const fecha = new Date(v.fechaHoraSalida || v.creadoEn || new Date());
        let key;
        if (periodo === 'diario') {
            key = `${fecha.getHours()}:00`;
        } else if (periodo === 'mensual') {
            key = `Día ${fecha.getDate()}`;
        } else if (periodo === 'anual') {
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            key = meses[fecha.getMonth()];
        }
        gruposG[key] = (gruposG[key] || 0) + Number(v.precioFinal || 0);
    });

    const displayGastos = {
        total: gastoTotalCalculado,
        historial: Object.entries(gruposG).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    };

    const displayFrecuencia = {
        historial: agrupadosFrecuencia.frecuencia
    };

    const displayPagosRecientes = pagosRecientes && pagosRecientes.length > 0 
        ? pagosRecientes 
        : todosLosViajes
            .filter(v => v.estado === 'FINALIZADO' || v.estado === 'COMPLETADO')
            .map(v => ({
                idPago: `viaje-${v.idViajes}`,
                tipoPago: 'Pago de Viaje',
                fechaPago: v.fechaHoraSalida || v.creadoEn,
                monto: v.precioFinal || 0,
                estado: 'PAGADO'
            })).slice(0, 3);
    // -----------------------------------------------------------

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
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar transparent={true} />

                <Container className="py-5">
                    {/* Tarjeta de bienvenida */}
                    <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontWeight: 'bold', margin: 0, color: brandColor }}>
                                    ¡Hola, <span style={{ color: accentColor }}>{usuario?.nombre?.split(' ')[0] || 'Usuario'}</span>!
                                </h2>
                                <p style={{ color: '#6c757d', margin: 0 }}>Gestiona tus viajes y pagos en MoviFlex</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ textAlign: 'right', marginRight: '1rem', display: 'none', '@media (minWidth: 768px)': { display: 'block' } }}>
                                    <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 'bold', color: '#6c757d', display: 'block' }}>Gastado {periodo}</span>
                                    <h3 style={{ fontWeight: 'bold', margin: 0, color: accentColor }}>
                                        {formatearMoneda(displayGastos.total)}
                                    </h3>
                                </div>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '0.375rem', display: 'flex', gap: '0.25rem', border: '1px solid #dee2e6' }}>
                                    <PeriodoBadge periodo="diario" actual={periodo} onClick={() => setPeriodo('diario')}>Día</PeriodoBadge>
                                    <PeriodoBadge periodo="mensual" actual={periodo} onClick={() => setPeriodo('mensual')}>Mes</PeriodoBadge>
                                    <PeriodoBadge periodo="anual" actual={periodo} onClick={() => setPeriodo('anual')}>Año</PeriodoBadge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Gráfico de hábitos de gasto */}
                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaChartLine size={20} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                        <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Hábitos de Gasto</h5>
                                    </div>
                                    <StatsBadge bgColor="#f8f9fa" color="#113d69">Tendencia {periodo}</StatsBadge>
                                </div>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={displayGastos.historial}>
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
                            </div>
                        </div>

                        {/* Frecuencia de Viajes */}
                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaHistory size={20} style={{ color: brandColor, marginRight: '0.5rem' }} />
                                        <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Frecuencia de Viajes</h5>
                                    </div>
                                    <StatsBadge bgColor="#f8f9fa" color="#113d69">Viajes {periodo}</StatsBadge>
                                </div>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={displayFrecuencia.historial}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="value" fill={brandColor} radius={[4, 4, 0, 0]} name="Viajes" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mi Actividad Resumen y Pagos Recientes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Mi Actividad Resumen */}
                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <FaUser size={22} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Resumen de Actividad</h5>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: accentColor }}>{formatearMoneda(gastoTotalCalculado)}</h4>
                                        <small style={{ color: '#6c757d', fontWeight: 'bold' }}>Total Gastado</small>
                                    </div>
                                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: brandColor }}>{viajesTotalesPorPeriodo.length}</h4>
                                        <small style={{ color: '#6c757d' }}>Viajes Totales</small>
                                    </div>
                                    <div 
                                        style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center', cursor: 'pointer' }}
                                        onClick={() => setShowViajesModal(true)}
                                    >
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: brandColor }}>{completadosPeriodo}</h4>
                                        <small style={{ color: '#6c757d', fontWeight: 'bold' }}>Completados</small>
                                    </div>
                                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: '#6c757d' }}>{canceladosPeriodo}</h4>
                                        <small style={{ color: '#6c757d' }}>Cancelados</small>
                                    </div>
                                </div>
        
                            </div>
                        </div>

                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <FaWallet size={22} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Pagos Recientes</h5>
                                </div>
                                
                                {cargandoPagos ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <Spinner size="sm" style={{ color: accentColor }} />
                                    </div>
                                ) : displayPagosRecientes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <p style={{ color: '#6c757d' }}>No hay pagos recientes</p>
                                    </div>
                                ) : (
                                    <div style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                        {displayPagosRecientes.slice(0, 3).map((pago) => (
                                            <div key={pago.idPago} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem 0',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor }}>{pago.tipoPago || 'Viaje'}</div>
                                                    <small style={{ color: '#6c757d' }}>{new Date(pago.fechaPago).toLocaleDateString()}</small>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: accentColor }}>{formatearMoneda(pago.monto)}</div>
                                                    <PagoBadge estado={pago.estado} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Viajes Recientes */}
                    <div style={{ ...cardStyle }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FaHistory size={24} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Viajes Recientes</h5>
                                </div>
                                <AccionButton
                                    variant="link"
                                    onClick={() => setShowViajesModal(true)}
                                    style={{ color: brandColor, fontWeight: 'bold' }}
                                >
                                    Ver Todos
                                </AccionButton>
                            </div>

                            {cargandoViajes ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Spinner animation="border" style={{ color: accentColor }} />
                                </div>
                            ) : errorViajes ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p style={{ color: '#dc3545' }}>{errorViajes}</p>
                                    <AccionButton variant="outline-secondary" onClick={() => window.location.reload()}>
                                        Reintentar
                                    </AccionButton>
                                </div>
                            ) : viajesRecientes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#F3F4F6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <FaHistory size={24} style={{ color: '#6c757d' }} />
                                    </div>
                                    <p style={{ color: '#6c757d', marginBottom: 0 }}>No hay viajes recientes</p>
                                </div>
                            ) : (
                                <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {viajesRecientes.map((viaje) => (
                                        <div
                                            key={viaje.idViajes}
                                            style={{
                                                padding: '0.75rem 0',
                                                borderBottom: '1px solid #F3F4F6',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setViajeSeleccionado(viaje);
                                                setShowDetalleViaje(true);
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '8.33%', textAlign: 'center' }}>
                                                    <FaRoute size={20} color={accentColor} />
                                                </div>
                                                <div style={{ width: '41.67%' }}>
                                                    <p style={{ marginBottom: 0, fontWeight: 'bold', color: brandColor }}>
                                                        A {viaje.ruta?.nombre || viaje.destino || "Destino"}
                                                    </p>
                                                    <small style={{ color: '#6c757d' }}>
                                                        {formatearFecha(viaje.fechaHoraSalida)}
                                                    </small>
                                                </div>
                                                <div style={{ width: '25%', fontWeight: 'bold', color: accentColor }}>
                                                    {formatearMoneda(viaje.precioFinal)}
                                                </div>
                                                <div style={{ width: '25%', textAlign: 'right' }}>
                                                    <EstadoViajeBadge estado={viaje.estado} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            {/* Modal de Historial Completo (igual que en DriverHome) */}
            {showViajesModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050
                }} onClick={() => setShowViajesModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '1200px',
                        width: '95%',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '1.5rem 1.5rem 0.5rem',
                            borderBottom: 'none'
                        }}>
                            <h5 style={{ fontWeight: '600', color: accentColor }}>
                                <FaHistory style={{ marginRight: '0.5rem' }} /> Mis Viajes
                            </h5>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            backgroundColor: 'white',
                                            padding: '0.375rem 0.75rem',
                                            border: `1px solid ${accentColor}`,
                                            borderRadius: '0.375rem 0 0 0.375rem'
                                        }}>
                                            <FaSearch color={accentColor} />
                                        </span>
                                        <input
                                            placeholder="Buscar por # de viaje o nombre de ruta..."
                                            value={busquedaViajes}
                                            onChange={(e) => setBusquedaViajes(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.375rem 0.75rem',
                                                border: `1px solid ${accentColor}`,
                                                borderLeft: 'none',
                                                borderRadius: '0 0.375rem 0.375rem 0'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            backgroundColor: 'white',
                                            padding: '0.375rem 0.75rem',
                                            border: `1px solid ${brandColor}`,
                                            borderRadius: '0.375rem 0 0 0.375rem'
                                        }}>
                                            <FaFilter color={brandColor} />
                                        </span>
                                        <select
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.375rem 0.75rem',
                                                border: `1px solid ${brandColor}`,
                                                borderLeft: 'none',
                                                borderRadius: '0 0.375rem 0.375rem 0'
                                            }}
                                        >
                                            <option value="TODOS">Todos los estados</option>
                                            <option value="FINALIZADO">Completados</option>
                                            <option value="COMPLETADO">Completados</option>
                                            <option value="EN_CURSO">En curso</option>
                                            <option value="CANCELADO">Cancelados</option>
                                            <option value="RESERVADO">Reservados</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <StatsBadge bgColor={accentColor} color="#ffffff">
                                        {viajesFiltrados.length} viajes
                                    </StatsBadge>
                                </div>
                            </div>

                            {viajesFiltrados.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#F3F4F6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <FaHistory size={24} style={{ color: accentColor }} />
                                    </div>
                                    <p style={{ color: '#6c757d' }}>No se encontraron viajes con los filtros seleccionados</p>
                                    <button
                                        onClick={() => {
                                            setBusquedaViajes('');
                                            setFiltroEstado('TODOS');
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: accentColor,
                                            textDecoration: 'underline',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            ) : (
                                <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {viajesFiltrados.map((viaje) => (
                                        <div
                                            key={viaje.idViajes}
                                            style={{
                                                padding: '0.75rem 0',
                                                borderBottom: '1px solid #F3F4F6',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setViajeSeleccionado(viaje);
                                                setShowDetalleViaje(true);
                                                setShowViajesModal(false);
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '8.33%', textAlign: 'center' }}>
                                                    <FaRoute size={20} color={accentColor} />
                                                </div>
                                                <div style={{ width: '16.67%' }}>
                                                    <p style={{ marginBottom: 0, fontWeight: '600', color: brandColor }}>Viaje #{viaje.idViajes}</p>
                                                    <small style={{ color: '#6c757d' }}>
                                                        {formatearFecha(viaje.fechaHoraSalida)}
                                                    </small>
                                                </div>
                                                <div style={{ width: '25%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <FaRoute size={12} color={accentColor} style={{ marginRight: '0.25rem' }} />
                                                        <small style={{ fontWeight: '600', color: brandColor }}>Ruta:</small>
                                                        <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>{viaje.ruta?.nombre || 'No disponible'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ width: '16.67%', fontWeight: 'bold', color: accentColor }}>
                                                    {formatearMoneda(viaje.precioFinal)}
                                                </div>
                                                <div style={{ width: '16.67%' }}>
                                                    <small style={{ color: '#6c757d', display: 'flex', alignItems: 'center' }}>
                                                        <FaClock style={{ marginRight: '0.25rem' }} size={10} />
                                                        {viaje.cuposTotales ? `${viaje.cuposTotales - (viaje.cuposDisponibles || 0)}/${viaje.cuposTotales} pasajeros` : 'N/A'}
                                                    </small>
                                                </div>
                                                <div style={{ width: '16.67%', textAlign: 'right' }}>
                                                    <EstadoViajeBadge estado={viaje.estado} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '0.5rem 1.5rem 1.5rem', borderTop: 'none' }}>
                            <AccionButton
                                variant="outline-secondary"
                                onClick={() => setShowViajesModal(false)}
                            >
                                Cerrar
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle de Viaje */}
            {showDetalleViaje && viajeSeleccionado && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1060
                }} onClick={() => setShowDetalleViaje(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            background: `linear-gradient(135deg, ${accentColor}20, white)`,
                            borderBottom: `2px solid ${accentColor}`,
                            padding: '1.5rem'
                        }}>
                            <h5 style={{ fontWeight: '600', color: brandColor }}>
                                <FaRoute style={{ marginRight: '0.5rem', color: accentColor }} /> Detalle del Viaje #{viajeSeleccionado.idViajes}
                            </h5>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid ${accentColor}20`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: accentColor }}>Información General</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none' }}>
                                                <span style={{ color: '#6c757d' }}>Fecha y hora:</span>
                                                <span style={{ fontWeight: '600', color: brandColor }}>{formatearFecha(viajeSeleccionado.fechaHoraSalida)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none' }}>
                                                <span style={{ color: '#6c757d' }}>Estado:</span>
                                                <EstadoViajeBadge estado={viajeSeleccionado.estado} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none' }}>
                                                <span style={{ color: '#6c757d' }}>Precio:</span>
                                                <span style={{ fontWeight: '600', color: accentColor }}>{formatearMoneda(viajeSeleccionado.precioFinal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid ${brandColor}20`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: brandColor }}>Ruta del Viaje</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {viajeSeleccionado.ruta?.nombre && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none' }}>
                                                    <FaRoute size={14} color={accentColor} style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} />
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Ruta:</span>
                                                        <span style={{ fontWeight: '600', display: 'block', color: brandColor }}>{viajeSeleccionado.ruta.nombre}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: 'none' }}>
                            <AccionButton
                                variant="outline-secondary"
                                onClick={() => setShowDetalleViaje(false)}
                            >
                                Cerrar
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserHome;