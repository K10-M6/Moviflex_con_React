import { useState, useEffect } from "react";
import NavbarAdmin from "./NavAdmin";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminConductores(){
    const { token } = useAuth();
    const [conductores, setConductores] = useState([]);
    
    useEffect(()=> {
        traerConductores();
    }, []);
    
    async function traerConductores(){
        await fetch("https://backendmovi-production.up.railway.app/api/auth/",{
            method:"GET",
            headers: {
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        }).then(response => response.json())
        .then(data => {
            const conductoresFiltrados = data.filter(usuario => 
                usuario.idRol === 3 || usuario.rol?.nombre?.toUpperCase() === 'CONDUCTOR'
            );
            setConductores(conductoresFiltrados);
        });
    }

    async function eliminarConductor(id) {
        await fetch(`https://backendmovi-production.up.railway.app/api/auth/${id}`,{
            method: "DELETE",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerConductores();
    }
    
    async function cambiarEstadoConductor(id) {
        await fetch(`https://backendmovi-production.up.railway.app/api/auth/${id}/estado`,{
            method: "PATCH",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerConductores();
    }
    
    function getEstadoBadge(estado) {
        if (estado === 'ACTIVO') {
            return <Badge bg="success">Activo</Badge>;
        } else if (estado === 'SUSPENDIDO') {
            return <Badge bg="danger">Suspendido</Badge>;
        } else if (estado === 'INACTIVO') {
            return <Badge bg="secondary">Inactivo</Badge>;
        } else {
            return <Badge bg="warning" text="dark">{estado}</Badge>;
        }
    }
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString();
    }

    return(
        <div style={{
        background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
        minHeight: '100vh',
        minWidth: '95vw'}}>
            <NavbarAdmin />
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Lista de Conductores</h1>
                        <p className="text-muted">Administra los conductores registrados en la plataforma</p>
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
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Teléfono</th>
                                            <th>Estado</th>
                                            <th>Creado En</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conductores.map((conductor) => (
                                            <tr key={conductor.idUsuarios}>
                                                <td className="fw-semibold">{conductor.idUsuarios}</td>
                                                <td>{conductor.nombre}</td>
                                                <td>{conductor.email}</td>
                                                <td>{conductor.telefono || "No especificado"}</td>
                                                <td>{getEstadoBadge(conductor.estado)}</td>
                                                <td>{formatearFecha(conductor.creadoEn)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button variant="outline-danger" size="sm" onClick={() => eliminarConductor(conductor.idUsuarios)}>
                                                            Eliminar
                                                        </Button>
                                                        <Button variant="outline-warning" size="sm" onClick={() => cambiarEstadoConductor(conductor.idUsuarios)}>
                                                            {conductor.estado === 'ACTIVO' ? 'Suspender' : 'Activar'}
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

export default AdminConductores;