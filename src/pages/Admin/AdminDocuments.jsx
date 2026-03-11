import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Image, Modal, Form, InputGroup } from "react-bootstrap";
import { BsSearch, BsXCircle, BsChevronDown } from "react-icons/bs";
import fondo from "../Imagenes/AutoresContacto.png";

const EstadoBadge = ({ estado }) => {
    const estilos = {
        APROBADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        PENDIENTE: { backgroundColor: '#cccbd2af', color: '#113d69' },
        RECHAZADO: { backgroundColor: '#113d69', color: '#ffffff' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {estado === 'APROBADO' && 'Aprobado'}
            {estado === 'PENDIENTE' && 'Pendiente'}
            {estado === 'RECHAZADO' && 'Rechazado'}
            {!estado && 'Sin estado'}
        </span>
    );
};

const TipoDocumentoBadge = ({ tipo }) => {
    if (!tipo) return null;

    const tipoLower = tipo.toLowerCase();
    let estilo = { backgroundColor: '#e9ecef', color: '#113d69' };

    if (tipoLower.includes('cedula') || tipoLower.includes('identidad')) {
        estilo = { backgroundColor: '#62d8d9', color: '#ffffff' };
    } else if (tipoLower.includes('licencia') || tipoLower.includes('conducir')) {
        estilo = { backgroundColor: '#113d69', color: '#ffffff' };
    } else if (tipoLower.includes('pasaporte')) {
        estilo = { backgroundColor: '#6c757d', color: '#ffffff' };
    } else if (tipoLower.includes('tarjeta') || tipoLower.includes('circulacion')) {
        estilo = { backgroundColor: '#495057', color: '#ffffff' };
    } else if (tipoLower.includes('seguro')) {
        estilo = { backgroundColor: '#62d8d9', color: '#ffffff' };
    }

    return (
        <span style={{
            ...estilo,
            padding: '0.2rem 0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.7rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {tipo}
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
                borderRadius: '1rem',
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
            borderRadius: '1rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
};

const AccionButton = ({ estado, onAprobarRechazar }) => {
    const textoBoton = estado === 'APROBADO' ? 'Rechazar' : 'Aprobar';
    const esAprobado = estado === 'APROBADO';

    return (
        <Button
            size="sm"
            onClick={onAprobarRechazar}
            className="w-100"
            style={{
                transition: 'all 0.2s',
                fontWeight: '500',
                borderRadius: '50px',
                padding: '0.4rem 0.8rem',
                border: `2px solid ${esAprobado ? '#62d8d9' : '#62d8d9'}`,
                backgroundColor: esAprobado ? 'transparent' : '#62d8d9',
                color: esAprobado ? '#62d8d9' : '#ffffff',
            }}
            onMouseEnter={(e) => {
                if (esAprobado) {
                    e.target.style.backgroundColor = '#62d8d9';
                    e.target.style.color = 'white';
                }
            }}
            onMouseLeave={(e) => {
                if (esAprobado) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#62d8d9';
                }
            }}
        >
            {textoBoton}
        </Button>
    );
};

const VerImagenButton = ({ onClick }) => {
    return (
        <Button
            size="sm"
            onClick={onClick}
            style={{
                transition: 'all 0.2s',
                fontWeight: '500',
                borderRadius: '50px',
                padding: '0.15rem 0.15rem',
                fontSize: '0.7rem',
                border: '2px solid #62d8d9',
                backgroundColor: 'transparent',
                color: '#62d8d9',
            }}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#62d8d9';
                e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#62d8d9';
            }}
        >
            Ver Imagen
        </Button>
    );
};

const Paginacion = ({ totalPaginas, paginaActual, cambiarPagina, documentosFiltrados, indicePrimerElemento, indiceUltimoElemento, busqueda, documentosTotales }) => {
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
                    borderRadius: '50px 0 0 50px',
                    cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: paginaActual === 1 ? 0.6 : 1
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
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    1
                </button>
            );
            if (inicio > 2) {
                botones.push(<span key="ellipsis1" style={{ margin: '0 5px', color: '#113d69' }}>...</span>);
            }
        }

        for (let i = inicio; i <= fin; i++) {
            botones.push(
                <button
                    key={i}
                    onClick={() => cambiarPagina(i)}
                    style={{
                        ...buttonStyle,
                        backgroundColor: i === paginaActual ? '#62d8d9' : 'white',
                        color: i === paginaActual ? 'white' : '#62d8d9',
                        border: '1px solid #62d8d9',
                        margin: '0 2px',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    {i}
                </button>
            );
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                botones.push(<span key="ellipsis2" style={{ margin: '0 5px', color: '#113d69' }}>...</span>);
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
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontWeight: '500'
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
                    borderRadius: '0 50px 50px 0',
                    cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: paginaActual === totalPaginas ? 0.6 : 1
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
                Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, documentosFiltrados.length)} de {documentosFiltrados.length} documentos
                {busqueda && ` (filtrados de ${documentosTotales} totales)`}
            </div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {generarBotones()}
            </div>
        </div>
    );
};

