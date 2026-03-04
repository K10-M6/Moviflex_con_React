import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Pagination, Form, InputGroup } from "react-bootstrap";
import { BsSearch, BsXCircle } from "react-icons/bs";
import fondo from "../Imagenes/AutoresContacto.png";

function AdminViajeros() {
    const { token } = useAuth();
    const [viajeros, setViajeros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [buscando, setBuscando] = useState(false);
    
    const elementosPorPagina = 10;

    useEffect(() => {
        traerViajeros();
    }, []);
    
    const viajerosFiltrados = viajeros.filter(viajero => {
        const terminoBusqueda = busqueda.toLowerCase();
        return (
            viajero.email?.toLowerCase().includes(terminoBusqueda) ||
            viajero.nombre?.toLowerCase().includes(terminoBusqueda) ||
            viajero.idUsuarios?.toString().includes(terminoBusqueda) ||
            viajero.telefono?.toLowerCase().includes(terminoBusqueda)
        );
    });
    
    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const viajerosPaginados = viajerosFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(viajerosFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
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
            setPaginaActual(1);
            
        } catch (error) {
            console.error("Error al traer viajeros:", error);
            setError(error.message);
            setViajeros([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch(e) {
        if (e) e.preventDefault();
        if (!busqueda.trim()) {
            traerViajeros();
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

            const soloViajeros = data.filter(u =>
                u.idRol === 3 || 
                u.rol?.nombre?.toUpperCase() === 'VIAJERO' || 
                u.rol?.nombre?.toUpperCase() === 'PASAJERO' ||
                u.rol?.nombre?.toUpperCase() === 'PASSENGER'
            );

            setViajeros(soloViajeros);
            setPaginaActual(1);
        } catch (error) {
            setError("Error al buscar viajeros");
        } finally {
            setLoading(false);
        }
    }

    function limpiarBusqueda() {
        setBusqueda("");
        setBuscando(false);
        traerViajeros();
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
    
    const EstadoBadge = ({ estado }) => {
        const estilos = {
            ACTIVO: { backgroundColor: '#62d8d9', color: '#113d69' },
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
                style={{ color: '#62d8d9 !important' }}
            />
        );
        if (inicio > 1) {
            items.push(
                <Pagination.Item 
                    key={1} 
                    onClick={() => cambiarPagina(1)}
                    style={{ color: '#62d8d9 !important' }}
                >
                    1
                </Pagination.Item>
            );
            if (inicio > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis1" disabled style={{ color: '#62d8d9 !important' }} />);
            }
        }

        for (let numero = inicio; numero <= fin; numero++) {
            items.push(
                <Pagination.Item
                    key={numero}
                    active={numero === paginaActual}
                    onClick={() => cambiarPagina(numero)}
                    style={{ 
                        color: numero === paginaActual ? '#ffffff !important' : '#62d8d9 !important',
                        backgroundColor: numero === paginaActual ? '#62d8d9 !important' : 'transparent',
                        borderColor: '#62d8d9 !important'
                    }}
                >
                    {numero}
                </Pagination.Item>
            );
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis2" disabled style={{ color: '#62d8d9 !important' }} />);
            }
            items.push(
                <Pagination.Item 
                    key={totalPaginas} 
                    onClick={() => cambiarPagina(totalPaginas)}
                    style={{ color: '#62d8d9 !important' }}
                >
                    {totalPaginas}
                </Pagination.Item>
            );
        }
        items.push(
            <Pagination.Next
                key="next"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                style={{ color: '#62d8d9 !important' }}
            />
        );

        return (
            <div className="d-flex justify-content-between align-items-center mt-4 px-4 pb-4">
                <div className="text-muted" style={{ color: '#113d69' }}>
                    Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, viajerosFiltrados.length)} de {viajerosFiltrados.length} viajeros
                    {busqueda && ` (filtrados de ${viajeros.length} totales)`}
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
                                    Lista de Viajeros
                                </h1>
                                <p className="mb-0 small" style={{ color: '#113d69' }}>
                                    <span style={{ color: '#62d8d9' }}>●</span> Administra los viajeros registrados en la plataforma
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
                                            style={{ backgroundColor: '#62d8d9', border: 'none', color: '#113d69' }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>
                        
                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <StatsBadge bgColor="transparent" color="#113d69">
                                Total: {viajeros.length}
                            </StatsBadge>
                            {busqueda && (
                                <StatsBadge isWhite>
                                    Resultados: {viajerosFiltrados.length}
                                </StatsBadge>
                            )}
                            <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                Activos: {viajeros.filter(v => v.estado === 'ACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#cccbd2af" color="#113d69">
                                Inactivos: {viajeros.filter(v => v.estado === 'INACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#113d69" color="#ffffff">
                                Suspendidos: {viajeros.filter(v => v.estado === 'SUSPENDIDO').length}
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
                                        <p className="mt-3" style={{ color: '#113d69' }}>Cargando viajeros...</p>
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
                                                    {viajerosFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4" style={{ color: '#113d69' }}>
                                                                {busqueda ? "No se encontraron viajeros con esos criterios" : "No hay viajeros registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        viajerosPaginados.map((viajero, index) => (
                                                            <tr key={viajero.idUsuarios} style={{
                                                                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                            }}>
                                                                <td className="fw-semibold px-4" style={{ color: '#113d69' }}>{viajero.idUsuarios}</td>
                                                                <td>
                                                                    <div className="fw-medium" style={{ color: '#113d69' }}>{viajero.nombre}</div>
                                                                    <small className="text-muted">ID: {viajero.idUsuarios}</small>
                                                                </td>
                                                                <td style={{ color: '#113d69' }}>{viajero.email}</td>
                                                                <td style={{ color: '#113d69' }}>{formatearTelefono(viajero.telefono)}</td>
                                                                <td>
                                                                    <EstadoBadge estado={viajero.estado} />
                                                                </td>
                                                                <td>
                                                                    <div style={{ color: '#113d69' }}>{formatearFecha(viajero.creadoEn)}</div>
                                                                    {viajero.actualizadoEn && viajero.actualizadoEn !== viajero.creadoEn && (
                                                                        <small className="text-muted d-block">
                                                                            Actualizado: {formatearFecha(viajero.actualizadoEn)}
                                                                        </small>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                                                                        <AccionButton
                                                                            estado={viajero.estado}
                                                                            onClick={() => cambiarEstadoViajero(viajero.idUsuarios, viajero.estado)}
                                                                        >
                                                                            {getBotonTexto(viajero.estado)}
                                                                        </AccionButton>
                                                                        
                                                                        {puedeSuspender(viajero.estado) && (
                                                                            <AccionButton
                                                                                estado={viajero.estado}
                                                                                onClick={() => suspenderViajero(viajero.idUsuarios)}
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

export default AdminViajeros;