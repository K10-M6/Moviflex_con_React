import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from "recharts";
import { FaWallet } from "react-icons/fa";

const SavingsCalculator = () => {
    const [distancia, setDistancia] = useState(15); 
    const [dias, setDias] = useState(5); 
    
    const [datos, setDatos] = useState([]);

    const brandColor = "#56bca7"; 
    const secondaryColor = "#2d5a52"; 

    useEffect(() => {
        // DATOS REALES APROXIMADOS COLOMBIA 2024
        // Costo promedio Taxi/Uber por km: ~$3.500 COP
        // Costo promedio MoviFlex (compartido): ~$1.800 COP
        
        const kmMensuales = distancia * dias * 4;
        const costoSolo = kmMensuales * 3500; 
        const costoMoviflex = kmMensuales * 1800; 
        
        setDatos([
            { name: "Transporte Solo", valor: costoSolo, color: "#d1d8d6" },
            { name: "Con MoviFlex", valor: costoMoviflex, color: brandColor }
        ]);
    }, [distancia, dias]);

    const formatCurrency = (val) => {
        if (isNaN(val) || val === undefined) return "$ 0";
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const savings = (datos[0]?.valor || 0) - (datos[1]?.valor || 0);

    return (
        <section className="py-5" style={{ backgroundColor: "#ffffff" }}>
            <Container>
                <Row className="align-items-center">
                    <Col lg={6} className="mb-4 mb-lg-0">
                        <div className="pe-lg-5">
                            <h2 className="fw-bold mb-4" style={{ color: brandColor, fontSize: '2.5rem' }}>
                                Tu bolsillo y el planeta <span style={{ color: secondaryColor }}>te lo agradecerán</span>
                            </h2>
                            <p className="text-muted mb-5" style={{ fontSize: '1.1rem' }}>
                                Ajusta tu rutina y mira cuánto dinero ahorras al mes simplemente compartiendo tu viaje.
                            </p>

                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className="fw-bold" style={{ color: secondaryColor }}>Recorrido diario total (km)</Form.Label>
                                    <span className="badge rounded-pill" style={{ backgroundColor: brandColor }}>{distancia} km</span>
                                </div>
                                <Form.Range 
                                    min="1" max="100" 
                                    value={distancia} 
                                    onChange={(e) => setDistancia(parseInt(e.target.value))} 
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className="fw-bold" style={{ color: secondaryColor }}>Días compartidos a la semana</Form.Label>
                                    <span className="badge rounded-pill" style={{ backgroundColor: brandColor }}>{dias} días</span>
                                </div>
                                <Form.Range 
                                    min="1" max="7" 
                                    value={dias} 
                                    onChange={(e) => setDias(parseInt(e.target.value))} 
                                />
                            </Form.Group>

                            <Card className="border-0 shadow-lg p-4 mt-5 animate__animated animate__heartBeat animate__infinite animate__slower" style={{ borderRadius: "25px", background: `linear-gradient(135deg, ${brandColor} 0%, #45a08d 100%)`, color: "white" }}>
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                        <FaWallet size={28} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 opacity-75 fw-bold">Ahorro mensual certificado</h6>
                                        <h2 className="fw-bold mb-0">
                                            {formatCurrency(savings)} <small style={{ fontSize: '1rem' }}>COP</small>
                                        </h2>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                    
                    <Col lg={6}>
                        <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ minHeight: "420px" }}>
                            <h5 className="text-center mb-4 fw-bold" style={{ color: brandColor }}>Análisis de Gastos Mensuales (Pesos COP)</h5>
                            <div style={{ width: '100%', height: '320px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={datos} margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fill: secondaryColor, fontWeight: 'bold' }} />
                                        <YAxis 
                                            tickFormatter={(val) => `$ ${(val / 1000).toFixed(0)} mil`} 
                                            tick={{ fill: '#666', fontSize: 11 }}
                                        />
                                        <Tooltip 
                                            formatter={(val) => [formatCurrency(val), "Costo"]}
                                            contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} 
                                        />
                                        <Bar dataKey="valor" radius={[15, 15, 0, 0]} barSize={80}>
                                            {datos.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-3 small text-muted italic">
                                * Cálculos basados en promedios de tarifas de transporte privado en Colombia (2024).
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default SavingsCalculator;
