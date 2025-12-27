import { useState, useEffect } from "react";
import NavbarAdmin from "./NavAdmin";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminDocuments(){
    const [documentacion, setDocumentacion] = useState([]);
    
    useEffect(()=> {
        traerDocumentacion();
    }, []);
    
    async function traerDocumentacion(){
        await fetch("http://localhost:3000/api/auth/documentacion_mis/",{
            method:"GET",
            headers: {
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        }).then(response => response.json())
        .then(data => setDocumentacion(data));
    }
    
    async function cambiarEstadoDocumentacion(id) {
        await fetch(`http://localhost:3000/api/auth/documentacion_validate/${id}/estado`,{
            method: "PATCH",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerDocumentacion();
    }
    
    function getEstadoBadge(estado) {
        if (estado === 'PENDIENTE') {
            return <Badge bg="warning" text="dark">Pendiente</Badge>;
        } else if (estado === 'APROBADO') {
            return <Badge bg="success">Aprobado</Badge>;
        } else if (estado === 'RECHAZADO') {
            return <Badge bg="danger">Rechazado</Badge>;
        } else {
            return <Badge bg="secondary">{estado}</Badge>;
        }
    }
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString();
    }

    return(
        <div style={{
            background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
            minHeight: '100vh',
            minWidth: '100vw'
        }}>
            <NavbarAdmin />
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Documentación</h1>
                        <p className="text-muted">Administra la documentación de los usuarios</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Table responsive hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>ID Usuario</th>
                                            <th>Tipo Documento</th>
                                            <th>Número Documento</th>
                                            <th>Estado</th>
                                            <th>Fecha Subida</th>
                                            <th>Observaciones</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documentacion.map((doc) => (
                                            <tr key={doc.idDocumentacion}>
                                                <td className="fw-semibold">{doc.idDocumentacion}</td>
                                                <td>{doc.idUsuario}</td>
                                                <td>{doc.tipoDocumento}</td>
                                                <td>{doc.numeroDocumento}</td>
                                                <td>{getEstadoBadge(doc.estado)}</td>
                                                <td>{formatearFecha(doc.fechaSubida)}</td>
                                                <td>{doc.observaciones || "Sin observaciones"}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button variant="outline-danger" size="sm"onClick={() => eliminarDocumentacion(doc.idDocumentacion)}>
                                                            Eliminar
                                                        </Button>
                                                        <Button variant="outline-warning"  size="sm" onClick={() => cambiarEstadoDocumentacion(doc.idDocumentacion)}>
                                                            Cambiar Estado
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default AdminDocuments;