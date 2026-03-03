import React, { useState, useEffect } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Badge } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle, BsTruck, BsCarFrontFill, BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { FaMedal } from "react-icons/fa";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import fondo from "../pages/Imagenes/AutoresContacto.png";

function Home() {
  const { token, usuario } = useAuth();
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
  const [cargandoTop, setCargandoTop] = useState(false);

  useEffect(() => {
    traerUsuarios();
    traerVehiculos();
    traerDatosGraficos();
    traerTopConductores();
  }, []);

  const calcularEstadoUsuarios = (usuarios) => {
    if (!Array.isArray(usuarios)) return { activos: 0, inactivos: 0, suspendidos: 0, total: 0 };

    const activos = usuarios.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = usuarios.filter(u => u.estado === 'INACTIVO').length;
    const suspendidos = usuarios.filter(u => u.estado === 'SUSPENDIDO').length;
    const total = usuarios.length;
    
    return { activos, inactivos, suspendidos, total };
  };

  async function traerUsuarios() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const usuarios = await response.json();
      console.log("Usuarios recibidos:", usuarios);

      if (Array.isArray(usuarios)) {
        const conductores = usuarios.filter(u =>
          u.idRol === 2 || u.rol?.nombre?.toUpperCase() === 'CONDUCTOR'
        ).length;

        const viajeros = usuarios.filter(u =>
          u.idRol === 3 || u.rol?.nombre?.toUpperCase() === 'VIAJERO' || u.rol?.nombre?.toUpperCase() === 'PASAJERO'
        ).length;

        const { activos, inactivos, suspendidos } = calcularEstadoUsuarios(usuarios);

        setStats(prev => ({
          ...prev,
          totalUsuarios: usuarios.length,
          totalConductores: conductores,
          totalViajeros: viajeros
        }));

        setDonutData([
          { name: 'Activos', value: activos, color: '#54c7b8' },
          { name: 'Inactivos', value: inactivos, color: '#ff6b6b' },
          { name: 'Suspendidos', value: suspendidos, color: '#f59e0b' }
        ]);
      }
    } catch (error) {
      console.error("Error al traer estadísticas:", error);
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }

  async function traerVehiculos() {
    try {
      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/vehiculos/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const vehiculos = await response.json();

      if (Array.isArray(vehiculos)) {
        setStats(prev => ({
          ...prev,
          totalVehiculos: vehiculos.length
        }));
      }
    } catch (error) {
      console.error("Error al traer vehículos:", error);
    }
  }

  async function traerViajesPorDia() {
    try {
      const diasSemana = [
        { nombre: 'Lun', dia: 0 },
        { nombre: 'Mar', dia: 1 },
        { nombre: 'Mié', dia: 2 },
        { nombre: 'Jue', dia: 3 },
        { nombre: 'Vie', dia: 4 },
        { nombre: 'Sáb', dia: 5 },
        { nombre: 'Dom', dia: 6 }
      ];

      const promesasViajes = diasSemana.map(async ({ nombre, dia }) => {
        const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/viajes/dia/${dia}`, {
          headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) {
          console.error(`Error ${response.status} para día ${dia}`);
          return { nombre, cantidad: 0 };
        }
        const ViajesDelDia = await response.json();

        return {
          nombre,
          cantidad: Array.isArray(ViajesDelDia) ? ViajesDelDia.length : 0,
        };
      });

      const ViajesPorDia = await Promise.all(promesasViajes)
      return ViajesPorDia;
    } catch (error) {
      console.error("Error al traer viajes", error);
      return [];
    }
  }

  async function traerDatosGraficos() {
    try {
      setLoading(true);

      const diasSemana = [
        { nombre: 'Lun', dia: 0 },
        { nombre: 'Mar', dia: 1 },
        { nombre: 'Mié', dia: 2 },
        { nombre: 'Jue', dia: 3 },
        { nombre: 'Vie', dia: 4 },
        { nombre: 'Sáb', dia: 5 },
        { nombre: 'Dom', dia: 6 }
      ];

      const promesasUsuarios = diasSemana.map(async ({ nombre, dia }) => {
        const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/usuarios/dia/${dia}`, {
          headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) {
          console.error(`Error ${response.status} para día ${dia}`);
          return { nombre, usuarios: 0 };
        }

        const usuariosDelDia = await response.json();

        return {
          name: nombre,
          usuarios: Array.isArray(usuariosDelDia) ? usuariosDelDia.length : 0,
        };
      });

      const ViajesPorDia = await traerViajesPorDia();

      const UsuariosPorDia = await Promise.all(promesasUsuarios);
      const datosCombinados = UsuariosPorDia.map((item, index) => {
        const viajeData = ViajesPorDia.find(v => v.nombre === item.name);

        return {
          name: item.name,
          usuarios: item.usuarios,
          viajes: viajeData?.cantidad || 0
        }
      });

      setChartData(datosCombinados);

    } catch (error) {
      console.error("Error:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }

  const obtenerPromedioConductor = async (idUsuario) => {
    try {
      const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/calificaciones/top-conductores`, {
        headers: { "Authorization": "Bearer " + token }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          promedio: data.promedio || 0,
          total: data.total || 0
        };
      }
      return { promedio: 0, total: 0 };
    } catch (error) {
      console.error(`Error al obtener promedio para conductor ${idUsuario}:`, error);
      return { promedio: 0, total: 0 };
    }
  };

  async function traerTopConductores() {
    try {
      setCargandoTop(true);
      const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/calificaciones/top-conductores", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Top conductores (raw):", data);
      
      if (Array.isArray(data)) {
        const primeros10 = data.slice(0, 10);
        const conductoresConPromedio = await Promise.all(
          primeros10.map(async (conductor) => {
            const { promedio, total } = await obtenerPromedioConductor(conductor.idUsuarios);
            return {
              ...conductor,
              promedioEstrellas: promedio,
              totalReseñas: total
            };
          })
        );
        
        const top5 = conductoresConPromedio
          .sort((a, b) => b.promedioEstrellas - a.promedioEstrellas)
          .slice(0, 5);
        
        setTopConductores(top5);
      }
    } catch (error) {
      console.error("Error al traer top conductores:", error);
    } finally {
      setCargandoTop(false);
    }
  }

  const renderStars = (promedio) => {
    const stars = [];
    const fullStars = Math.floor(promedio);
    const hasHalfStar = promedio % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<BsStarFill key={i} className="text-warning me-1" size={14} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<BsStarHalf key={i} className="text-warning me-1" size={14} />);
      } else {
        stars.push(<BsStar key={i} className="text-warning me-1" size={14} />);
      }
    }
    return stars;
  };

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return '#FFD700'; 
      case 1: return '#C0C0C0'; 
      case 2: return '#CD7F32'; 
      default: return '#54c7b8'; 
    }
  };

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsuarios,
      icon: <BsPeopleFill className="fs-5" />
    },
    {
      title: "Viajeros",
      value: stats.totalViajeros,
      icon: <BsPersonCircle className="fs-5" />
    },
    {
      title: "Conductores",
      value: stats.totalConductores,
      icon: <BsTruck className="fs-5" />
    },
    {
      title: "Vehículos",
      value: stats.totalVehiculos,
      icon: <BsCarFrontFill className="fs-5" />
    }
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
          <Col>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '5px solid #54c7b8' }}>
              <Card.Body className="p-4">
                <h2 className="fw-bold mb-2" style={{ color: '#333' }}>
                  Hola, {getNombreUsuario()}
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                  Este es el Dashboard administrativo. Aquí podrás ver las estadísticas generales de la aplicación.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mt-3 border-0 shadow-sm">
            {error}
          </Alert>
        )}

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
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ width: '50px', height: '50px', backgroundColor: '#54c7b8', color: 'white' }}
                      >
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

            <Row className="g-4">
              <Col lg={6}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4" style={{ color: '#333' }}>
                      Actividad Semanal
                    </Card.Title>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                          <Tooltip 
                            cursor={{fill: 'rgba(84, 199, 184, 0.05)'}} 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                          />
                          <Legend />
                          <Bar dataKey="usuarios" fill="#68bdc4" name="Usuarios" radius={[4, 4, 0, 0]} barSize={28}/>
                          <Bar dataKey="viajes" fill="#43d699" name="Viajes" radius={[4, 4, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Row className="g-4">
                  <Col xs={12}>
                    <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
                      <Card.Body className="p-4 d-flex flex-column">
                        <Card.Title className="fw-bold mb-4" style={{ color: '#333' }}>
                          Estado de Usuarios
                        </Card.Title>
                        
                        <div style={{ height: '200px', position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                              >
                                {donutData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name, props) => {
                                  const total = donutData.reduce((sum, item) => sum + item.value, 0);
                                  const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                  return [`${value} usuarios (${porcentaje}%)`, name];
                                }}
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
          
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            pointerEvents: 'none'
                          }}>
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
                                <div style={{
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: item.color,
                                  borderRadius: '3px',
                                  marginRight: '6px'
                                }} />
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

                  <Col xs={12}>
                    <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
                      <Card.Body className="p-4">
                        <Card.Title className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#333' }}>
                          <FaMedal className="me-2" style={{ color: '#FFD700' }} />
                          Top 5 Mejores Conductores
                        </Card.Title>
                        
                        {cargandoTop ? (
                          <div className="text-center py-3">
                            <Spinner animation="border" size="sm" style={{ color: '#54c7b8' }} />
                            <p className="mt-2 text-muted small">Cargando...</p>
                          </div>
                        ) : topConductores.length > 0 ? (
                          <ListGroup variant="flush">
                            {topConductores.map((conductor, index) => (
                              <ListGroup.Item key={conductor.idUsuarios || index} className="px-0 border-0 bg-transparent">
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="d-flex align-items-center justify-content-center rounded-circle me-2"
                                    style={{ 
                                      width: '30px', 
                                      height: '30px', 
                                      backgroundColor: getMedalColor(index),
                                      color: index < 3 ? 'white' : '#333',
                                      fontWeight: 'bold',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    {index + 1}
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <strong style={{ fontSize: '0.9rem' }}>{conductor.nombre}</strong>
                                      <Badge 
                                        bg="warning" 
                                        text="dark" 
                                        className="rounded-pill px-2"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        {conductor.promedioEstrellas ? conductor.promedioEstrellas.toFixed(1) : '0.0'}
                                      </Badge>
                                    </div>
                                    <div className="mt-1">
                                      {renderStars(conductor.promedioEstrellas || 0)}
                                      <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>
                                        ({conductor.totalReseñas || 0} reseñas)
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted text-center py-3 small">
                            No hay suficientes calificaciones
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Home;