function AdminDocumentos() {
    const { token } = useAuth();
    const [documentos, setDocumentos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedDocumento, setSelectedDocumento] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    const elementosPorPagina = 10;

    useEffect(() => {
        traerUsuarios();
        traerDocumentos();
    }, []);

    async function traerUsuarios() {
        try {
            const response = await fetch(`${API_URL}/auth/`, {
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
            setError("Error al cargar la información de usuarios");
        }
    }

    async function traerDocumentos() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/documentacion/todos`, {
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

            setDocumentos(data);

        } catch (error) {
            console.error("Error al traer documentos:", error);
            setError(error.message);
            setDocumentos([]);
        } finally {
            setLoading(false);
        }
    }

    const documentosFiltrados = documentos.filter(documento => {
        const terminoBusqueda = busqueda.toLowerCase();
        const nombreUsuario = obtenerNombreUsuario(documento.idUsuario).toLowerCase();
        const tipoDoc = (documento.tipoDocumento || documento.tipo || "").toLowerCase();
        const numDoc = (documento.numeroDocumento || documento.numero || "").toLowerCase();

        return (
            nombreUsuario.includes(terminoBusqueda) ||
            tipoDoc.includes(terminoBusqueda) ||
            numDoc.includes(terminoBusqueda) ||
            documento.idDocumentacion?.toString().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const documentosPaginados = documentosFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(documentosFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setPaginaActual(1);
    };

    const limpiarBusqueda = () => {
        setBusqueda("");
        setPaginaActual(1);
    };

    async function cambiarEstadoDocumento(id, estadoActual) {
        try {
            let nuevoEstado;

            if (estadoActual === 'APROBADO') {
                nuevoEstado = 'RECHAZADO';
            } else {
                nuevoEstado = 'APROBADO';
            }

            const response = await fetch(`${API_URL}/documentacion/documentacion_validate/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    estado: nuevoEstado,
                    observaciones: `Cambio de estado realizado por administrador`
                })
            });

            if (!response.ok) {
                throw new Error(`Error al cambiar estado: ${response.status}`);
            }

            await traerDocumentos();

        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del documento");
        }
    }

    function obtenerNombreUsuario(idUsuario) {
        if (!idUsuario) return "Sin usuario";

        const usuario = usuarios.find(u => u.idUsuarios === idUsuario);

        if (usuario) {
            return usuario.nombre;
        } else if (usuarios.length > 0) {
            return `Usuario #${idUsuario} (No encontrado)`;
        } else {
            return `Usuario #${idUsuario}`;
        }
    }

    function formatearFecha(fecha) {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const handleVerImagen = (documento) => {
        setSelectedDocumento(documento);
        setSelectedImage(documento.imagenFrontalUrl || documento.urlImagen || documento.rutaArchivo);
        setShowImageModal(true);
    };

    const handleCloseModal = () => {
        setShowImageModal(false);
    };

    const handleModalExited = () => {
        setSelectedImage("");
        setSelectedDocumento(null);
    };

    const getImageUrl = (documento) => {
        if (!documento) return "https://via.placeholder.com/400x300?text=Cargando...";
        return documento.imagenFrontalUrl || documento.urlImagen || documento.rutaArchivo || "https://via.placeholder.com/400x300?text=Sin+Imagen";
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
                                    Gestión de Documentos
                                </h1>
                                <p className="mb-0 small" style={{ color: '#113d69' }}>
                                    <span style={{ color: '#62d8d9' }}>●</span> Revisa y administra los documentos subidos por los usuarios
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
                                            placeholder="Buscar por usuario, tipo de documento o número..."
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
                                Total: {documentos.length}
                            </StatsBadge>
                            <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                Aprobados: {documentos.filter(d => d.estado === 'APROBADO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#cccbd2af" color="#113d69">
                                Pendientes: {documentos.filter(d => d.estado === 'PENDIENTE').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#113d69" color="#ffffff">
                                Rechazados: {documentos.filter(d => d.estado === 'RECHAZADO').length}
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
                                        <p className="mt-3" style={{ color: '#113d69' }}>Cargando documentos...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle mb-0">
                                            <thead style={{
                                                backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                                borderBottom: '2px solid #62d8d9'
                                            }}>
                                                <tr>
                                                    <th className="py-3 px-4" style={{ color: '#113d69' }}>ID</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Usuario</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Tipo Documento</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>N° Documento / Imagen</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Estado</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Fecha Subida</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                {documentosFiltrados.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4" style={{ color: '#113d69' }}>
                                                            {busqueda ? "No se encontraron documentos con esos criterios" : "No hay documentos registrados"}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    documentosPaginados.map((documento, index) => (
                                                        <tr key={documento.idDocumentacion} style={{
                                                            backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                        }}>
                                                            <td className="fw-semibold px-4">
                                                                <span style={{
                                                                    backgroundColor: '#62d8d9',
                                                                    color: '#ffffff',
                                                                    padding: '0.4rem 0.8rem',
                                                                    borderRadius: '8px',
                                                                    display: 'inline-block',
                                                                    fontWeight: '600',
                                                                    minWidth: '50px',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    {documento.idDocumentacion}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="fw-medium" style={{ color: '#113d69' }}>
                                                                    {obtenerNombreUsuario(documento.idUsuario)}
                                                                </div>
                                                                <small className="text-muted">
                                                                    ID: {documento.idUsuario}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <div className="fw-medium mb-1" style={{ color: '#113d69' }}>
                                                                    {documento.tipoDocumento || documento.tipo || 'No especificado'}
                                                                </div>
                                                                <TipoDocumentoBadge tipo={documento.tipoDocumento || documento.tipo} />
                                                            </td>
                                                            <td>
                                                                <div className="mb-2" style={{ color: '#113d69' }}>
                                                                    <span className="fw-medium">N°:</span> {documento.numeroDocumento || documento.numero || "-"}
                                                                </div>
                                                                <VerImagenButton onClick={() => handleVerImagen(documento)} />
                                                            </td>
                                                            <td>
                                                                <EstadoBadge estado={documento.estado} />
                                                            </td>
                                                            <td>
                                                                <div style={{ color: '#113d69', fontSize: '0.9rem' }}>
                                                                    {formatearFecha(documento.fechaSubida || documento.creadoEn)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ minWidth: '100px' }}>
                                                                    <AccionButton
                                                                        estado={documento.estado}
                                                                        onAprobarRechazar={() => cambiarEstadoDocumento(documento.idDocumentacion, documento.estado)}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                        <Paginacion
                                            totalPaginas={totalPaginas}
                                            paginaActual={paginaActual}
                                            cambiarPagina={cambiarPagina}
                                            documentosFiltrados={documentosFiltrados}
                                            indicePrimerElemento={indicePrimerElemento}
                                            indiceUltimoElemento={indiceUltimoElemento}
                                            busqueda={busqueda}
                                            documentosTotales={documentos.length}
                                        />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal para ver imagen */}
            <Modal
                show={showImageModal}
                onHide={handleCloseModal}
                onExited={handleModalExited}
                size="lg"
                centered
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <Modal.Header
                    closeButton
                    style={{
                        borderBottom: '2px solid #62d8d9',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }}
                >
                    <Modal.Title style={{ color: '#113d69' }}>
                        {selectedDocumento && (
                            <>
                                <span style={{ color: '#62d8d9' }}>📄</span> Documento de {obtenerNombreUsuario(selectedDocumento.idUsuario)}
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-0" style={{ backgroundColor: '#1a1a1a' }}>
                    {selectedImage ? (
                        <Image
                            src={getImageUrl(selectedDocumento)}
                            alt="Documento"
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
                    ) : (
                        <div className="p-5 text-center" style={{ color: '#ffffff' }}>
                            No hay imagen disponible
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
                    <Button
                        variant="secondary"
                        onClick={handleCloseModal}
                        style={{
                            backgroundColor: '#6c757d',
                            border: 'none',
                            transition: 'all 0.2s',
                            fontWeight: '500',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '50px'
                        }}
                    >
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminDocumentos;