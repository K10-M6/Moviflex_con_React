import React, { useState, useEffect } from "react";  
import { useAuth } from "../pages/context/AuthContext";
import { Container, Row, Col, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { BsPeopleFill, BsPersonCircle, BsTruck, BsCarFrontFill} from "react-icons/bs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer} from 'recharts';

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
    try{
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
            cantidad: Array.isArray(ViajesDelDia) ? ViajesDelDia.length : 0,};
        });
      
      const ViajesPorDia = await Promise.all(promesasViajes)
      return ViajesPorDia;
    } catch (error){
      console.error("Error al traer viajes", error);
      return[];
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
            return { nombre, usuarios: 0, viajes: 0, ingresos: 0 };
          }
          
          const usuariosDelDia = await response.json();
          
          return {
            name: nombre,
            usuarios: Array.isArray(usuariosDelDia) ? usuariosDelDia.length : 0,
            viajes: 0,
            ingresos: 0
          };
        });

        const ViajesPorDia = await traerViajesPorDia();

        const UsuariosPorDia = await Promise.all(promesasUsuarios);
        const datosCombinados = UsuariosPorDia.map((item, index) => {
          const viajeData = ViajesPorDia.find(v => v.nombre === item.name);

          return {
            ...item,
            viajes: viajeData?.cantidad || 0,
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
      icon: <BsPeopleFill className="text-white fs-4" />,
      cardColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "rgba(255, 255, 255, 0.2)"
    },
    {
      title: "Viajeros",
      value: stats.totalViajeros,
      icon: <BsPersonCircle className="text-white fs-4" />,
      cardColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      iconBg: "rgba(255, 255, 255, 0.2)"
    },
    {
      title: "Conductores",
      value: stats.totalConductores,
      icon: <BsTruck className="text-white fs-4" />,
      cardColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      iconBg: "rgba(255, 255, 255, 0.2)"
    },
    {
      title: "Vehículos",
      value: stats.totalVehiculos,
      icon: <BsCarFrontFill className="text-white fs-4" />,
      cardColor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      iconBg: "rgba(255, 255, 255, 0.2)"
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
                background: 'linear-gradient(20deg, #4acfbd, #59c2ffff)',
                borderRadius: '15px'
              }}
            >
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col xs={9}>
                    <h1 className="fw-bold mb-2 text-white">Bienvenido al panel de Administración</h1>
                    <p className="text-white text-opacity-75 mb-0">Aquí podrás tener el control de la página y observar las estadísticas de Moviflex</p>
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
              <Spinner animation="border" variant="light" />
              <p className="mt-3 text-white">Cargando estadísticas...</p>
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
                      background: stat.cardColor,
                      borderRadius: '15px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body className="p-4">
                      <Row className="align-items-center">
                        <Col xs={8}>
                          <h6 className="text-white text-opacity-75 mb-2">{stat.title}</h6>
                          <h2 className="fw-bold mb-0 text-white">{stat.value}</h2>
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
                <Card className="shadow border-0 h-100" style={{ borderRadius: '15px', background: 'white' }}>
                  <Card.Body>
                    <Card.Title className="mb-4" style={{ color: '#333', fontWeight: 'bold' }}>
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
                              border: 'none',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
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
                <Card className="shadow border-0 h-100" style={{ borderRadius: '15px', background: 'white' }}>
                  <Card.Body>
                    <Card.Title className="mb-4" style={{ color: '#333', fontWeight: 'bold' }}>
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
                              border: 'none',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
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
                        <small>Promedio Diario: ${Math.round(chartData.reduce((sum, item) => sum + item.ingresos, 0) / (chartData.length || 1)).toLocaleString()}</small>
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