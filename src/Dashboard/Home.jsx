import React, { useState, useEffect } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle, BsTruck, BsCarFrontFill } from "react-icons/bs";
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

  useEffect(() => {
    traerUsuarios();
    traerVehiculos();
    traerDatosGraficos();
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
      {/* Eliminamos completamente la capa blanca superpuesta */}

      <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
        <Row className="mb-4">
          <Col>
            {/* Tarjeta de bienvenida - CON FONDO BLANCO */}
            <Card className="border-0 shadow-sm" style={{ 
              borderRadius: '12px', 
              borderLeft: '5px solid #54c7b8',
              backgroundColor: 'white'
            }}>
              <Card.Body className="p-4">
                <h2 className="fw-bold mb-2" style={{ color: '#54c7b8' }}>
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
          <Alert variant="danger" className="mt-3 border-0 shadow-sm" style={{ backgroundColor: 'rgba(248, 215, 218, 0.9)' }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '12px', padding: '2rem', backdropFilter: 'blur(5px)' }}>
            <Spinner animation="border" style={{ color: '#54c7b8' }} />
            <p className="mt-3 text-white">Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            <Row className="g-4 mb-4">
              {statCards.map((stat, index) => (
                <Col key={index} xs={12} sm={6} lg={3}>
                  {/* Tarjetas de estadísticas - SIN FONDO, SOLO TEXTO */}
                  <div className="d-flex align-items-center" style={{ padding: '1rem' }}>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                      style={{ width: '50px', height: '50px', backgroundColor: '#54c7b8', color: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <h6 className="mb-0 small" style={{ color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{stat.title}</h6>
                      <h3 className="fw-bold mb-0" style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{stat.value}</h3>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            <Row className="g-4">
              <Col lg={8}>
                {/* Tarjeta completa para Actividad Semanal - CON FONDO BLANCO */}
                <Card className="shadow-sm border-0 h-100" style={{ 
                  borderRadius: '12px',
                  backgroundColor: 'white'
                }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4" style={{ color: '#333' }}>
                      Actividad Semanal
                    </Card.Title>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                          <Tooltip 
                            cursor={{fill: 'rgba(84, 199, 184, 0.1)'}} 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                          />
                          <Legend wrapperStyle={{ color: '#333' }} />
                          <Bar dataKey="usuarios" fill="#68bdc4" name="Usuarios" radius={[4, 4, 0, 0]} barSize={28}/>
                          <Bar dataKey="viajes" fill="#43d699" name="Viajes" radius={[4, 4, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                {/* Tarjeta de gráfico de donut - SIN FONDO */}
                <div style={{ padding: '0' }}>
                  <h5 className="fw-bold mb-4" style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Estado de Usuarios
                  </h5>
                  
                  <div style={{ height: '250px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
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
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff' }}
                          labelStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      padding: '8px 16px',
                      borderRadius: '30px',
                      backdropFilter: 'blur(3px)'
                    }}>
                      <h3 className="fw-bold mb-0" style={{ color: '#fff', fontSize: '1.8rem' }}>
                        {donutData.reduce((sum, item) => sum + item.value, 0)}
                      </h3>
                      <small style={{ color: '#ddd' }}>Total</small>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-center gap-4 mt-3 flex-wrap">
                    {donutData.map((item, index) => {
                      const total = donutData.reduce((sum, item) => sum + item.value, 0) || 1;
                      const porcentaje = Math.round((item.value / total) * 100);
                      return (
                        <div key={index} className="d-flex align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '5px 10px', borderRadius: '20px', backdropFilter: 'blur(3px)' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: item.color,
                            borderRadius: '4px',
                            marginRight: '8px'
                          }} />
                          <div>
                            <small style={{ color: '#ddd' }} className="d-block">{item.name}</small>
                            <strong style={{ color: '#fff' }}>{item.value} ({porcentaje}%)</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Home;