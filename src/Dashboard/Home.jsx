import React, { useState, useEffect } from "react";  
import { useAuth } from "../pages/context/AuthContext";
import {BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill, 
    BsListCheck, BsMenuButtonWideFill, BsPersonCircle
} from "react-icons/bs";
import {  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function Home() {

    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [totalConductores, setTotalConductores] = useState(0);
    const [totalViajeros, setTotalViajeros] = useState(0);
    const [totalVehiculos, setTotalVehiculos] = useState(0);

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
            
            const response = await fetch("https://backendmovi-production.up.railway.app/api/auth/", {
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
                setTotalUsuarios(usuarios.length);

                const conductores = usuarios.filter(u => 
                    u.idRol === 2 || u.rol?.nombre?.toUpperCase() === 'CONDUCTOR'
                ).length;
                
                const viajeros = usuarios.filter(u => 
                    u.idRol === 3 || u.rol?.nombre?.toUpperCase() === 'VIAJERO' || u.rol?.nombre?.toUpperCase() === 'PASAJERO'
                ).length;
                
                setTotalConductores(conductores);
                setTotalViajeros(viajeros);
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
                setTotalVehiculos(vehiculos.length);
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

    return (
        <main className="main-container">
            <div className="main-title">
                <h3>DASHBOARD</h3>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
            </div>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3">Cargando estadísticas...</p>
                </div>
            ) : (
                <>
                    <div className="main-cards">
                        <div className="card">
                            <div className="card-inner">
                                <h3>Total Usuarios</h3>
                                <BsPeopleFill className="card-icon"/>
                            </div>
                            <h1>{totalUsuarios}</h1>
                        </div>
                        <div className="card">
                            <div className="card-inner">
                                <h3>Viajeros</h3>
                                <BsPeopleFill className="card-icon"/>
                            </div>
                            <h1>{totalViajeros}</h1>
                        </div>
                        <div className="card">
                            <div className="card-inner">
                                <h3>Conductores</h3>
                                <BsPersonCircle className="card-icon"/>
                            </div>
                            <h1>{totalConductores}</h1>
                        </div>
                        <div className="card">
                            <div className="card-inner">
                                <h3>Vehículos</h3>
                                <BsFillGrid3X3GapFill className="card-icon"/>
                            </div>
                            <h1>{totalVehiculos}</h1>
                        </div>
                    </div>
                    
                    <div className="charts">
                        <BarChart
                            width={700}
                            height={300}
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="usuarios" fill="#8884d8" name="Usuarios Registrados" />
                            <Bar dataKey="viajes" fill="#82ca9d" name="Viajes Realizados" />
                        </BarChart>

                        <LineChart
                            width={700}
                            height={300}
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="ingresos" stroke="#8884d8" name="Ingresos ($)" />
                        </LineChart>
                    </div>
                </>
            )}
        </main>
    );
} 

export default Home;