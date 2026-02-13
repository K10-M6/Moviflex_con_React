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
        try {
            setLoading(true);
            setError("");
            
            const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/conductores", {
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
            
            setConductores(data);
            
        } catch (error) {
            console.error("Error al traer conductores:", error);
            setError(error.message);
            setConductores([]);
        } finally {
            setLoading(false);
        }
    }

    async function cambiarEstadoConductor(id, estadoActual) {
        try {
            let nuevoEstado;
            

            switch (estadoActual) {
                case 'ACTIVO':
                    nuevoEstado = 'INACTIVO';
                    break;
                case 'INACTIVO':
                    nuevoEstado = 'ACTIVO';
                    break;
                case 'SUSPENDIDO':
                    nuevoEstado = 'ACTIVO';
                    break;
                default:
                    nuevoEstado = 'ACTIVO';
            }
            
            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    estado: nuevoEstado
                })
            });

            if (!response.ok) {
                throw new Error(`Error al cambiar estado: ${response.status}`);
            }
            
            await traerConductores();
            
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del conductor");
        }
    }

    async function suspenderConductor(id) {
        try {
            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    estado: 'SUSPENDIDO'
                })
            });

            if (!response.ok) {
                throw new Error(`Error al suspender conductor: ${response.status}`);
            }
            
            await traerConductores();
            
        } catch (error) {
            console.error("Error al suspender conductor:", error);
            setError("Error al suspender el conductor");
        }
    }
    
    function getEstadoBadge(estado) {
        switch (estado) {
            case 'ACTIVO':
                return <Badge bg="success" className="px-3 py-1">Activo</Badge>;
            case 'INACTIVO':
                return <Badge bg="danger" className="px-3 py-1">Inactivo</Badge>;
            case 'SUSPENDIDO':
                return <Badge bg="warning" text="dark" className="px-3 py-1">Suspendido</Badge>;
            default:
                return <Badge bg="light" text="dark" className="px-3 py-1">{estado || "Sin estado"}</Badge>;
        }
    }

    function getEstadoTexto(estado) {
        switch (estado) {
            case 'ACTIVO':
                return "Activo";
            case 'INACTIVO':
                return "Inactivo";
            case 'SUSPENDIDO':
                return "Suspendido";
            default:
                return estado || "Sin estado";
        }
    }

    function getBotonTexto(estado) {
        switch (estado) {
            case 'ACTIVO':
                return "Desactivar";
            case 'INACTIVO':
                return "Activar";
            case 'SUSPENDIDO':
                return "Reactivar";
            default:
                return "Cambiar Estado";
        }
    }

    function getBotonVariant(estado) {
        switch (estado) {
            case 'ACTIVO':
                return "outline-danger";
            case 'INACTIVO':
                return "outline-success";
            case 'SUSPENDIDO':
                return "outline-success";
            default:
                return "outline-warning";
        }
    }

    function puedeSuspender(estado) {
        return estado !== 'SUSPENDIDO';
    }
    
    function formatearFecha(fecha) {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatearTelefono(telefono) {
        if (!telefono) return <span className="text-muted">No especificado</span>;
        return telefono;
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
                        <h1 className="display-5 fw-bold">Lista de Conductores</h1>
                        <p className="text-muted">Administra los conductores registrados en la plataforma</p>
                        
                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2">
                                Total: {conductores.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2">
                                Activos: {conductores.filter(c => c.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2">
                                Inactivos: {conductores.filter(c => c.estado === 'INACTIVO').length}
                            </Badge>
                            <Badge bg="warning" text="dark" className="px-3 py-2">
                                Suspendidos: {conductores.filter(c => c.estado === 'SUSPENDIDO').length}
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
                                        <p className="mt-3">Cargando conductores...</p>
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
                                            {conductores.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
                                                        No hay conductores registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                conductores.map((conductor) => (
                                                    <tr key={conductor.idUsuarios}>
                                                        <td className="fw-semibold">{conductor.idUsuarios}</td>
                                                        <td>
                                                            <div className="fw-medium">{conductor.nombre}</div>
                                                            <small className="text-muted">ID: {conductor.idUsuarios}</small>
                                                        </td>
                                                        <td>{conductor.email}</td>
                                                        <td>{formatearTelefono(conductor.telefono)}</td>
                                                        <td>
                                                            <div>{getEstadoBadge(conductor.estado)}</div>
                                                            <small className="text-muted">
                                                                {getEstadoTexto(conductor.estado)}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div>{formatearFecha(conductor.creadoEn)}</div>
                                                            {conductor.actualizadoEn && conductor.actualizadoEn !== conductor.creadoEn && (
                                                                <small className="text-muted">
                                                                    Actualizado: {formatearFecha(conductor.actualizadoEn)}
                                                                </small>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-2">
                                                                <Button
                                                                    variant={getBotonVariant(conductor.estado)}
                                                                    size="sm"
                                                                    onClick={() => cambiarEstadoConductor(conductor.idUsuarios, conductor.estado)}
                                                                    className="w-100"
                                                                >
                                                                    {getBotonTexto(conductor.estado)}
                                                                </Button>
                                                                
                                                                {puedeSuspender(conductor.estado) && (
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        size="sm"
                                                                        onClick={() => suspenderConductor(conductor.idUsuarios)}
                                                                        className="w-100"
                                                                    >
                                                                        Suspender
                                                                    </Button>
                                                                )}
                                                            </div>
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

export default AdminConductores;