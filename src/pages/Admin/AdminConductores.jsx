import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Form, InputGroup } from "react-bootstrap";
import { BsSearch, BsXCircle } from "react-icons/bs";
import fondo from "../Imagenes/AutoresContacto.png";

function AdminConductores() {
    const { token } = useAuth();
    const [conductores, setConductores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    const elementosPorPagina = 10;

    useEffect(() => {
        traerConductores();
    }, []);

    const conductoresFiltrados = conductores.filter(conductor => {
        const terminoBusqueda = busqueda.toLowerCase();
        return (
            conductor.email?.toLowerCase().includes(terminoBusqueda) ||
            conductor.nombre?.toLowerCase().includes(terminoBusqueda) ||
            conductor.idUsuarios?.toString().includes(terminoBusqueda) ||
            conductor.telefono?.toLowerCase().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const conductoresPaginados = conductoresFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(conductoresFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    async function traerConductores() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/auth/conductores`, {
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
            setPaginaActual(1);

        } catch (error) {
            console.error("Error al traer conductores:", error);
            setError(error.message);
            setConductores([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch(e) {
        if (e) e.preventDefault();
        if (!busqueda.trim()) {
            traerConductores();
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/search?q=${busqueda}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!response.ok) throw new Error("Error en la búsqueda");
            const data = await response.json();

            const soloConductores = data.filter(u =>
                u.rol?.nombre === 'CONDUCTOR' || u.idRol === 2
            );

            setConductores(soloConductores);
            setPaginaActual(1);
        } catch (error) {
            setError("Error al buscar conductores");
        } finally {
            setLoading(false);
        }
    }

    function limpiarBusqueda() {
        setBusqueda("");
        traerConductores();
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

            const response = await fetch(`${API_URL}/auth/${id}/estado`, {
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
            const response = await fetch(`${API_URL}/auth/${id}/estado`, {
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

    const EstadoBadge = ({ estado }) => {
        const estilos = {
            ACTIVO: { backgroundColor: '#62d8d9', color: '#ffffff' },
            INACTIVO: { backgroundColor: '#cccbd2af', color: '#113d69' },
            SUSPENDIDO: { backgroundColor: '#113d69', color: '#ffffff' }
        };

        const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

        return (
            <span style={{
                ...estilo,
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {estado === 'ACTIVO' && 'Activo'}
                {estado === 'INACTIVO' && 'Inactivo'}
                {estado === 'SUSPENDIDO' && 'Suspendido'}
                {!estado && 'Sin estado'}
            </span>
        );
    };

    const StatsBadge = ({ children, color, bgColor, isWhite = false }) => {
        if (isWhite) {
            return (
                <span style={{
                    backgroundColor: '#ffffff',
                    color: '#62d8d9',
                    border: '1px solid #62d8d9',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'inline-block'
                }}>
                    {children}
                </span>
            );
        }

        return (
            <span style={{
                backgroundColor: bgColor,
                color: color,
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {children}
            </span>
        );
    };

    const AccionButton = ({ estado, onClick, children }) => {
        if (children === "Suspender") {
            return (
                <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={onClick}
                    className="w-100"
                    style={{
                        transition: 'all 0.2s',
                        fontWeight: '500',
                        color: '#113d69',
                        borderColor: '#113d69',
                        backgroundColor: estado === 'SUSPENDIDO' ? '#113d69' : 'transparent',
                    }}
                >
                    Suspender
                </Button>
            );
        }

        const getButtonStyle = () => {
            if (estado === 'ACTIVO') {
                return {
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9'
                };
            } else if (estado === 'INACTIVO' || estado === 'SUSPENDIDO') {
                return {
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            }
            return {
                backgroundColor: 'transparent',
                color: '#62d8d9',
                borderColor: '#62d8d9'
            };
        };

        return (
            <Button
                variant={estado === 'ACTIVO' ? "primary" : "outline-primary"}
                size="sm"
                onClick={onClick}
                className="w-100"
                style={{
                    transition: 'all 0.2s',
                    fontWeight: '500',
                    ...getButtonStyle()
                }}
            >
                {children}
            </Button>
        );
    };

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

    const Paginacion = () => {
        if (totalPaginas <= 1) return null;

        const generarBotones = () => {
            const botones = [];
            const maxBotones = window.innerWidth < 768 ? 3 : 5;
            let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
            let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

            if (fin - inicio + 1 < maxBotones) {
                inicio = Math.max(1, fin - maxBotones + 1);
            }

            const buttonStyle = {
                padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.5rem 0.75rem',
                fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem',
            };

            botones.push(
                <button
                    key="prev"
                    onClick={() => paginaActual > 1 && cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    style={{
                        ...buttonStyle,
                        backgroundColor: paginaActual === 1 ? '#e9ecef' : 'white',
                        color: paginaActual === 1 ? '#6c757d' : '#62d8d9',
                        border: `1px solid ${paginaActual === 1 ? '#dee2e6' : '#62d8d9'}`,
                        margin: '0 2px',
                        borderRadius: '0.375rem 0 0 0.375rem',
                        cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: paginaActual === 1 ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (paginaActual !== 1) {
                            e.target.style.backgroundColor = '#62d8d9';
                            e.target.style.color = 'white';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (paginaActual !== 1) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#62d8d9';
                        }
                    }}
                >
                    {window.innerWidth < 768 ? '‹' : 'Anterior'}
                </button>
            );

            if (inicio > 1) {
                botones.push(
                    <button
                        key={1}
                        onClick={() => cambiarPagina(1)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: 'white',
                            color: '#62d8d9',
                            border: '1px solid #62d8d9',
                            margin: '0 2px',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#62d8d9';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#62d8d9';
                        }}
                    >
                        1
                    </button>
                );
                if (inicio > 2) {
                    botones.push(
                        <span
                            key="ellipsis1"
                            style={{
                                ...buttonStyle,
                                backgroundColor: 'transparent',
                                color: '#113d69',
                                border: 'none',
                                margin: '0 2px',
                                fontWeight: '500'
                            }}
                        >
                            ...
                        </span>
                    );
                }
            }

            for (let numero = inicio; numero <= fin; numero++) {
                const esActivo = numero === paginaActual;
                botones.push(
                    <button
                        key={numero}
                        onClick={() => !esActivo && cambiarPagina(numero)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: esActivo ? '#62d8d9' : 'white',
                            color: esActivo ? 'white' : '#62d8d9',
                            border: '1px solid #62d8d9',
                            margin: '0 2px',
                            borderRadius: '0.375rem',
                            cursor: esActivo ? 'default' : 'pointer',
                            fontWeight: esActivo ? '600' : '500',
                            transition: 'all 0.2s',
                            boxShadow: esActivo ? '0 2px 4px rgba(98, 216, 217, 0.3)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (!esActivo) {
                                e.target.style.backgroundColor = '#62d8d9';
                                e.target.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!esActivo) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#62d8d9';
                            }
                        }}
                    >
                        {numero}
                    </button>
                );
            }

            if (fin < totalPaginas) {
                if (fin < totalPaginas - 1) {
                    botones.push(
                        <span
                            key="ellipsis2"
                            style={{
                                ...buttonStyle,
                                backgroundColor: 'transparent',
                                color: '#113d69',
                                border: 'none',
                                margin: '0 2px',
                                fontWeight: '500'
                            }}
                        >
                            ...
                        </span>
                    );
                }
                botones.push(
                    <button
                        key={totalPaginas}
                        onClick={() => cambiarPagina(totalPaginas)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: 'white',
                            color: '#62d8d9',
                            border: '1px solid #62d8d9',
                            margin: '0 2px',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#62d8d9';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#62d8d9';
                        }}
                    >
                        {totalPaginas}
                    </button>
                );
            }

            botones.push(
                <button
                    key="next"
                    onClick={() => paginaActual < totalPaginas && cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    style={{
                        ...buttonStyle,
                        backgroundColor: paginaActual === totalPaginas ? '#e9ecef' : 'white',
                        color: paginaActual === totalPaginas ? '#6c757d' : '#62d8d9',
                        border: `1px solid ${paginaActual === totalPaginas ? '#dee2e6' : '#62d8d9'}`,
                        margin: '0 2px',
                        borderRadius: '0 0.375rem 0.375rem 0',
                        cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: paginaActual === totalPaginas ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (paginaActual !== totalPaginas) {
                            e.target.style.backgroundColor = '#62d8d9';
                            e.target.style.color = 'white';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (paginaActual !== totalPaginas) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#62d8d9';
                        }
                    }}
                >
                    {window.innerWidth < 768 ? '›' : 'Siguiente'}
                </button>
            );

            return botones;
        };

        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 px-4 pb-4" style={{ gap: '1rem' }}>
                <div className="text-muted text-center text-md-start" style={{ color: '#113d69', fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>
                    Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, conductoresFiltrados.length)} de {conductoresFiltrados.length} conductores
                    {busqueda && ` (filtrados de ${conductores.length} totales)`}
                </div>
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {generarBotones()}
                </div>
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
            <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow" style={{
                            borderRadius: '16px',
                            borderLeft: '6px solid #62d8d9',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{
                                    color: '#113d69',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Lista de Conductores
                                </h1>
                                <p className="mb-0 small" style={{ color: '#113d69' }}>
                                    <span style={{ color: '#62d8d9' }}>●</span> Administra los conductores registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '12px' }}>
                            <Card.Body className="p-3">
                                <Form onSubmit={handleSearch}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <BsSearch style={{ color: '#113d69' }} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar por nombre, email, teléfono o ID..."
                                            value={busqueda}
                                            onChange={(e) => {
                                                setBusqueda(e.target.value);
                                                setPaginaActual(1);
                                            }}
                                            className="border-start-0"
                                            style={{ color: '#113d69' }}
                                        />
                                        {busqueda && (
                                            <Button variant="outline-secondary" className="border-start-0 border-end-0 bg-white" onClick={limpiarBusqueda}>
                                                <BsXCircle style={{ color: '#113d69' }} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            style={{ backgroundColor: '#62d8d9', border: 'none', color: '#ffffff' }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <StatsBadge bgColor="transparent" color="#113d69">
                                Total: {conductores.length}
                            </StatsBadge>
                            {busqueda && (
                                <StatsBadge isWhite>
                                    Resultados: {conductoresFiltrados.length}
                                </StatsBadge>
                            )}
                            <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                Activos: {conductores.filter(v => v.estado === 'ACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#cccbd2af" color="#113d69">
                                Inactivos: {conductores.filter(v => v.estado === 'INACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#113d69" color="#ffffff">
                                Suspendidos: {conductores.filter(v => v.estado === 'SUSPENDIDO').length}
                            </StatsBadge>
                        </div>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow" style={{ backgroundColor: '#cccbd2af', color: '#113d69' }}>
                                <strong style={{ color: '#113d69' }}>Error:</strong> <span style={{ color: '#113d69' }}>{error}</span>
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
                                        <Spinner animation="border" style={{ color: '#62d8d9' }} />
                                        <p className="mt-3" style={{ color: '#113d69' }}>Cargando conductores...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover className="align-middle mb-0">
                                                <thead style={{
                                                    backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                                    borderBottom: '2px solid #62d8d9'
                                                }}>
                                                    <tr>
                                                        <th className="py-3 px-4" style={{ color: '#113d69' }}>ID</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Nombre</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Email</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Teléfono</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Estado</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Registro</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                    {conductoresFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4" style={{ color: '#113d69' }}>
                                                                {busqueda ? "No se encontraron conductores con esos criterios" : "No hay conductores registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        conductoresPaginados.map((conductor, index) => (
                                                            <tr key={conductor.idUsuarios} style={{
                                                                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                            }}>
                                                                <td className="fw-semibold px-4" style={{ color: '#113d69' }}>{conductor.idUsuarios}</td>
                                                                <td>
                                                                    <div className="fw-medium" style={{ color: '#113d69' }}>{conductor.nombre}</div>
                                                                    <small className="text-muted">ID: {conductor.idUsuarios}</small>
                                                                </td>
                                                                <td style={{ color: '#113d69' }}>{conductor.email}</td>
                                                                <td style={{ color: '#113d69' }}>{formatearTelefono(conductor.telefono)}</td>
                                                                <td>
                                                                    <EstadoBadge estado={conductor.estado} />
                                                                </td>
                                                                <td>
                                                                    <div style={{ color: '#113d69' }}>{formatearFecha(conductor.creadoEn)}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                                                                        <AccionButton
                                                                            estado={conductor.estado}
                                                                            onClick={() => cambiarEstadoConductor(conductor.idUsuarios, conductor.estado)}
                                                                        >
                                                                            {getBotonTexto(conductor.estado)}
                                                                        </AccionButton>

                                                                        {puedeSuspender(conductor.estado) && (
                                                                            <AccionButton
                                                                                estado={conductor.estado}
                                                                                onClick={() => suspenderConductor(conductor.idUsuarios)}
                                                                            >
                                                                                Suspender
                                                                            </AccionButton>
                                                                        )}
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
        </div>
    );
}

export default AdminConductores;