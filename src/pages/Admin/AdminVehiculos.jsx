import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Image, Form, InputGroup, Pagination } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaEye, FaCar } from "react-icons/fa";
import { BsSearch, BsXCircle } from "react-icons/bs";
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
    const [busqueda, setBusqueda] = useState("");
    const [buscando, setBuscando] = useState(false);
    
    // Estados para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 10;

    const traerUsuarios = useCallback(async () => {
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
    }, [token]);

    const traerVehiculos = useCallback(async () => {
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
            setPaginaActual(1); 

        } catch (error) {
            console.error("Error al traer vehículos:", error);
            setError(error.message);
            setVehiculos([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    async function handleSearch(e) {
        if (e) e.preventDefault();
        if (!busqueda.trim()) {
            traerVehiculos();
            return;
        }

        try {
            setLoading(true);
            setBuscando(true);
            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/auth/search?q=${busqueda}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!response.ok) throw new Error("Error en la búsqueda");
            const data = await response.json();


            const vehiculosEncontrados = [];
            data.forEach(usuario => {
                if (usuario.vehiculos && usuario.vehiculos.length > 0) {
                    usuario.vehiculos.forEach(v => {
                        vehiculosEncontrados.push({
                            ...v,
                            idUsuario: usuario.idUsuarios,
                            idVehiculos: v.idVehiculos || v.id
                        });
                    });
                }
            });

            setVehiculos(vehiculosEncontrados);
            setPaginaActual(1);
        } catch (error) {
            setError("Error al buscar vehículos");
        } finally {
            setLoading(false);
        }
    }

    function limpiarBusqueda() {
        setBusqueda("");
        setBuscando(false);
        traerVehiculos();
    }

    useEffect(() => {
        traerUsuarios();
        traerVehiculos();
    }, [traerUsuarios, traerVehiculos]);

    const vehiculosFiltrados = vehiculos.filter(vehiculo => {
        const terminoBusqueda = busqueda.toLowerCase();
        const nombrePropietario = obtenerNombreUsuario(vehiculo.idUsuario).toLowerCase();
        
        return (
            vehiculo.placa?.toLowerCase().includes(terminoBusqueda) ||
            nombrePropietario.includes(terminoBusqueda) ||
            vehiculo.marca?.toLowerCase().includes(terminoBusqueda) ||
            vehiculo.modelo?.toLowerCase().includes(terminoBusqueda) ||
            vehiculo.idVehiculos?.toString().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const vehiculosPaginados = vehiculosFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(vehiculosFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                return <Badge bg="secondary" className="px-3 py-1">{estado || "Sin estado"}</Badge>;
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
        if (!capacidad) return <span className="text-muted fst-italic">No especificado</span>;

        if (typeof capacidad === 'number' || !isNaN(parseInt(capacidad))) {
            const numCapacidad = parseInt(capacidad);
            return `${numCapacidad} ${numCapacidad === 1 ? 'persona' : 'personas'}`;
        }

        return capacidad;
    }

    function getTipoVehiculoBadge(tipo) {
        if (!tipo) return null;

        switch (tipo.toUpperCase()) {
            case 'AUTOMOVIL':
            case 'AUTO':
            case 'CARRO':
                return <Badge bg="info" className="px-2 py-1">Automóvil</Badge>;
            case 'MOTOCICLETA':
            case 'MOTO':
                return <Badge bg="secondary" className="px-2 py-1">Motocicleta</Badge>;
            case 'CAMIONETA':
            case 'SUV':
                return <Badge bg="primary" className="px-2 py-1">Camioneta</Badge>;
            case 'VAN':
            case 'FURGON':
                return <Badge bg="dark" className="px-2 py-1">Van</Badge>;
            default:
                return <Badge bg="light" text="dark" className="px-2 py-1">{tipo}</Badge>;
        }
    }

    const Paginacion = () => {
        if (totalPaginas <= 1) return null;

        let items = [];
        const maxBotones = 5;
        let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
        let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

        if (fin - inicio + 1 < maxBotones) {
            inicio = Math.max(1, fin - maxBotones + 1);
        }

        items.push(
            <Pagination.Prev
                key="prev"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
            />
        );

        if (inicio > 1) {
            items.push(
                <Pagination.Item key={1} onClick={() => cambiarPagina(1)}>
                    1
                </Pagination.Item>
            );
            if (inicio > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
            }
        }

        for (let numero = inicio; numero <= fin; numero++) {
            items.push(
                <Pagination.Item
                    key={numero}
                    active={numero === paginaActual}
                    onClick={() => cambiarPagina(numero)}
                >
                    {numero}
                </Pagination.Item>
            );
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
            }
            items.push(
                <Pagination.Item key={totalPaginas} onClick={() => cambiarPagina(totalPaginas)}>
                    {totalPaginas}
                </Pagination.Item>
            );
        }

        items.push(
            <Pagination.Next
                key="next"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
            />
        );

        return (
            <div className="d-flex justify-content-between align-items-center mt-4 px-4 pb-4">
                <div className="text-muted">
                    Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, vehiculosFiltrados.length)} de {vehiculosFiltrados.length} vehículos
                    {busqueda && ` (filtrados de ${vehiculos.length} totales)`}
                </div>
                <Pagination>{items}</Pagination>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url(${fondo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative'
        }}>
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
                                    Lista de Vehículos
                                </h1>
                                <p className="text-muted mb-0 small">
                                    <span style={{ color: '#51cfbd' }}>●</span> Administra los vehículos registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '12px' }}>
                            <Card.Body className="p-3">
                                <Form onSubmit={handleSearch}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <BsSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar por placa, propietario o marca/modelo..."
                                            value={busqueda}
                                            onChange={(e) => {
                                                setBusqueda(e.target.value);
                                                setPaginaActual(1);
                                            }}
                                            className="border-start-0"
                                        />
                                        {busqueda && (
                                            <Button variant="outline-secondary" className="border-start-0 border-end-0 bg-white" onClick={limpiarBusqueda}>
                                                <BsXCircle />
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            style={{ backgroundColor: '#54c7b8', border: 'none' }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2" style={{ backgroundColor: '#54c7b8', border: 'none' }}>
                                Total: {vehiculos.length}
                            </Badge>
                            {busqueda && (
                                <Badge bg="info" className="px-3 py-2">
                                    Resultados: {vehiculosFiltrados.length}
                                </Badge>
                            )}
                            <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Activos: {vehiculos.filter(v => v.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Inactivos: {vehiculos.filter(v => v.estado === 'INACTIVO').length}
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
                                        <p className="mt-3 text-muted">Cargando vehículos...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover className="align-middle mb-0">
                                                <thead style={{ 
                                                    backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                                    borderBottom: '2px solid #51cfbd'
                                                }}>
                                                    <tr>
                                                        <th className="py-3 px-4">ID</th>
                                                        <th className="py-3">Propietario</th>
                                                        <th className="py-3">Vehículo</th>
                                                        <th className="py-3">Placa / Foto</th>
                                                        <th className="py-3">Capacidad</th>
                                                        <th className="py-3">Estado</th>
                                                        <th className="py-3">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                    {vehiculosFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                                {busqueda ? "No se encontraron vehículos con esos criterios" : "No hay vehículos registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        vehiculosPaginados.map((vehiculo, index) => (
                                                            <tr key={vehiculo.idVehiculos} style={{
                                                                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                            }}>
                                                                <td className="fw-semibold px-4">{vehiculo.idVehiculos}</td>
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
                                                                    <div className="d-flex gap-1 mt-1 align-items-center">
                                                                        {getTipoVehiculoBadge(vehiculo.tipo)}
                                                                        {vehiculo.anio && (
                                                                            <small className="text-muted ms-1">({vehiculo.anio})</small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className="fw-semibold" style={{ fontSize: '1.05rem' }}>
                                                                            {vehiculo.placa}
                                                                        </span>
                                                                        {vehiculo.placaValidada ? (
                                                                            <FaCheckCircle className="text-success" title="Placa Validada" size={18} />
                                                                        ) : (
                                                                            <FaTimesCircle className="text-danger" title="Placa No Validada" size={18} />
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
                                                                            style={{
                                                                                color: '#51cfbd',
                                                                                transition: 'all 0.2s',
                                                                                fontWeight: '500'
                                                                            }}
                                                                        >
                                                                            <FaEye className="me-1" /> Ver Foto
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                                <td>{formatearCapacidad(vehiculo.capacidad)}</td>
                                                                <td>
                                                                    <div>{getEstadoBadge(vehiculo.estado)}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-2" style={{ minWidth: '130px' }}>
                                                                        <Button
                                                                            variant={getBotonVariant(vehiculo.estado)}
                                                                            size="sm"
                                                                            onClick={() => cambiarEstadoVehiculo(vehiculo.idVehiculos, vehiculo.estado)}
                                                                            className="w-100"
                                                                            style={{
                                                                                transition: 'all 0.2s',
                                                                                fontWeight: '500'
                                                                            }}
                                                                        >
                                                                            {getBotonTexto(vehiculo.estado)}
                                                                        </Button>
                                                                        <Button
                                                                            variant={vehiculo.placaValidada ? "outline-warning" : "outline-success"}
                                                                            size="sm"
                                                                            onClick={() => validarPlaca(vehiculo.idVehiculos, vehiculo.placaValidada)}
                                                                            className="w-100"
                                                                            disabled={validatingPlate}
                                                                            style={{
                                                                                transition: 'all 0.2s',
                                                                                fontWeight: '500'
                                                                            }}
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
                                        </div>
                                        <Paginacion />
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal para ver la foto del vehículo */}
            <Modal 
                show={showPhotoModal} 
                onHide={() => setShowPhotoModal(false)} 
                size="lg" 
                centered
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <Modal.Header 
                    closeButton 
                    style={{ 
                        borderBottom: '2px solid #51cfbd',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }}
                >
                    <Modal.Title style={{ color: '#2c3e50' }}>
                        <FaCar className="me-2" style={{ color: '#51cfbd' }} /> Foto del Vehículo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-0" style={{ backgroundColor: '#1a1a1a' }}>
                    <Image 
                        src={selectedPhoto} 
                        fluid 
                        style={{
                            maxHeight: '70vh',
                            width: 'auto',
                            margin: '0 auto'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Error+al+cargar+imagen";
                        }}
                    />
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowPhotoModal(false)}
                        style={{
                            backgroundColor: '#6c757d',
                            border: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminVehiculos;