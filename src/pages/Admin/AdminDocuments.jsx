import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Image, Modal } from "react-bootstrap";

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

            switch (estadoActual) {
                case 'APROBADO':
                    nuevoEstado = 'RECHAZADO';
                    break;
                case 'RECHAZADO':
                    nuevoEstado = 'PENDIENTE';
                    break;
                case 'PENDIENTE':
                    nuevoEstado = 'APROBADO';
                    break;
                default:
                    nuevoEstado = 'PENDIENTE';
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

    function getEstadoBadge(estado) {
        switch (estado) {
            case 'APROBADO':
                return <Badge bg="success" className="px-3 py-1">Aprobado</Badge>;
            case 'RECHAZADO':
                return <Badge bg="danger" className="px-3 py-1">Rechazado</Badge>;
            case 'PENDIENTE':
                return <Badge bg="warning" text="dark" className="px-3 py-1">Pendiente</Badge>;
            default:
                return <Badge bg="light" text="dark" className="px-3 py-1">{estado || "Sin estado"}</Badge>;
        }
    }

    function getEstadoTexto(estado) {
        switch (estado) {
            case 'APROBADO':
                return "Aprobado";
            case 'RECHAZADO':
                return "Rechazado";
            case 'PENDIENTE':
                return "Pendiente";
            default:
                return estado || "Sin estado";
        }
    }

    function getBotonTexto(estado) {
        switch (estado) {
            case 'APROBADO':
                return "Rechazar";
            case 'RECHAZADO':
                return "Pendiente";
            case 'PENDIENTE':
                return "Aprobar";
            default:
                return "Cambiar Estado";
        }
    }

    function getBotonVariant(estado) {
        switch (estado) {
            case 'APROBADO':
                return "outline-danger";
            case 'RECHAZADO':
                return "outline-warning";
            case 'PENDIENTE':
                return "outline-success";
            default:
                return "outline-primary";
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

    function getTipoDocumentoBadge(tipo) {
        if (!tipo) return null;

        const tipoLower = tipo.toLowerCase();

        if (tipoLower.includes('cedula') || tipoLower.includes('identidad')) {
            return <Badge bg="info" className="px-2">Cédula</Badge>;
        } else if (tipoLower.includes('licencia') || tipoLower.includes('conducir')) {
            return <Badge bg="primary" className="px-2">Licencia</Badge>;
        } else if (tipoLower.includes('pasaporte')) {
            return <Badge bg="secondary" className="px-2">Pasaporte</Badge>;
        } else if (tipoLower.includes('tarjeta') || tipoLower.includes('circulacion')) {
            return <Badge bg="dark" className="px-2">Tarjeta Circulación</Badge>;
        } else if (tipoLower.includes('seguro')) {
            return <Badge bg="success" className="px-2">Seguro</Badge>;
        } else {
            return <Badge bg="light" text="dark" className="px-2">{tipo}</Badge>;
        }
    }

    const handleVerImagen = (documento) => {
        setSelectedDocumento(documento);
        setSelectedImage(documento.urlImagen || documento.rutaArchivo);
        setShowImageModal(true);
    };

    const handleCloseModal = () => {
        setShowImageModal(false);
        setSelectedImage("");
        setSelectedDocumento(null);
    };

    const getImageUrl = (documento) => {
        return documento.urlImagen || documento.rutaArchivo || "https://via.placeholder.com/400x300?text=Sin+Imagen";
    };

    return (
        <div style={{
            background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)',
            minWidth: '100%',
            minHeight: '100%',
            padding: '24px'
        }}>
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Gestión de Documentos</h1>
                        <p className="text-muted">Revisa y administra los documentos subidos por los usuarios</p>

                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <Badge bg="primary" className="px-3 py-2">
                                Total: {documentos.length}
                            </Badge>
                            <Badge bg="success" className="px-3 py-2">
                                Aprobados: {documentos.filter(d => d.estado === 'APROBADO').length}
                            </Badge>
                            <Badge bg="warning" text="dark" className="px-3 py-2">
                                Pendientes: {documentos.filter(d => d.estado === 'PENDIENTE').length}
                            </Badge>
                            <Badge bg="danger" className="px-3 py-2">
                                Rechazados: {documentos.filter(d => d.estado === 'RECHAZADO').length}
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
                                        <p className="mt-3">Cargando documentos...</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Usuario</th>
                                                <th>Tipo Documento</th>
                                                <th>Documento</th>
                                                <th>Estado</th>
                                                <th>Fecha Subida</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documentos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
                                                        No hay documentos registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                documentos.map((documento) => (
                                                    <tr key={documento.idDocumento || documento.id}>
                                                        <td className="fw-semibold">{documento.idDocumento || documento.id}</td>
                                                        <td>
                                                            <div className="fw-medium">
                                                                {obtenerNombreUsuario(documento.idUsuario)}
                                                            </div>
                                                            <small className="text-muted">
                                                                ID: {documento.idUsuario}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="fw-medium">
                                                                {documento.tipo || documento.tipoDocumento}
                                                            </div>
                                                            <div className="mt-1">
                                                                {getTipoDocumentoBadge(documento.tipo || documento.tipoDocumento)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>N°:</strong> {documento.numeroDocumento || documento.numero || "-"}
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleVerImagen(documento)}
                                                                >
                                                                    Ver Imagen
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>{getEstadoBadge(documento.estado)}</div>
                                                            <small className="text-muted">
                                                                {getEstadoTexto(documento.estado)}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div>{formatearFecha(documento.fechaSubida || documento.creadoEn)}</div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-2">
                                                                <Button
                                                                    variant={getBotonVariant(documento.estado)}
                                                                    size="sm"
                                                                    onClick={() => cambiarEstadoDocumento(documento.idDocumento || documento.id, documento.estado)}
                                                                    className="w-100"
                                                                >
                                                                    {getBotonTexto(documento.estado)}
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

            {/* Modal para ver imagen */}
            <Modal show={showImageModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedDocumento && (
                            <>
                                Documento: {selectedDocumento.tipo || selectedDocumento.tipoDocumento} -
                                Usuario: {obtenerNombreUsuario(selectedDocumento.idUsuario)}
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedImage ? (
                        <Image
                            src={getImageUrl(selectedDocumento)}
                            alt="Documento"
                            fluid
                            style={{ maxHeight: '70vh' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/400x300?text=Error+al+cargar+imagen";
                            }}
                        />
                    ) : (
                        <p>No hay imagen disponible</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminDocumentos;