import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

function AdminConductores() {
    const { token } = useAuth();
    const [conductores, setConductores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        traerConductores();
    }, []);
    
    async function traerConductores() {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/conductores", {
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
            setConductores(data);
        } catch (err) {
            console.error("Error al cargar conductores:", err);
            setError("Error al cargar la lista de conductores");
        } finally {
            setLoading(false);
        }
    }

    async function cambiarEstadoConductor(id) {
        try {
            const response = await fetch(`https://backendmovi-production.up.railway.app/api/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            
            if (response.ok) {
                // Actualizar la lista después del cambio
                traerConductores();
            } else {
                alert("Error al cambiar el estado del conductor");
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            alert("Error de conexión al cambiar estado");
        }
    }
    
    function getEstadoBadge(estado) {
        switch(estado) {
            case 'ACTIVO':
                return <Badge bg="success">Activo</Badge>;
            case 'SUSPENDIDO':
                return <Badge bg="danger">Suspendido</Badge>;
            case 'INACTIVO':
                return <Badge bg="secondary">Inactivo</Badge>;
            default:
                return <Badge bg="warning" text="dark">{estado}</Badge>;
        }
    }
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <div style={{
            background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
            minHeight: '100vh',
            minWidth: '95vw'
        }}>
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Gestión de Conductores</h1>
                        <p className="text-muted">Administra todos los conductores registrados en la plataforma</p>
                    </Col>
                </Row>
                
                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger">{error}</Alert>
                        </Col>
                    </Row>
                )}
                
                <Row>
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-3">Cargando conductores...</p>
                                    </div>
                                ) : conductores.length === 0 ? (
                                    <div className="text-center py-5">
                                        <p className="text-muted">No hay conductores registrados</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Teléfono</th>
                                                <th>Estado</th>
                                                <th>Registro</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {conductores.map((conductor) => (
                                                <tr key={conductor.idUsuarios}>
                                                    <td className="fw-semibold">{conductor.idUsuarios}</td>
                                                    <td>{conductor.nombre}</td>
                                                    <td>{conductor.email}</td>
                                                    <td>{conductor.telefono || "No especificado"}</td>
                                                    <td>{getEstadoBadge(conductor.estado)}</td>
                                                    <td>{formatearFecha(conductor.creadoEn)}</td>
                                                    <td>
                                                        <Button 
                                                            variant={conductor.estado === 'ACTIVO' ? "outline-danger" : "outline-success"}
                                                            size="sm"
                                                            onClick={() => cambiarEstadoConductor(conductor.idUsuarios)}
                                                        >
                                                            {conductor.estado === 'ACTIVO' ? 'Suspender' : 'Activar'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                                
                                {!loading && conductores.length > 0 && (
                                    <div className="mt-3 text-end">
                                        <small className="text-muted">
                                            Total: {conductores.length} conductor{conductores.length !== 1 ? 'es' : ''}
                                        </small>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default AdminConductores;