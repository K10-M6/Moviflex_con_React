import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Pagination, Form, InputGroup } from "react-bootstrap";
import { BsSearch, BsXCircle } from "react-icons/bs";
import fondo from "../Imagenes/AutoresContacto.png";


function AdminUsuarios() {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [buscando, setBuscando] = useState(false);

    const elementosPorPagina = 10;

    useEffect(() => {
        traerUsuarios();
    }, []);
    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const usuariosPaginados = usuarios.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(usuarios.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            setPaginaActual(1);

        } catch (error) {
            console.error("Error al traer usuarios:", error);
            setError(error.message);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch(e) {
        if (e) e.preventDefault();
        if (!busqueda.trim()) {
            traerUsuarios();
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
            setUsuarios(data);
            setPaginaActual(1);
        } catch (error) {
            setError("Error al buscar usuarios");
        } finally {
            setLoading(false);
        }
    }

    function limpiarBusqueda() {
        setBusqueda("");
        setBuscando(false);
        traerUsuarios();
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
                return <Badge bg="primary" className="px-3 py-1">Administrador</Badge>;
            case "Conductor":
                return <Badge bg="info" className="px-3 py-1">Conductor</Badge>;
            case "Viajero":
                return <Badge bg="secondary" className="px-3 py-1">Viajero</Badge>;
            default:
                return <Badge bg="warning" className="px-3 py-1">{nombre}</Badge>;
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
                return <Badge bg="secondary" className="px-3 py-1">{estado || "Sin estado"}</Badge>;
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
            <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                    Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, usuarios.length)} de {usuarios.length} usuarios
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
                                    Lista de Usuarios
                                </h1>
                                <p className="text-muted mb-0 small">
                                    <span style={{ color: '#51cfbd' }}>●</span> Administra los usuarios registrados en la plataforma
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
                                            placeholder="Buscar por nombre, email, placa o identificación..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
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
                                Total: {usuarios.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Activos: {usuarios.filter(u => u.estado === 'ACTIVO').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Inactivos: {usuarios.filter(u => u.estado === 'INACTIVO').length}
                            </Badge>
                            <Badge bg="warning" text="dark" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                Suspendidos: {usuarios.filter(u => u.estado === 'SUSPENDIDO').length}
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
                                        <p className="mt-3 text-muted">Cargando usuarios...</p>
                                    </div>
                                ) : (
                                    <>
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
                                                    usuariosPaginados.map((usuario) => (
                                                        <tr key={usuario.idUsuarios}>
                                                            <td className="fw-semibold">{usuario.idUsuarios}</td>
                                                            <td>
                                                                <div className="fw-medium">{usuario.nombre}</div>
                                                                <small className="text-muted">ID: {usuario.idUsuarios}</small>
                                                            </td>
                                                            <td>{usuario.email}</td>
                                                            <td>{usuario.telefono || <span className="text-muted">No especificado</span>}</td>
                                                            <td>{getRolBadge(usuario.idRol, usuario.rol?.nombre)}</td>
                                                            <td>{getEstadoBadge(usuario.estado)}</td>
                                                            <td>
                                                                <div>{formatearFecha(usuario.creadoEn)}</div>
                                                                {usuario.actualizadoEn && usuario.actualizadoEn !== usuario.creadoEn && (
                                                                    <small className="text-muted">
                                                                        Actualizado: {formatearFecha(usuario.actualizadoEn)}
                                                                    </small>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                                                                    <Button
                                                                        variant={getBotonVariant(usuario.estado)}
                                                                        size="sm"
                                                                        onClick={() => cambiarEstadoUsuario(usuario.idUsuarios, usuario.estado)}
                                                                        className="w-100"
                                                                        style={{
                                                                            transition: 'all 0.2s',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        {getBotonTexto(usuario.estado)}
                                                                    </Button>
                                                                    
                                                                    {puedeSuspender(usuario.estado) && (
                                                                        <Button
                                                                            variant="outline-warning"
                                                                            size="sm"
                                                                            onClick={() => suspenderUsuario(usuario.idUsuarios)}
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

                                        <Paginacion />
                                    </>
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