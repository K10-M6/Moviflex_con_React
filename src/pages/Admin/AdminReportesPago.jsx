import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Card, Row, Col, Spinner, Image } from 'react-bootstrap';
import { BsCheckCircleFill, BsXCircleFill, BsEyeFill, BsCalendar3, BsFunnelFill } from 'react-icons/bs';
import { useAuth } from '../../pages/context/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

// Removido API_URL local ya que se usa el central de config.js

function AdminReportesPago() {
    const { token } = useAuth();
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMes, setFiltroMes] = useState('');

    // Modal estados
    const [showModal, setShowModal] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [showRechazarModal, setShowRechazarModal] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [procesando, setProcesando] = useState(false);

    const cargarReportes = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/reportes-pago?`;
            if (filtroEstado) url += `estado=${filtroEstado}&`;
            if (filtroMes) url += `mes=${filtroMes}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReportes(data);
            }
        } catch (err) {
            console.error('Error cargando reportes:', err);
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    }, [token, filtroEstado, filtroMes]);

    useEffect(() => {
        cargarReportes();
    }, [cargarReportes]);

    const aprobarReporte = async (id) => {
        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/${id}/aprobar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Reporte aprobado exitosamente');
                cargarReportes();
                setShowModal(false);
            } else {
                const err = await res.json();
                toast.error(err.message);
            }
        } catch (err) {
            toast.error('Error al aprobar reporte');
        } finally {
            setProcesando(false);
        }
    };

    const rechazarReporte = async (id) => {
        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/${id}/rechazar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ observaciones })
            });
            if (res.ok) {
                toast.success('Reporte rechazado');
                cargarReportes();
                setShowRechazarModal(false);
                setShowModal(false);
                setObservaciones('');
            } else {
                const err = await res.json();
                toast.error(err.message);
            }
        } catch (err) {
            toast.error('Error al rechazar reporte');
        } finally {
            setProcesando(false);
        }
    };

    const verificarMensuales = async () => {
        if (!window.confirm('¿Está seguro de ejecutar la verificación mensual? Los conductores sin pago aprobado serán suspendidos.')) return;

        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/verificar-mensuales`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(`Verificación completada. ${data.suspendidos} conductores suspendidos de ${data.verificados} verificados.`);
                cargarReportes();
            }
        } catch (err) {
            toast.error('Error en verificación mensual');
        } finally {
            setProcesando(false);
        }
    };

    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return 'warning';
            case 'APROBADO': return 'success';
            case 'RECHAZADO': return 'danger';
            default: return 'secondary';
        }
    };

    const enviarRecordatorios = async () => {
        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/enviar-recordatorios`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
            } else {
                const err = await res.json();
                toast.error(err.message);
            }
        } catch (err) {
            toast.error('Error al enviar recordatorios');
        } finally {
            setProcesando(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleModalExited = () => {
        setReporteSeleccionado(null);
    };

    const handleCloseRechazarModal = () => {
        setShowRechazarModal(false);
    };

    const handleRechazarModalExited = () => {
        setObservaciones('');
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatearMes = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'long'
        });
    };

    return (
        <Container fluid className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1" style={{ color: '#2d3436' }}>
                        💰 Reportes de Pago
                    </h3>
                    <p className="text-muted mb-0">Gestión de comprobantes de pago de conductores</p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-warning"
                        onClick={enviarRecordatorios}
                        disabled={procesando}
                        style={{ borderRadius: '10px' }}
                    >
                        {procesando ? <Spinner size="sm" className="me-2" /> : null}
                        ⚠️ Enviar Recordatorios
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={verificarMensuales}
                        disabled={procesando}
                        style={{ borderRadius: '10px' }}
                    >
                        {procesando ? <Spinner size="sm" className="me-2" /> : null}
                        Verificar Pagos Mensuales
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="text-muted small">
                                    <BsFunnelFill className="me-1" /> Estado
                                </Form.Label>
                                <Form.Select
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    <option value="">Todos</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="APROBADO">Aprobado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="text-muted small">
                                    <BsCalendar3 className="me-1" /> Mes
                                </Form.Label>
                                <Form.Control
                                    type="month"
                                    value={filtroMes}
                                    onChange={(e) => setFiltroMes(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => { setFiltroEstado(''); setFiltroMes(''); }}
                                style={{ borderRadius: '8px' }}
                                className="w-100"
                            >
                                Limpiar filtros
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Resumen rápido */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px', borderLeft: '4px solid #f39c12' }}>
                        <Card.Body>
                            <h2 className="fw-bold" style={{ color: '#f39c12' }}>
                                {reportes.filter(r => r.estado === 'PENDIENTE').length}
                            </h2>
                            <small className="text-muted">Pendientes</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px', borderLeft: '4px solid #27ae60' }}>
                        <Card.Body>
                            <h2 className="fw-bold" style={{ color: '#27ae60' }}>
                                {reportes.filter(r => r.estado === 'APROBADO').length}
                            </h2>
                            <small className="text-muted">Aprobados</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px', borderLeft: '4px solid #e74c3c' }}>
                        <Card.Body>
                            <h2 className="fw-bold" style={{ color: '#e74c3c' }}>
                                {reportes.filter(r => r.estado === 'RECHAZADO').length}
                            </h2>
                            <small className="text-muted">Rechazados</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabla */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: '#4acfbd' }} />
                        </div>
                    ) : reportes.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">No hay reportes de pago</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4">Conductor</th>
                                    <th>Mes</th>
                                    <th>Monto Comisión</th>
                                    <th>Fecha Envío</th>
                                    <th>Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportes.map(reporte => (
                                    <tr key={reporte.idReporte}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                {reporte.usuario?.fotoPerfil ? (
                                                    <Image
                                                        src={reporte.usuario.fotoPerfil}
                                                        roundedCircle
                                                        width={35} height={35}
                                                        className="me-2"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                                                        style={{ width: 35, height: 35, backgroundColor: '#4acfbd', color: 'white', fontWeight: 'bold' }}>
                                                        {reporte.usuario?.nombre?.charAt(0) || 'C'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-semibold">{reporte.usuario?.nombre}</div>
                                                    <small className="text-muted">{reporte.usuario?.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{formatearMes(reporte.mesCorrespondiente)}</td>
                                        <td className="fw-bold">${Number(reporte.montoComision).toLocaleString()} COP</td>
                                        <td>{formatearFecha(reporte.fechaEnvio)}</td>
                                        <td>
                                            <Badge bg={getBadgeColor(reporte.estado)} style={{ borderRadius: '6px', padding: '5px 10px' }}>
                                                {reporte.estado}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-1"
                                                onClick={() => { setReporteSeleccionado(reporte); setShowModal(true); }}
                                                style={{ borderRadius: '6px' }}
                                            >
                                                <BsEyeFill /> Ver
                                            </Button>
                                            {reporte.estado === 'PENDIENTE' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        className="me-1"
                                                        onClick={() => aprobarReporte(reporte.idReporte)}
                                                        disabled={procesando}
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <BsCheckCircleFill />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => { setReporteSeleccionado(reporte); setShowRechazarModal(true); }}
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <BsXCircleFill />
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal Ver Detalle */}
            <Modal show={showModal} onHide={handleCloseModal} onExited={handleModalExited} size="lg" centered>
                <Modal.Header closeButton style={{ borderBottom: '2px solid #4acfbd' }}>
                    <Modal.Title>Detalle del Reporte de Pago</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reporteSeleccionado && (
                        <Row>
                            <Col md={6}>
                                <p><strong>Conductor:</strong> {reporteSeleccionado.usuario?.nombre}</p>
                                <p><strong>Email:</strong> {reporteSeleccionado.usuario?.email}</p>
                                <p><strong>Mes:</strong> {formatearMes(reporteSeleccionado.mesCorrespondiente)}</p>
                                <p><strong>Monto:</strong> <span className="fw-bold" style={{ color: '#4acfbd' }}>${Number(reporteSeleccionado.montoComision).toLocaleString()} COP</span></p>
                                <p><strong>Estado:</strong> <Badge bg={getBadgeColor(reporteSeleccionado.estado)}>{reporteSeleccionado.estado}</Badge></p>
                                <p><strong>Fecha de envío:</strong> {formatearFecha(reporteSeleccionado.fechaEnvio)}</p>
                                {reporteSeleccionado.fechaRevision && (
                                    <p><strong>Fecha revisión:</strong> {formatearFecha(reporteSeleccionado.fechaRevision)}</p>
                                )}
                                {reporteSeleccionado.observaciones && (
                                    <p><strong>Observaciones:</strong> {reporteSeleccionado.observaciones}</p>
                                )}
                            </Col>
                            <Col md={6}>
                                <p className="fw-bold">Comprobante de pago:</p>
                                <Image
                                    src={reporteSeleccionado.fotoComprobante}
                                    fluid
                                    style={{ borderRadius: '10px', maxHeight: '400px', objectFit: 'contain', border: '1px solid #eee' }}
                                />
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {reporteSeleccionado?.estado === 'PENDIENTE' && (
                        <>
                            <Button
                                variant="success"
                                onClick={() => aprobarReporte(reporteSeleccionado.idReporte)}
                                disabled={procesando}
                                style={{ borderRadius: '8px' }}
                            >
                                {procesando ? <Spinner size="sm" className="me-1" /> : <BsCheckCircleFill className="me-1" />}
                                Aprobar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setShowRechazarModal(true)}
                                style={{ borderRadius: '8px' }}
                            >
                                <BsXCircleFill className="me-1" /> Rechazar
                            </Button>
                        </>
                    )}
                    <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: '8px' }}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Rechazar */}
            <Modal show={showRechazarModal} onHide={handleCloseRechazarModal} onExited={handleRechazarModalExited} centered>
                <Modal.Header closeButton style={{ borderBottom: '2px solid #e74c3c' }}>
                    <Modal.Title>Rechazar Reporte</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Motivo del rechazo</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ingrese el motivo del rechazo..."
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseRechazarModal} style={{ borderRadius: '8px' }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => rechazarReporte(reporteSeleccionado?.idReporte)}
                        disabled={procesando}
                        style={{ borderRadius: '8px' }}
                    >
                        {procesando ? <Spinner size="sm" className="me-1" /> : null}
                        Confirmar Rechazo
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AdminReportesPago;
