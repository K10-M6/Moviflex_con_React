import React, { useState, useEffect } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Badge, Image } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle, BsTruck, BsCarFrontFill, BsStarFill, BsStarHalf, BsStar, BsCircleFill } from "react-icons/bs";
import { useSocket } from "../pages/context/SocketContext";
import { FaMedal } from "react-icons/fa";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import fondo from "../pages/Imagenes/AutoresContacto.png";
import imagenDashboard from "../pages/Imagenes/HomeBaseImage.png";

function Home() {
  const { token, usuario } = useAuth();
  const { onlineUsers } = useSocket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalConductores: 0,
    totalViajeros: 0,
    totalVehiculos: 0
  });
  const [chartData, setChartData] = useState([]);
  const [donutData, setDonutData] = useState([
    { name: 'Activos', value: 0, color: '#54c7b8' },
    { name: 'Inactivos', value: 0, color: '#ff6b6b' },
    { name: 'Suspendidos', value: 0, color: '#f59e0b' }
  ]);
  const [topConductores, setTopConductores] = useState([]);
  const [topViajeros, setTopViajeros] = useState([]);
  const [cargandoTop, setCargandoTop] = useState(false);

  const colores = {
    estrella: '#62d8d9',
    badgeFondo: '#113d69',
    badgeTexto: '#ffffff',
    verdeMenta: '#54c7b8'
  };

  useEffect(() => {
    traerUsuarios();
    traerVehiculos();
    traerDatosGraficos();
    traerTopRankings();
  }, []);

  const calcularEstadoUsuarios = (usuarios) => {
    if (!Array.isArray(usuarios)) return { activos: 0, inactivos: 0, suspendidos: 0, total: 0 };
    const activos = usuarios.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = usuarios.filter(u => u.estado === 'INACTIVO').length;
    const suspendidos = usuarios.filter(u => u.estado === 'SUSPENDIDO').length;
    return { activos, inactivos, suspendidos, total: usuarios.length };
  };

  async function traerUsuarios() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token }
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
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
      console.error("Error:", error);
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }

  async function traerVehiculos() {
    try {
      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/vehiculos/", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token }
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const vehiculos = await response.json();
      if (Array.isArray(vehiculos)) setStats(prev => ({ ...prev, totalVehiculos: vehiculos.length }));
    } catch (error) {
      console.error("Error al traer vehículos:", error);
    }
  }

  async function traerViajesPorDia() {
    try {
      const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const promesasViajes = diasSemana.map(async (nombre, dia) => {
        const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/viajes/dia/${dia}`, {
          headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) return { nombre, cantidad: 0 };
        const ViajesDelDia = await response.json();
        return { nombre, cantidad: Array.isArray(ViajesDelDia) ? ViajesDelDia.length : 0 };
      });
      return await Promise.all(promesasViajes);
    } catch (error) {
      console.error("Error al traer viajes", error);
      return [];
    }
  }

  async function traerDatosGraficos() {
    try {
      setLoading(true);
      const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const promesasUsuarios = diasSemana.map(async (nombre, dia) => {
        const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/usuarios/dia/${dia}`, {
          headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) return { name: nombre, usuarios: 0 };
        const usuariosDelDia = await response.json();
        return { name: nombre, usuarios: Array.isArray(usuariosDelDia) ? usuariosDelDia.length : 0 };
      });

      const [UsuariosPorDia, ViajesPorDia] = await Promise.all([
        Promise.all(promesasUsuarios),
        traerViajesPorDia()
      ]);

      const datosCombinados = UsuariosPorDia.map(item => ({
        name: item.name,
        usuarios: item.usuarios,
        viajes: ViajesPorDia.find(v => v.nombre === item.name)?.cantidad || 0
      }));

      setChartData(datosCombinados);
    } catch (error) {
      console.error("Error:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }

  async function traerTopRankings() {
    try {
      setCargandoTop(true);
      const headers = { "Content-Type": "application/json", "Authorization": "Bearer " + token };
      
      const [resConductores, resViajeros] = await Promise.all([
        fetch("https://backendmovi-production-c657.up.railway.app/api/calificaciones/top-conductores", { headers }),
        fetch("https://backendmovi-production-c657.up.railway.app/api/calificaciones/top-viajeros", { headers })
      ]);

      if (resConductores.ok) {
        const data = await resConductores.json();
        setTopConductores(Array.isArray(data) ? data : []);
      }
      if (resViajeros.ok) {
        const data = await resViajeros.json();
        setTopViajeros(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al traer rankings:", error);
    } finally {
      setCargandoTop(false);
    }
  }

  const renderStars = (promedio) => {
    const stars = [];
    const fullStars = Math.floor(promedio);
    const hasHalfStar = promedio % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<BsStarFill key={i} className="me-1" size={14} style={{ color: colores.estrella }} />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<BsStarHalf key={i} className="me-1" size={14} style={{ color: colores.estrella }} />);
      else stars.push(<BsStar key={i} className="me-1" size={14} style={{ color: colores.estrella }} />);
    }
    return stars;
  };

  const getMedalColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#54c7b8';
  };

  const statCards = [
    { title: "Total Usuarios", value: stats.totalUsuarios, icon: <BsPeopleFill className="fs-5"/> },
    { title: "Viajeros", value: stats.totalViajeros, icon: <BsPersonCircle className="fs-5" /> },
    { title: "Conductores", value: stats.totalConductores, icon: <BsTruck className="fs-5" /> },
    { title: "Vehículos", value: stats.totalVehiculos, icon: <BsCarFrontFill className="fs-5" /> }
  ];

  const getNombreUsuario = () => {
    if (!usuario?.nombre) return "Administrador";
    return usuario.nombre.split(' ')[0];
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
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        zIndex: 0
      }} />

      <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
        <Row className="mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '5px solid #54c7b8' }}>
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="me-4" style={{ flexShrink: 0 }}>
                  <Image src={imagenDashboard} fluid style={{ maxHeight: '300px', maxWidth: '300px', borderRadius: '12px', objectFit: 'cover' }} alt="Dashboard" />
                </div>
                <div>
                  <h2 className="fw-bold mb-2" style={{ color: '#113d69' }}>Hola, {getNombreUsuario()}</h2>
                  <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Dashboard administrativo con estadísticas generales.</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && <Alert variant="danger" className="mt-3 border-0 shadow-sm">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#54c7b8' }} />
            <p className="mt-3 text-muted">Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            <Row className="g-4 mb-4">
              {statCards.map((stat, index) => (
                <Col key={index} xs={12} sm={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100 bg-white" style={{ borderRadius: '12px' }}>
                    <Card.Body className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: '#54c7b8', color: 'white' }}>
                        {stat.icon}
                      </div>
                      <div>
                        <h6 className="text-muted mb-0 small">{stat.title}</h6>
                        <h3 className="fw-bold mb-0" style={{ color: '#333' }}>{stat.value}</h3>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="g-4 mb-4">
              <Col lg={8}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4" style={{ color: '#113d69' }}>Actividad Semanal</Card.Title>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                          <Tooltip cursor={{ fill: 'rgba(84, 199, 184, 0.05)' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                          <Legend />
                          <Bar dataKey="usuarios" fill="#68bdc4" name="Usuarios" radius={[4, 4, 0, 0]} barSize={28}/>
                          <Bar dataKey="viajes" fill="#113d69" name="Viajes" radius={[4, 4, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4 d-flex flex-column">
                    <Card.Title className="fw-bold mb-4" style={{ color: '#333' }}>Estado de Usuarios</Card.Title>
                    <div style={{ height: '200px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                            {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(value, name) => {
                            const total = donutData.reduce((sum, item) => sum + item.value, 0);
                            const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return [`${value} usuarios (${porcentaje}%)`, name];
                          }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                        <h3 className="fw-bold mb-0" style={{ color: '#333', fontSize: '1.4rem' }}>
                          {donutData.reduce((sum, item) => sum + item.value, 0)}
                        </h3>
                        <small className="text-muted">Total</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                      {donutData.map((item, index) => {
                        const total = donutData.reduce((sum, item) => sum + item.value, 0) || 1;
                        const porcentaje = Math.round((item.value / total) * 100);
                        return (
                          <div key={index} className="d-flex align-items-center">
                            <div style={{ width: '10px', height: '10px', backgroundColor: item.color, borderRadius: '3px', marginRight: '6px' }} />
                            <div>
                              <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{item.name}</small>
                              <strong style={{ fontSize: '0.85rem' }}>{porcentaje}%</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-4">
              <Col md={6} lg={4}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#333' }}>
                      <BsCircleFill className="me-2 text-success" size={12} />
                      Usuarios Conectados ({onlineUsers.length})
                    </Card.Title>
                    {onlineUsers.length > 0 ? (
                      <ListGroup variant="flush">
                        {onlineUsers.map((u, index) => (
                          <ListGroup.Item key={index} className="px-0 border-0 bg-transparent py-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#e9ecef' }}>
                                  <BsPersonCircle size={20} className="text-muted" />
                                </div>
                                <div>
                                  <div className="fw-bold small">{u.nombre}</div>
                                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>{u.role}</div>
                                </div>
                              </div>
                              <Badge bg="success" className="rounded-pill" style={{ fontSize: '0.65rem' }}>En línea</Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="text-muted text-center py-3 small">No hay usuarios conectados</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#333' }}>
                      <FaMedal className="me-2" style={{ color: '#FFD700' }} />
                      Top 5 Conductores
                    </Card.Title>
                    {cargandoTop ? (
                      <div className="text-center py-3"><Spinner animation="border" size="sm" style={{ color: '#54c7b8' }} /></div>
                    ) : topConductores.length > 0 ? (
                      <ListGroup variant="flush">
                        {topConductores.slice(0, 5).map((c, i) => (
                          <ListGroup.Item key={c.idUsuarios || i} className="px-0 border-0 bg-transparent py-2">
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center justify-content-center rounded-circle me-2" style={{ width: '30px', height: '30px', backgroundColor: getMedalColor(i), color: i < 3 ? 'white' : '#333', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {i + 1}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong style={{ fontSize: '0.9rem' }}>{c.nombre}</strong>
                                  <Badge bg="none" className="rounded-pill px-2" style={{ fontSize: '0.75rem', backgroundColor: colores.estrella, color: 'white' }}>
                                    {c.promedioEstrellas?.toFixed(1) || '0.0'}
                                  </Badge>
                                </div>
                                <div className="mt-1">
                                  {renderStars(c.promedioEstrellas || 0)}
                                  <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>({c.totalReseñas || 0})</small>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : <p className="text-muted text-center py-3 small">Sin calificaciones</p>}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#333' }}>
                      <FaMedal className="me-2" style={{ color: '#C0C0C0' }} />
                      Top 5 Viajeros
                    </Card.Title>
                    {cargandoTop ? (
                      <div className="text-center py-3"><Spinner animation="border" size="sm" style={{ color: '#54c7b8' }} /></div>
                    ) : topViajeros.length > 0 ? (
                      <ListGroup variant="flush">
                        {topViajeros.slice(0, 5).map((v, i) => (
                          <ListGroup.Item key={v.idUsuarios || i} className="px-0 border-0 bg-transparent py-2">
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center justify-content-center rounded-circle me-2" style={{ width: '30px', height: '30px', backgroundColor: getMedalColor(i), color: i < 3 ? 'white' : '#333', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {i + 1}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong style={{ fontSize: '0.9rem' }}>{v.nombre}</strong>
                                  <Badge bg="none" className="rounded-pill px-2" style={{ fontSize: '0.75rem', backgroundColor: colores.estrella, color: 'white' }}>
                                    {v.promedioEstrellas?.toFixed(1) || '0.0'}
                                  </Badge>
                                </div>
                                <div className="mt-1">
                                  {renderStars(v.promedioEstrellas || 0)}
                                  <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>({v.totalReseñas || 0})</small>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : <p className="text-muted text-center py-3 small">Sin calificaciones</p>}
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