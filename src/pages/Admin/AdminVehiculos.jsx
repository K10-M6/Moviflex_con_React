import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

function AdminVehiculos() {
    const { token } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
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
            
            if (!Array.isArray(data)) {
                throw new Error("La respuesta del servidor no es válida");
            }
            
            setUsuarios(data);
        } catch (error) {
            console.error("Error al traer usuarios:", error);
            setError("Error al cargar la información de propietarios");
        }
    }
    
    async function traerVehiculos() {
        try {
            setLoading(true);
            setError("");
            
            const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/vehiculos/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
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

    async function eliminarVehiculo(id) {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.")) {
            return;
        }
        
        try {
            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/vehiculos/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            
            await traerVehiculos();
            
        } catch (error) {
            console.error("Error al eliminar vehículo:", error);
            setError("Error al eliminar el vehículo: " + error.message);
        }
    }
    
    function obtenerNombreUsuario(idUsuario) {
        if (!idUsuario) return "Sin propietario";
        
        const usuario = usuarios.find(u => u.idUsuarios === idUsuario);
        
        if (usuario) {
            return usuario.nombre;
        } else if (usuarios.length > 0) {
            return `Usuario #${idUsuario} (No encontrado)`;
        } else {
            return `Usuario #${idUsuario}`;
        }
    }

    function formatearCapacidad(capacidad) {
        if (!capacidad) return <span className="text-muted">No especificado</span>;
        
        if (typeof capacidad === 'number' || !isNaN(parseInt(capacidad))) {
            const numCapacidad = parseInt(capacidad);
            return `${numCapacidad} ${numCapacidad === 1 ? 'persona' : 'personas'}`;
        }
        
        return capacidad;
    }

    function formatearFecha(fecha) {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getTipoVehiculoBadge(tipo) {
        if (!tipo) return null;
        
        switch (tipo.toUpperCase()) {
            case 'AUTOMOVIL':
            case 'AUTO':
            case 'CARRO':
                return <Badge bg="info" className="px-2">Automóvil</Badge>;
            case 'MOTOCICLETA':
            case 'MOTO':
                return <Badge bg="secondary" className="px-2">Motocicleta</Badge>;
            case 'CAMIONETA':
            case 'SUV':
                return <Badge bg="primary" className="px-2">Camioneta</Badge>;
            case 'VAN':
            case 'FURGON':
                return <Badge bg="dark" className="px-2">Van</Badge>;
            default:
                return <Badge bg="light" text="dark" className="px-2">{tipo}</Badge>;
        }
    }

    return (
        <div style={{
            background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)',
            width: '100%',
            height: '100%',
            padding: '24px'
        }}>
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Lista de Vehículos</h1>
                        <p className="text-muted">Administra los vehículos registrados en la plataforma</p>
                        
                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2">
                                Total: {vehiculos.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2">
                                Activos: {vehiculos.filter(v => v.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="secondary" className="px-3 py-2">
                                Inactivos: {vehiculos.filter(v => v.estado !== 'ACTIVO').length}
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
                                                <th>Vehículo</th>
                                                <th>Placa</th>
                                                <th>Capacidad</th>
                                                <th>Estado</th>
                                                <th>Registro</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehiculos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        No hay vehículos registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                vehiculos.map((vehiculo) => (
                                                    <tr key={vehiculo.idVehiculos}>
                                                        <td className="fw-semibold">{vehiculo.idVehiculos}</td>
                                                        <td>
                                                            <div className="fw-medium">
                                                                {obtenerNombreUsuario(vehiculo.idUsuario)}
                                                            </div>
                                                            <small className="text-muted">
                                                                ID: {vehiculo.idUsuario}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="fw-medium">
                                                                {vehiculo.marca} {vehiculo.modelo}
                                                            </div>
                                                            <div className="d-flex gap-1 mt-1">
                                                                {getTipoVehiculoBadge(vehiculo.tipo)}
                                                                {vehiculo.anio && (
                                                                    <small className="text-muted">{vehiculo.anio}</small>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="fw-semibold">{vehiculo.placa}</span>
                                                            {vehiculo.color && (
                                                                <div>
                                                                    <small className="text-muted">{vehiculo.color}</small>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{formatearCapacidad(vehiculo.capacidad)}</td>
                                                        <td>
                                                            <Badge bg={vehiculo.estado === 'ACTIVO' ? 'success' : 'secondary'} className="px-3 py-1">
                                                                {vehiculo.estado || 'Sin estado'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div>{formatearFecha(vehiculo.creadoEn)}</div>
                                                            {vehiculo.actualizadoEn && vehiculo.actualizadoEn !== vehiculo.creadoEn && (
                                                                <small className="text-muted">
                                                                    Actualizado: {formatearFecha(vehiculo.actualizadoEn)}
                                                                </small>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => eliminarVehiculo(vehiculo.idVehiculos)}
                                                                className="w-100"
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
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
    );
}

export default AdminVehiculos;