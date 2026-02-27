import React, { useState, useEffect } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Container, Row, Col, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle, BsTruck, BsCarFrontFill } from "react-icons/bs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import fondo from "../pages/Imagenes/AutoresContacto.png";

function Home() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalConductores: 0,
    totalViajeros: 0,
    totalVehiculos: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    traerUsuarios();
    traerVehiculos();
    traerDatosGraficos();
  }, []);

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

      if (Array.isArray(usuarios)) {
        const conductores = usuarios.filter(u =>
          u.idRol === 2 || u.rol?.nombre?.toUpperCase() === 'CONDUCTOR'
        ).length;

        const viajeros = usuarios.filter(u =>
          u.idRol === 3 || u.rol?.nombre?.toUpperCase() === 'VIAJERO' || u.rol?.nombre?.toUpperCase() === 'PASAJERO'
        ).length;

        setStats(prev => ({
          ...prev,
          totalUsuarios: usuarios.length,
          totalConductores: conductores,
          totalViajeros: viajeros
        }));
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
          viajes: viajeData?.cantidad || 0,
          ingresos: 0
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${fondo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Capa de legibilidad minimalista */}
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
                <h2 className="fw-bold mb-0" style={{ color: '#333' }}>Dashboard Administrativo</h2>
                <p className="text-muted mb-0 small">Estadísticas generales de la plataforma</p>
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
                          <Bar dataKey="usuarios" fill="#8884d8" name="Usuarios" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="viajes" fill="#82ca9d" name="Viajes" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4" style={{ color: '#333' }}>
                      Ingresos Semanales
                    </Card.Title>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                          <Tooltip 
                            cursor={{fill: 'rgba(84, 199, 184, 0.05)'}} 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            formatter={(value) => [`$${value}`, 'Ingresos']}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="ingresos"
                            stroke="#8884d8"
                            name="Ingresos ($)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#8884d8' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-center">
                      <Badge bg="success" className="px-3 py-2 me-2" style={{ backgroundColor: '#54c7b8', border: 'none' }}>
                        <small>Total Semanal: ${chartData.reduce((sum, item) => sum + (item.ingresos || 0), 0).toLocaleString()}</small>
                      </Badge>
                      <Badge bg="info" className="px-3 py-2" style={{ backgroundColor: '#8884d8', border: 'none' }}>
                        <small>Promedio Diario: ${Math.round(chartData.reduce((sum, item) => sum + (item.ingresos || 0), 0) / (chartData.length || 1)).toLocaleString()}</small>
                      </Badge>
                    </div>
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