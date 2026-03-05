import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Image, Modal } from "react-bootstrap";
import fondo from "../Imagenes/AutoresContacto.png";

function AdminDocumentos() {
    const { token } = useAuth();
    const [documentos, setDocumentos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedDocumento, setSelectedDocumento] = useState(null);

    useEffect(() => {
        traerUsuarios();
        traerDocumentos();
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
            setError("Error al cargar la información de usuarios");
        }
    }

    async function traerDocumentos() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("https://backendmovi-production-c657.up.railway.app/api/documentacion/todos", {
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

    async function cambiarEstadoDocumento(id, estadoActual) {
        try {
            let nuevoEstado;

            if (estadoActual === 'APROBADO') {
                nuevoEstado = 'RECHAZADO';
            } else {
                nuevoEstado = 'APROBADO';
            }

            const response = await fetch(`https://backendmovi-production-c657.up.railway.app/api/documentacion/documentacion_validate/${id}`, {
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
                borderRadius: '0.375rem',
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
                borderRadius: '0.25rem',
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
        const getButtonStyle = () => {
            if (estado === 'APROBADO') {
                return {
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9'
                };
            } else {
                return {
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            }
        };

        return (
            <Button
                size="sm"
                onClick={onClick}
                className="w-100"
                style={{
                    transition: 'all 0.2s',
                    fontWeight: '500',
                    ...getButtonStyle()
                }}
                onMouseEnter={(e) => {
                    if (estado === 'APROBADO') {
                        e.target.style.backgroundColor = '#62d8d9';
                        e.target.style.color = 'white';
                    }
                }}
                onMouseLeave={(e) => {
                    if (estado === 'APROBADO') {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#62d8d9';
                    }
                }}
            >
                {children}
            </Button>
        );
    };

    const VerImagenButton = ({ onClick }) => {
        return (
            <Button
                variant="outline-primary"
                size="sm"
                onClick={onClick}
                style={{
                    transition: 'all 0.2s',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem'
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

    function getBotonTexto(estado) {
        switch (estado) {
            case 'APROBADO':
                return "Rechazar";
            case 'RECHAZADO':
                return "Aprobar";
            case 'PENDIENTE':
                return "Aprobar";
            default:
                return "Cambiar Estado";
        }
    }

    function formatearFecha(fecha) {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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
        setSelectedImage("");
        setSelectedDocumento(null);
    };

    const getImageUrl = (documento) => {
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
                                                    <th className="py-3" style={{ color: '#113d69' }}>Documento</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Estado</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Fecha Subida</th>
                                                    <th className="py-3" style={{ color: '#113d69' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                {documentos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4" style={{ color: '#113d69' }}>
                                                            No hay documentos registrados
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    documentos.map((documento, index) => (
                                                        <tr key={documento.idDocumentacion} style={{
                                                            backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                        }}>
                                                            <td className="fw-semibold px-4" style={{ color: '#113d69' }}>{documento.idDocumentacion}</td>
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
                                                                    {documento.tipoDocumento || documento.tipo}
                                                                </div>
                                                                <TipoDocumentoBadge tipo={documento.tipoDocumento || documento.tipo} />
                                                            </td>
                                                            <td>
                                                                <div style={{ color: '#113d69' }}>
                                                                    <span className="fw-medium">N°:</span> {documento.numeroDocumento || documento.numero || "-"}
                                                                </div>
                                                                <div className="mt-2">
                                                                    <VerImagenButton onClick={() => handleVerImagen(documento)} />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <EstadoBadge estado={documento.estado} />
                                                            </td>
                                                            <td style={{ color: '#113d69' }}>
                                                                {formatearFecha(documento.fechaSubida || documento.creadoEn)}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-column gap-2" style={{ minWidth: '100px' }}>
                                                                    <AccionButton
                                                                        estado={documento.estado}
                                                                        onClick={() => cambiarEstadoDocumento(documento.idDocumentacion, documento.estado)}
                                                                    >
                                                                        {getBotonTexto(documento.estado)}
                                                                    </AccionButton>
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

            {/* Modal para ver imagen - con estilo mejorado */}
            <Modal 
                show={showImageModal} 
                onHide={handleCloseModal} 
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
                                <span style={{ color: '#62d8d9' }}>📄</span> {selectedDocumento.tipo || selectedDocumento.tipoDocumento} - 
                                <span className="ms-1" style={{ color: '#113d69' }}>{obtenerNombreUsuario(selectedDocumento.idUsuario)}</span>
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
                    {selectedImage ? (
                        <Image
                            src={getImageUrl(selectedDocumento)}
                            alt="Documento"
                            fluid
                            style={{ 
                                maxHeight: '70vh',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/400x300?text=Error+al+cargar+imagen";
                            }}
                        />
                    ) : (
                        <p className="text-muted" style={{ color: '#113d69' }}>No hay imagen disponible</p>
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
                            padding: '0.5rem 1.5rem'
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