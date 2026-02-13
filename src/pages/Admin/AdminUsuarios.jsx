import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

function AdminUsuarios() {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        traerUsuarios();
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
                if (response.status === 403) {
                    throw new Error("Acceso denegado. No tienes permisos de administrador.");
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error("La respuesta del servidor no es válida");
            }
            
            setUsuarios(data);
            
        } catch (error) {
            console.error("Error al traer usuarios:", error);
            setError(error.message);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }

    async function cambiarEstadoUsuario(id, estadoActual) {
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
            
            await traerUsuarios();
            
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del usuario");
        }
    }

    async function suspenderUsuario(id) {
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
                throw new Error(`Error al suspender usuario: ${response.status}`);
            }
            
            await traerUsuarios();
            
        } catch (error) {
            console.error("Error al suspender usuario:", error);
            setError("Error al suspender el usuario");
        }
    }

    function getRolNombre(rolId, rolNombre) {
        if (rolNombre) {
            switch (rolNombre.toUpperCase()) {
                case 'ADMINISTRADOR':
                case 'ADMIN':
                    return "Administrador";
                case 'CONDUCTOR':
                case 'DRIVER':
                    return "Conductor";
                case 'PASAJERO':
                case 'PASSENGER':
                case 'VIAJERO':
                    return "Viajero";
                default:
                    return rolNombre;
            }
        }
        
        switch (parseInt(rolId)) {
            case 1:
                return "Administrador";
            case 2:
                return "Conductor";
            case 3:
                return "Viajero";
            default:
                return `Rol ${rolId}`;
        }
    }

    function getRolBadge(rolId, rolNombre) {
        const nombre = getRolNombre(rolId, rolNombre);
        
        switch (nombre) {
            case "Administrador":
                return <Badge bg="primary">Administrador</Badge>;
            case "Conductor":
                return <Badge bg="info">Conductor</Badge>;
            case "Viajero":
                return <Badge bg="secondary">Viajero</Badge>;
            default:
                return <Badge bg="warning">{nombre}</Badge>;
        }
    }

    function formatearFecha(fecha) {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                        <h1 className="display-5 fw-bold">Lista de Usuarios</h1>
                        <p className="text-muted">Administra los usuarios registrados en la plataforma</p>
                        
                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2">
                                Total: {usuarios.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2">
                                Activos: {usuarios.filter(u => u.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2">
                                Inactivos: {usuarios.filter(u => u.estado === 'INACTIVO').length}
                            </Badge>
                            <Badge bg="warning" text="dark" className="px-3 py-2">
                                Suspendidos: {usuarios.filter(u => u.estado === 'SUSPENDIDO').length}
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
                                        <p className="mt-3">Cargando usuarios...</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Teléfono</th>
                                                <th>Rol</th>
                                                <th>Estado</th>
                                                <th>Registro</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        No hay usuarios registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                usuarios.map((usuario) => (
                                                    <tr key={usuario.idUsuarios}>
                                                        <td className="fw-semibold">{usuario.idUsuarios}</td>
                                                        <td>
                                                            <div className="fw-medium">{usuario.nombre}</div>
                                                            <small className="text-muted">ID: {usuario.idUsuarios}</small>
                                                        </td>
                                                        <td>{usuario.email}</td>
                                                        <td>{usuario.telefono || <span className="text-muted">No especificado</span>}</td>
                                                        <td>{getRolBadge(usuario.idRol, usuario.rol?.nombre)}</td>
                                                        <td>
                                                            <div>{getEstadoBadge(usuario.estado)}</div>
                                                            <small className="text-muted">
                                                                {getEstadoTexto(usuario.estado)}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div>{formatearFecha(usuario.creadoEn)}</div>
                                                            <small className="text-muted">
                                                                ID: {usuario.idUsuarios}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-2">
                                                                <Button
                                                                    variant={getBotonVariant(usuario.estado)}
                                                                    size="sm"
                                                                    onClick={() => cambiarEstadoUsuario(usuario.idUsuarios, usuario.estado)}
                                                                    className="w-100"
                                                                >
                                                                    {getBotonTexto(usuario.estado)}
                                                                </Button>
                                                                
                                                                {puedeSuspender(usuario.estado) && (
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        size="sm"
                                                                        onClick={() => suspenderUsuario(usuario.idUsuarios)}
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

export default AdminUsuarios;