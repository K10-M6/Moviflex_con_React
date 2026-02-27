import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Image } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaEye, FaCar } from "react-icons/fa";
import fondo from "../Imagenes/AutoresContacto.png";

function AdminVehiculos() {
    const { token } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState("");
    const [validatingPlate, setValidatingPlate] = useState(false);

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

    async function cambiarEstadoVehiculo(id, estadoActual) {
        try {
            let nuevoEstado;

            switch (estadoActual) {
                case 'ACTIVO':
                    nuevoEstado = 'INACTIVO';
                    break;
                case 'INACTIVO':
                    nuevoEstado = 'ACTIVO';
                    break;
                default:
                    nuevoEstado = 'ACTIVO';
            }

            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/vehiculos/${id}/estado`, {
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

            await traerVehiculos();

        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del vehículo");
        }
    }

    async function validarPlaca(id, actual) {
        try {
            setValidatingPlate(true);
            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/vehiculos/${id}/validar-placa`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    validada: !actual
                })
            });

            if (!response.ok) throw new Error("Error al validar placa");

            await traerVehiculos();
        } catch (error) {
            console.error("Error al validar placa:", error);
            setError("Error al actualizar validación de placa");
        } finally {
            setValidatingPlate(false);
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

    function getEstadoBadge(estado) {
        switch (estado) {
            case 'ACTIVO':
                return <Badge bg="success" className="px-3 py-1">Activo</Badge>;
            case 'INACTIVO':
                return <Badge bg="danger" className="px-3 py-1">Inactivo</Badge>;
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
            default:
                return "outline-warning";
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
            minHeight: '100vh',
            backgroundImage: `url(${fondo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative'
        }}>
            {/* Capa de legibilidad */}
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(255, 255, 255, 0.92)', 
                zIndex: 0 
            }} />

            <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '5px solid #54c7b8' }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{ color: '#333' }}>Lista de Vehículos</h1>
                                <p className="text-muted mb-0 small">Administra los vehículos registrados en la plataforma</p>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2" style={{ backgroundColor: '#54c7b8', border: 'none' }}>
                                Total: {vehiculos.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2">
                                Activos: {vehiculos.filter(v => v.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2">
                                Inactivos: {vehiculos.filter(v => v.estado === 'INACTIVO').length}
                            </Badge>
                        </div>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow-sm">
                                <strong>Error:</strong> {error}
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col>
                        <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
                            <Card.Body>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" style={{ color: '#54c7b8' }} />
                                        <p className="mt-3 text-muted">Cargando vehículos...</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Propietario</th>
                                                <th>Vehículo</th>
                                                <th>Placa / Foto</th>
                                                <th>Capacidad</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehiculos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
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
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="fw-semibold">{vehiculo.placa}</span>
                                                                {vehiculo.placaValidada ? (
                                                                    <FaCheckCircle className="text-success" title="Placa Validada" />
                                                                ) : (
                                                                    <FaTimesCircle className="text-danger" title="Placa No Validada" />
                                                                )}
                                                            </div>
                                                            {vehiculo.fotoVehiculo && (
                                                                <Button
                                                                    variant="link"
                                                                    size="sm"
                                                                    className="p-0 text-decoration-none mt-1"
                                                                    onClick={() => {
                                                                        setSelectedPhoto(vehiculo.fotoVehiculo);
                                                                        setShowPhotoModal(true);
                                                                    }}
                                                                >
                                                                    <FaEye className="me-1" /> Ver Foto
                                                                </Button>
                                                            )}
                                                        </td>
                                                        <td>{formatearCapacidad(vehiculo.capacidad)}</td>
                                                        <td>
                                                            <div>{getEstadoBadge(vehiculo.estado)}</div>
                                                            <small className="text-muted">
                                                                {getEstadoTexto(vehiculo.estado)}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-2">
                                                                <Button
                                                                    variant={getBotonVariant(vehiculo.estado)}
                                                                    size="sm"
                                                                    onClick={() => cambiarEstadoVehiculo(vehiculo.idVehiculos, vehiculo.estado)}
                                                                    className="w-100"
                                                                >
                                                                    {getBotonTexto(vehiculo.estado)}
                                                                </Button>
                                                                <Button
                                                                    variant={vehiculo.placaValidada ? "outline-warning" : "outline-success"}
                                                                    size="sm"
                                                                    onClick={() => validarPlaca(vehiculo.idVehiculos, vehiculo.placaValidada)}
                                                                    className="w-100"
                                                                    disabled={validatingPlate}
                                                                >
                                                                    {vehiculo.placaValidada ? "Invalidar Placa" : "Validar Placa"}
                                                                </Button>
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

            {/* Modal para ver la foto del vehículo */}
            <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title><FaCar className="me-2" /> Foto del Vehículo</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center bg-dark p-0">
                    <Image src={selectedPhoto} fluid />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminVehiculos;