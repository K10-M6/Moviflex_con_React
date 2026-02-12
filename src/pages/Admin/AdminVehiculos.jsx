import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

function AdminVehiculos(){
    const { token } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [usuarios, setUsuarios] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(()=> {
        traerUsuarios();
        traerVehiculos();
    }, []);
    
    async function traerUsuarios() {
        try {
            const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status} al obtener usuarios`);
            }
            
            const data = await response.json();
            setUsuarios(data);
        } catch (error) {
            console.error("Error al traer usuarios:", error);
        }
    }
    
    async function traerVehiculos(){
        try {
            setLoading(true);
            setError("");
            
            const response = await fetch("https://backendmovi-production.up.railway.app/api/vehiculos/",{
                method:"GET",
                headers: {
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+token
                }
            });
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Acceso denegado. No tienes permisos de administrador.");
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error("La respuesta del servidor no es válida");
            }
            
            setVehiculos(data);
            
        } catch (error) {
            console.error("Error al traer vehículos:", error);
            setError(error.message);
            setVehiculos([]);
        } finally {
            setLoading(false);
        }
    }

    async function cambiarEstadoVehiculo(id) {
        try {
            await fetch(`https://backendmovi-production.up.railway.app/api/vehiculos/${id}/estado`,{
                method: "PATCH",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+token
                }
            });
            traerVehiculos();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del vehículo");
        }
    }
    
    function obtenerNombreUsuario(idUsuario) {
        if (!idUsuario) return "Sin propietario";
        
        const usuario = usuarios.find(u => u.idUsuarios === idUsuario);
        return usuario ? usuario.nombre : `Usuario #${idUsuario}`;
    }
    
    
    function getEstadoBadge(estado) {
        if (estado === 'ACTIVO') {
            return <Badge bg="success">Activo</Badge>;
        } else if (estado === 'INACTIVO') {
            return <Badge bg="secondary">Inactivo</Badge>;
        } else {
            return <Badge bg="warning" text="dark">{estado}</Badge>;
        }
    }

    function formatearCapacidad(capacidad) {
        if (capacidad) {
            return `${capacidad} personas`;
        }
        return "No especificado";
    }

    const vehiculosFiltrados = vehiculos;

    return(
        <div style={{
        background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
        minHeight: '100vh',
        minWidth: '95vw'}}>
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Lista de Vehículos</h1>
                        <p className="text-muted">Administra los vehículos registrados en la plataforma</p>
                        
                        <div className="d-flex gap-3 mb-3">
                            <Badge bg="primary" className="px-3 py-2">
                                Total: {vehiculos.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2">
                                Activos: {vehiculos.filter(v => v.estado?.toUpperCase() === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="secondary" className="px-3 py-2">
                                Inactivos: {vehiculos.filter(v => v.estado?.toUpperCase() === 'INACTIVO').length}
                            </Badge>
                        </div>
                    </Col>
                </Row>
                
                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible>
                                <strong>Error:</strong> {error}
                            </Alert>
                        </Col>
                    </Row>
                )}
                
                <Row>
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </Spinner>
                                        <p className="mt-3">Cargando vehículos...</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Propietario</th>
                                                <th>Marca</th>
                                                <th>Modelo</th>
                                                <th>Placa</th>
                                                <th>Capacidad</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehiculosFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        No hay vehículos registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                vehiculosFiltrados.map((vehiculo) => {
                                                    const nombreUsuario = obtenerNombreUsuario(vehiculo.idUsuario);
                                                    
                                                    return (
                                                        <tr key={vehiculo.idVehiculos}>
                                                            <td className="fw-semibold">{vehiculo.idVehiculos}</td>
                                                            <td>
                                                                <div className="fw-medium">{nombreUsuario}</div>
                                                                <small className="text-muted">
                                                                    ID: {vehiculo.idUsuario}
                                                                </small>
                                                            </td>
                                                            <td>{vehiculo.marca }</td>
                                                            <td>{vehiculo.modelo}</td>
                                                            <td>{vehiculo.placa }</td>
                                                            <td>{formatearCapacidad(vehiculo.capacidad)}</td>
                                                            <td>
                                                                <div>{getEstadoBadge(vehiculo.estado)}</div>
                                                                <small className="text-muted">
                                                                    {vehiculo.estado === 'ACTIVO' ? 'Activo' : 
                                                                     vehiculo.estado === 'INACTIVO' ? 'Inactivo' : 
                                                                     vehiculo.estado || "Sin estado"}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-column gap-1">
                                                                    <Button 
                                                                        variant="outline-warning" 
                                                                        size="sm" 
                                                                        onClick={() => cambiarEstadoVehiculo(vehiculo.idVehiculos)}
                                                                        className="w-100"
                                                                    >
                                                                        {vehiculo.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default AdminVehiculos;