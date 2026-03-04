import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from "react-bootstrap";
import fondo from "../Imagenes/AutoresContacto.png";

function AdminViajeros() {
    const { token } = useAuth();
    const [viajeros, setViajeros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        traerViajeros();
    }, []);
    
    async function traerViajeros() {
        try {
            setLoading(true);
            setError("");
            
            const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/pasajeros", {
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
            
            const viajerosFiltrados = data.filter(usuario => 
                usuario.idRol === 3 || 
                usuario.rol?.nombre?.toUpperCase() === 'VIAJERO' || 
                usuario.rol?.nombre?.toUpperCase() === 'PASAJERO' ||
                usuario.rol?.nombre?.toUpperCase() === 'PASSENGER'
            );
            
            setViajeros(viajerosFiltrados);
            
        } catch (error) {
            console.error("Error al traer viajeros:", error);
            setError(error.message);
            setViajeros([]);
        } finally {
            setLoading(false);
        }
    }
    
    async function cambiarEstadoViajero(id, estadoActual) {
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
            
            await traerViajeros();
            
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del viajero");
        }
    }
    
    async function suspenderViajero(id) {
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
                throw new Error(`Error al suspender viajero: ${response.status}`);
            }
            
            await traerViajeros();
            
        } catch (error) {
            console.error("Error al suspender viajero:", error);
            setError("Error al suspender el viajero");
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
                return <Badge bg="secondary" className="px-3 py-1">{estado || "Sin estado"}</Badge>;
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
        if (!telefono) return <span className="text-muted fst-italic">No especificado</span>;
        return telefono;
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url(${fondo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative'
        }}>
            {/* OVERLAY ELIMINADO - ahora se ve la imagen de fondo directamente */}

            <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow" style={{ 
                            borderRadius: '16px', 
                            borderLeft: '6px solid #51cfbd',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{ 
                                    color: '#2c3e50',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Lista de Viajeros
                                </h1>
                                <p className="text-muted mb-0 small">
                                    <span style={{ color: '#51cfbd' }}>●</span> Administra los viajeros registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>
                        
                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2" style={{ 
                                backgroundColor: '#51cfbd', 
                                border: 'none',
                                fontSize: '0.9rem'
                            }}>
                                Total: {viajeros.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Activos: {viajeros.filter(v => v.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Inactivos: {viajeros.filter(v => v.estado === 'INACTIVO').length}
                            </Badge>
                            <Badge bg="warning" text="dark" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Suspendidos: {viajeros.filter(v => v.estado === 'SUSPENDIDO').length}
                            </Badge>
                        </div>
                    </Col>
                </Row>
                
                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow">
                                <strong>Error:</strong> {error}
                            </Alert>
                        </Col>
                    </Row>
                )}
                
                <Row>
                    <Col>
                        <Card className="shadow border-0" style={{ 
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" style={{ color: '#51cfbd' }} />
                                        <p className="mt-3 text-muted">Cargando viajeros...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle mb-0">
                                            <thead style={{ 
                                                backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                                borderBottom: '2px solid #51cfbd'
                                            }}>
                                                <tr>
                                                    <th className="py-3 px-4">ID</th>
                                                    <th className="py-3">Nombre</th>
                                                    <th className="py-3">Email</th>
                                                    <th className="py-3">Teléfono</th>
                                                    <th className="py-3">Estado</th>
                                                    <th className="py-3">Registro</th>
                                                    <th className="py-3">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                {viajeros.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4 text-muted">
                                                            No hay viajeros registrados
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    viajeros.map((viajero, index) => (
                                                        <tr key={viajero.idUsuarios} style={{
                                                            backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                        }}>
                                                            <td className="fw-semibold px-4">{viajero.idUsuarios}</td>
                                                            <td>
                                                                <div className="fw-medium">{viajero.nombre}</div>
                                                                <small className="text-muted">ID: {viajero.idUsuarios}</small>
                                                            </td>
                                                            <td>{viajero.email}</td>
                                                            <td>{formatearTelefono(viajero.telefono)}</td>
                                                            <td>
                                                                <div>{getEstadoBadge(viajero.estado)}</div>
                                                            </td>
                                                            <td>
                                                                <div>{formatearFecha(viajero.creadoEn)}</div>
                                                                {viajero.actualizadoEn && viajero.actualizadoEn !== viajero.creadoEn && (
                                                                    <small className="text-muted d-block">
                                                                        Actualizado: {formatearFecha(viajero.actualizadoEn)}
                                                                    </small>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                                                                    <Button
                                                                        variant={getBotonVariant(viajero.estado)}
                                                                        size="sm"
                                                                        onClick={() => cambiarEstadoViajero(viajero.idUsuarios, viajero.estado)}
                                                                        className="w-100"
                                                                        style={{
                                                                            transition: 'all 0.2s',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        {getBotonTexto(viajero.estado)}
                                                                    </Button>
                                                                    
                                                                    {puedeSuspender(viajero.estado) && (
                                                                        <Button
                                                                            variant="outline-warning"
                                                                            size="sm"
                                                                            onClick={() => suspenderViajero(viajero.idUsuarios)}
                                                                            className="w-100"
                                                                            style={{
                                                                                transition: 'all 0.2s',
                                                                                fontWeight: '500'
                                                                            }}
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

export default AdminViajeros;