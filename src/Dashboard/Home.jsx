import React, { useState, useEffect } from "react";  
import { useAuth } from "../pages/context/AuthContext";
import { Container, Row, Col, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle,BsTruck,BsCarFrontFill} from "react-icons/bs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer} from 'recharts';

function Home() {
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
    traerEstadisticas();
    traerDatosGraficos();
    traerVehiculos();
  }, []);

  async function traerEstadisticas() {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("backendmovi-production-c657.up.railway.app/api/auth/", {
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
        
        setStats({
          totalUsuarios: usuarios.length,
          totalConductores: conductores,
          totalViajeros: viajeros,
          totalVehiculos: stats.totalVehiculos
        });
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
      const response = await fetch("https://backendmovi-production.up.railway.app/api/vehiculos/", {
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

  async function traerDatosGraficos() {
    try {
      const datosEjemplo = [
        { name: 'Lun', usuarios: 15, viajes: 8, ingresos: 1200 },
        { name: 'Mar', usuarios: 22, viajes: 12, ingresos: 1800 },
        { name: 'Mié', usuarios: 18, viajes: 10, ingresos: 1500 },
        { name: 'Jue', usuarios: 25, viajes: 15, ingresos: 2200 },
        { name: 'Vie', usuarios: 30, viajes: 20, ingresos: 2800 },
        { name: 'Sáb', usuarios: 28, viajes: 18, ingresos: 2500 },
        { name: 'Dom', usuarios: 20, viajes: 14, ingresos: 1900 },
      ];
      
      setChartData(datosEjemplo);
    } catch (error) {
      console.error("Error al traer datos de gráficos:", error);
    }
  }

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsuarios,
      icon: <BsPeopleFill className="text-black fs-4" />,
      backgroundcolor: "#EDE7FF)",
    },
    {
      title: "Viajeros",
      value: stats.totalViajeros,
      icon: <BsPersonCircle className="text-black fs-4" />,
      backgroundcolor: "#EDE7FF)",
    },
    {
      title: "Conductores",
      value: stats.totalConductores,
      icon: <BsTruck className="text-black fs-4" />,
      backgroundcolor: "#EDE7FF)",
    },
    {
      title: "Vehículos",
      value: stats.totalVehiculos,
      icon: <BsCarFrontFill className="text-black fs-4" />,
    backgroundcolor: "#EDE7FF)",
    }
  ];

  return (
    <div style={{
      background: '#124c83',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Container fluid>
        <Row className="mb-4">
  <Col>
    <Card 
      className="border-0 shadow"
      style={{
        backgroundcolor: '#EDE7FF',
        borderRadius: '15px'
      }}
    >
      <Card.Body className="p-4">
            <Row className="align-items-center">
                <Col xs={9}>
                    <h1 className="fw-bold mb-2">Bienvenido al panel de Administración</h1>
                    <p className="text-muted mb-0">Aquí podrás tener el control de la página y observar las estadísticas de Moviflex</p>
                </Col>
            </Row>
        </Card.Body>
    </Card>
                
        {error && (
        <Alert variant="danger" className="mt-3 border-0 shadow" style={{ borderRadius: '10px' }}>
            {error}
        </Alert>
                )}
    </Col>
</Row>

        {loading ? (
          <Row className="justify-content-center py-5">
            <Col xs="auto" className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando estadísticas...</p>
            </Col>
          </Row>
        ) : (
          <>
            <Row className="g-4 mb-5">
              {statCards.map((stat, index) => (
                <Col key={index} xs={12} sm={6} lg={3}>
                  <Card 
                    className="shadow border-0 h-100" 
                    style={{
                      background: stat.color,
                      borderRadius: '15px',
                      overflow: 'hidden'
                    }}
                  >
                    <Card.Body className="p-4">
                      <Row className="align-items-center">
                        <Col xs={8}>
                          <h6 className="text-muted mb-2">{stat.title}</h6>
                          <h2 className="fw-bold mb-0">{stat.value}</h2>
                        </Col>
                        <Col xs={4} className="text-end">
                          <div 
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: '60px',
                              height: '60px',
                              background: stat.iconBg
                            }}
                          >
                            {stat.icon}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="g-4">
              <Col lg={6}>
                <Card className="shadow border-0 h-100" style={{ borderRadius: '15px' }}>
                  <Card.Body>
                    <Card.Title className="mb-4" style={{ color: '#6C3BFF' }}>
                      Actividad Semanal
                    </Card.Title>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '10px',
                              border: '1px solid #dee2e6'
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="usuarios" 
                            fill="#8884d8" 
                            name="Usuarios Registrados"
                            radius={[5, 5, 0, 0]}
                          />
                          <Bar 
                            dataKey="viajes" 
                            fill="#82ca9d" 
                            name="Viajes Realizados"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card className="shadow border-0 h-100" style={{ borderRadius: '15px' }}>
                  <Card.Body>
                    <Card.Title className="mb-4" style={{ color: '#6C3BFF' }}>
                      Ingresos Semanales
                    </Card.Title>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '10px',
                              border: '1px solid #dee2e6'
                            }}
                            formatter={(value) => [`$${value}`, 'Ingresos']}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="ingresos" 
                            stroke="#8884d8" 
                            name="Ingresos ($)"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-center">
                      <Badge bg="success" className="px-3 py-2 me-2">
                        <small>Total Semanal: ${chartData.reduce((sum, item) => sum + item.ingresos, 0).toLocaleString()}</small>
                      </Badge>
                      <Badge bg="info" className="px-3 py-2">
                        <small>Promedio Diario: ${Math.round(chartData.reduce((sum, item) => sum + item.ingresos, 0) / chartData.length).toLocaleString()}</small>
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