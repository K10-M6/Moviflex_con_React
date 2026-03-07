import React, { useState, useEffect } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Badge, Image, Button } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle, BsTruck, BsCarFrontFill, BsStarFill, BsStarHalf, BsStar, BsCircleFill, BsArrowRepeat, BsCashStack, BsGraphUp } from "react-icons/bs";
import { useSocket } from "../pages/context/SocketContext";
import { FaMedal, FaChartLine } from "react-icons/fa";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import fondo from "../pages/Imagenes/AutoresContacto.png";
import imagenDashboard from "../pages/Imagenes/HomeBaseImage.png";

function Home() {
  const { token, usuario } = useAuth();
  const { onlineUsers } = useSocket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalConductores: 0,
    totalViajeros: 0,
    totalVehiculos: 0
  });

  // Nuevos estados financieros para Admin
  const [statsFinancieras, setStatsFinancieras] = useState({
    ingresosPlataforma: { total: 0, historial: [] }
  });
  const [periodoAdmin, setPeriodoAdmin] = useState('mensual');

  const [chartData, setChartData] = useState([]);
  const [donutData, setDonutData] = useState([
    { name: 'Activos', value: 0, color: '#54c7b8' },
    { name: 'Inactivos', value: 0, color: '#ff6b6b' },
    { name: 'Suspendidos', value: 0, color: '#f59e0b' }
  ]);
  const [topConductores, setTopConductores] = useState([]);
  const [topViajeros, setTopViajeros] = useState([]);
  const [cargandoTop, setCargandoTop] = useState(false);
  const [erroresPorSeccion, setErroresPorSeccion] = useState({
    usuarios: false,
    vehiculos: false,
    graficos: false,
    rankings: false,
    finanzas: false
  });

  const colores = {
    estrella: '#62d8d9',
    badgeFondo: '#113d69',
    badgeTexto: '#ffffff',
    verdeMenta: '#54c7b8',
    azulFuerte: '#124c83'
  };

  useEffect(() => {
    cargarTodosLosDatos();
  }, [retryCount, periodoAdmin]);

  const cargarTodosLosDatos = async () => {
    setLoading(true);
    setError("");
    setErrorDetails(null);

    try {
      await Promise.allSettled([
        traerUsuarios(),
        traerVehiculos(),
        traerDatosGraficos(),
        traerTopRankings(),
        traerEstadisticasFinancieras()
      ]);
    } catch (error) {
      console.error("Error general en carga de datos:", error);
      setError("Error al cargar algunos datos. Algunas secciones pueden estar incompletas.");
    } finally {
      setLoading(false);
    }
  };

  const traerEstadisticasFinancieras = async () => {
    if (!token) return;
    try {
      setErroresPorSeccion(prev => ({ ...prev, finanzas: false }));
      const headers = { "Authorization": "Bearer " + token };

      const resIngresos = await fetch(`${API_URL}/estadisticas/ingresos-plataforma?periodo=${periodoAdmin}`, { headers });

      const dataFin = {
        ingresosPlataforma: { total: 0, historial: [] }
      };

      if (resIngresos.ok) {
        dataFin.ingresosPlataforma = await resIngresos.json();
      }

      setStatsFinancieras(dataFin);
    } catch (error) {
      console.error("Error trayendo stats financieras:", error);
      setErroresPorSeccion(prev => ({ ...prev, finanzas: true }));
    }
  };

  const manejarError = (seccion, error, mensajePersonalizado = null) => {
    console.error(`Error en ${seccion}:`, error);
    setErroresPorSeccion(prev => ({ ...prev, [seccion]: true }));

    if (seccion === 'usuarios' || seccion === 'graficos') {
      setError(mensajePersonalizado || `Error al cargar ${seccion}`);
    }
  };

  const calcularEstadoUsuarios = (usuarios) => {
    if (!Array.isArray(usuarios)) return { activos: 0, inactivos: 0, suspendidos: 0, total: 0 };
    const activos = usuarios.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = usuarios.filter(u => u.estado === 'INACTIVO').length;
    const suspendidos = usuarios.filter(u => u.estado === 'SUSPENDIDO').length;
    return { activos, inactivos, suspendidos, total: usuarios.length };
  };

  async function traerUsuarios() {
    try {
      setErroresPorSeccion(prev => ({ ...prev, usuarios: false }));
      if (!token) throw new Error("No hay token de autenticación");

      const response = await fetch(`${API_URL}/auth/`, {
        headers: { "Authorization": "Bearer " + token }
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const usuarios = await response.json();

      if (Array.isArray(usuarios)) {
        const conductores = usuarios.filter(u => u.idRol === 2 || u.rol?.nombre?.toUpperCase() === 'CONDUCTOR').length;
        const viajeros = usuarios.filter(u => u.idRol === 3 || u.rol?.nombre?.toUpperCase() === 'VIAJERO' || u.rol?.nombre?.toUpperCase() === 'PASAJERO').length;
        const { activos, inactivos, suspendidos } = calcularEstadoUsuarios(usuarios);

        setStats(prev => ({ ...prev, totalUsuarios: usuarios.length, totalConductores: conductores, totalViajeros: viajeros }));
        setDonutData([
          { name: 'Activos', value: activos, color: '#54c7b8' },
          { name: 'Inactivos', value: inactivos, color: '#ff6b6b' },
          { name: 'Suspendidos', value: suspendidos, color: '#f59e0b' }
        ]);
      }
    } catch (error) {
      manejarError('usuarios', error, "Error al cargar estadísticas de usuarios");
    }
  }

  async function traerVehiculos() {
    try {
      setErroresPorSeccion(prev => ({ ...prev, vehiculos: false }));
      if (!token) return;
      const response = await fetch(`${API_URL}/vehiculos/`, {
        headers: { "Authorization": "Bearer " + token }
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const vehiculos = await response.json();
      if (Array.isArray(vehiculos)) {
        setStats(prev => ({ ...prev, totalVehiculos: vehiculos.length }));
      }
    } catch (error) {
      manejarError('vehiculos', error);
    }
  }

  async function traerViajesPorDia() {
    try {
      const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const promesasViajes = diasSemana.map(async (nombre, dia) => {
        try {
          const response = await fetch(`${API_URL}/viajes/dia/${dia}`, {
            headers: { "Authorization": "Bearer " + token }
          });
          if (!response.ok) return { nombre, cantidad: 0 };
          const ViajesDelDia = await response.json();
          return { nombre, cantidad: Array.isArray(ViajesDelDia) ? ViajesDelDia.length : 0 };
        } catch (error) {
          return { nombre, cantidad: 0 };
        }
      });
      return await Promise.all(promesasViajes);
    } catch (error) {
      return [];
    }
  }

  async function traerDatosGraficos() {
    try {
      setErroresPorSeccion(prev => ({ ...prev, graficos: false }));
      if (!token) return;

      const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const promesasUsuarios = diasSemana.map(async (nombre, dia) => {
        try {
          const response = await fetch(`${API_URL}/auth/usuarios/dia/${dia}`, {
            headers: { "Authorization": "Bearer " + token }
          });
          if (!response.ok) return { name: nombre, usuarios: 0 };
          const usuariosDelDia = await response.json();
          return { name: nombre, usuarios: Array.isArray(usuariosDelDia) ? usuariosDelDia.length : 0 };
        } catch (error) {
          return { name: nombre, usuarios: 0 };
        }
      });

      const [UsuariosPorDia, ViajesPorDia] = await Promise.all([
        Promise.all(promesasUsuarios),
        traerViajesPorDia()
      ]);

      setChartData(UsuariosPorDia.map(item => ({
        name: item.name,
        usuarios: item.usuarios,
        viajes: ViajesPorDia.find(v => v.nombre === item.name)?.cantidad || 0
      })));
    } catch (error) {
      manejarError('graficos', error);
    }
  }

  async function traerTopRankings() {
    try {
      setCargandoTop(true);
      setErroresPorSeccion(prev => ({ ...prev, rankings: false }));
      if (!token) return;

      const headers = { "Authorization": "Bearer " + token };
      const [resConductores, resViajeros] = await Promise.allSettled([
        fetch(`${API_URL}/calificaciones/top-conductores`, { headers }),
        fetch(`${API_URL}/calificaciones/top-viajeros`, { headers })
      ]);

      if (resConductores.status === 'fulfilled' && resConductores.value.ok) {
        setTopConductores(await resConductores.value.json());
      }
      if (resViajeros.status === 'fulfilled' && resViajeros.value.ok) {
        setTopViajeros(await resViajeros.value.json());
      }
    } catch (error) {
      manejarError('rankings', error);
    } finally {
      setCargandoTop(false);
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError("");
    setErrorDetails(null);
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0);
  };

  const renderStars = (promedio) => {
    const stars = [];
    const fullStars = Math.floor(promedio);
    const hasHalfStar = promedio % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<BsStarFill key={i} className="me-1" size={12} style={{ color: colores.estrella }} />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<BsStarHalf key={i} className="me-1" size={12} style={{ color: colores.estrella }} />);
      else stars.push(<BsStar key={i} className="me-1" size={12} style={{ color: colores.estrella }} />);
    }
    return stars;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${fondo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 0 }} />

      <Container fluid className="py-4 px-3 px-md-5" style={{ position: 'relative', zIndex: 1 }}>
        {/* Encabezado */}
        <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-4 d-flex flex-column flex-md-row align-items-center bg-white">
            <div className="me-md-4 mb-3 mb-md-0">
              <Image src={imagenDashboard} fluid style={{ width: '120px', borderRadius: '15px' }} />
            </div>
            <div className="text-center text-md-start flex-grow-1">
              <h2 className="fw-bold mb-1" style={{ color: colores.azulFuerte }}>¡Bienvenido de nuevo, {usuario?.nombre || 'Administrador'}!</h2>
              <p className="text-muted mb-0">Gestión global de la plataforma MoviFlex</p>
            </div>
            <div className="mt-3 mt-md-0 d-flex gap-2">
              <Badge bg={periodoAdmin === 'diario' ? 'primary' : 'light'} text={periodoAdmin === 'diario' ? 'white' : 'dark'} className="p-2 px-3 rounded-pill cursor-pointer border" onClick={() => setPeriodoAdmin('diario')} style={{ cursor: 'pointer', backgroundColor: periodoAdmin === 'diario' ? colores.verdeMenta : '' }}>Día</Badge>
              <Badge bg={periodoAdmin === 'mensual' ? 'primary' : 'light'} text={periodoAdmin === 'mensual' ? 'white' : 'dark'} className="p-2 px-3 rounded-pill cursor-pointer border" onClick={() => setPeriodoAdmin('mensual')} style={{ cursor: 'pointer', backgroundColor: periodoAdmin === 'mensual' ? colores.verdeMenta : '' }}>Mes</Badge>
              <Badge bg={periodoAdmin === 'anual' ? 'primary' : 'light'} text={periodoAdmin === 'anual' ? 'white' : 'dark'} className="p-2 px-3 rounded-pill cursor-pointer border" onClick={() => setPeriodoAdmin('anual')} style={{ cursor: 'pointer', backgroundColor: periodoAdmin === 'anual' ? colores.verdeMenta : '' }}>Año</Badge>
            </div>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: colores.verdeMenta }} /></div>
        ) : (
          <>
            {/* Tarjetas Principales */}
            <Row className="g-4 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Body className="p-4 d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#e0f4f2', color: colores.verdeMenta }}><BsPeopleFill size={25} /></div>
                    <div><h6 className="text-muted mb-0 small">Total Usuarios</h6><h3 className="fw-bold mb-0">{stats.totalUsuarios}</h3></div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Body className="p-4 d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#ebf3f9', color: '#113d69' }}><BsTruck size={25} /></div>
                    <div><h6 className="text-muted mb-0 small">Conductores</h6><h3 className="fw-bold mb-0">{stats.totalConductores}</h3></div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Body className="p-4 d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#fff7e6', color: '#f59e0b' }}><BsCashStack size={25} /></div>
                    <div><h6 className="text-muted mb-0 small">Ingresos Totales</h6><h4 className="fw-bold mb-0">{formatearMoneda(statsFinancieras.ingresosPlataforma.total)}</h4></div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Gráficos de Finanzas - NUEVO */}
            <Row className="g-4 mb-4">
              <Col lg={12}>
                <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <BsCashStack size={20} className="me-2 text-success" />
                      <h5 className="fw-bold mb-0" style={{ color: colores.azulFuerte }}>Flujo de Ingresos de Plataforma</h5>
                    </div>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={statsFinancieras.ingresosPlataforma.historial}>
                          <defs>
                            <linearGradient id="colorAdminIngresos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={colores.verdeMenta} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={colores.verdeMenta} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="value" stroke={colores.verdeMenta} strokeWidth={3} fillOpacity={1} fill="url(#colorAdminIngresos)" name="Ingresos ($)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Secciones previas reorganizadas */}
            <Row className="g-4 mb-4">
              <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 bg-white">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ color: colores.azulFuerte }}>Actividad de Registro y Viajes</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                          <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="usuarios" fill="#54c7b8" name="Reg. Usuarios" radius={[4, 4, 0, 0]} barSize={25} />
                          <Bar dataKey="viajes" fill="#124c83" name="Viajes Realizados" radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ color: colores.azulFuerte }}>Estados de Usuario</h5>
                    <div style={{ height: '220px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <h3 className="fw-bold mb-0">{stats.totalUsuarios}</h3>
                        <small className="text-muted">Total</small>
                      </div>
                    </div>
                    <div className="mt-3">
                      {donutData.map((item, id) => (
                        <div key={id} className="d-flex justify-content-between align-items-center mb-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="d-flex align-items-center">
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, marginRight: '10px' }} />
                            <span className="small fw-semibold">{item.name}</span>
                          </div>
                          <span className="small fw-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Rankings a tres columnas */}
            <Row className="g-4">
              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center"><FaMedal className="me-2 text-warning" /> Top Conductores</h6>
                    <ListGroup variant="flush">
                      {topConductores.slice(0, 5).map((c, i) => (
                        <ListGroup.Item key={i} className="px-0 border-0 bg-transparent py-3 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="me-3 fw-bold text-muted" style={{ width: '20px' }}>{i + 1}</div>
                            <div>
                              <div className="fw-bold small">{c.nombre}</div>
                              <div className="d-flex mt-1">{renderStars(c.promedioEstrellas || 0)}</div>
                            </div>
                          </div>
                          <Badge bg="light" text="dark" className="border rounded-pill">{c.promedioEstrellas?.toFixed(1) || '0.0'}</Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center"><FaMedal className="me-2 text-secondary" /> Top Pasajeros</h6>
                    <ListGroup variant="flush">
                      {topViajeros.slice(0, 5).map((v, i) => (
                        <ListGroup.Item key={i} className="px-0 border-0 bg-transparent py-3 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="me-3 fw-bold text-muted" style={{ width: '20px' }}>{i + 1}</div>
                            <div>
                              <div className="fw-bold small">{v.nombre}</div>
                              <div className="d-flex mt-1">{renderStars(v.promedioEstrellas || 0)}</div>
                            </div>
                          </div>
                          <Badge bg="light" text="dark" className="border rounded-pill">{v.promedioEstrellas?.toFixed(1) || '0.0'}</Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center"><BsCircleFill className="me-2 text-success" size={10} /> En Línea Ahora</h6>
                    <ListGroup variant="flush">
                      {onlineUsers?.slice(0, 5).map((u, i) => (
                        <ListGroup.Item key={i} className="px-0 border-0 bg-transparent py-2 d-flex align-items-center">
                          <div className="p-2 rounded-circle bg-light me-2"><BsPersonCircle className="text-muted" /></div>
                          <div className="flex-grow-1"><div className="fw-bold small">{u.nombre}</div><small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>{u.role}</small></div>
                          <Badge bg="success" pill style={{ width: '8px', height: '8px', padding: 0 }} />
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Home;