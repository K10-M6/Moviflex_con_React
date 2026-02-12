import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminViajeros(){
    const { token } = useAuth();
    const [viajeros, setViajeros] = useState([]);
    
    useEffect(()=> {
        traerViajeros();
    }, []);
    
    async function traerViajeros(){
        await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/pasajeros",{
            method:"GET",
            headers: {
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        }).then(response => response.json())
        .then(data => {
            const viajerosFiltrados = data.filter(usuario => 
                usuario.idRol === 3 || 
                usuario.rol?.nombre?.toUpperCase() === 'VIAJERO' || 
                usuario.rol?.nombre?.toUpperCase() === 'PASAJERO'
            );
            setViajeros(viajerosFiltrados);
        });
    }
    
    async function cambiarEstadoViajero(id) {
        await fetch(`https://backendmovi-production.up.railway.app/api/auth/${id}/estado`,{
            method: "PATCH",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerViajeros();
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
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Lista de Viajeros</h1>
                        <p className="text-muted">Administra los viajeros registrados en la plataforma</p>
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
                                        {viajeros.map((viajero) => (
                                            <tr key={viajero.idUsuarios}>
                                                <td className="fw-semibold">{viajero.idUsuarios}</td>
                                                <td>{viajero.nombre}</td>
                                                <td>{viajero.email}</td>
                                                <td>{viajero.telefono || "No especificado"}</td>
                                                <td>{getEstadoBadge(viajero.estado)}</td>
                                                <td>{formatearFecha(viajero.creadoEn)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button 
                                                            variant="outline-warning" 
                                                            size="sm" 
                                                            onClick={() => cambiarEstadoViajero(viajero.idUsuarios)}
                                                        >
                                                            {viajero.estado === 'ACTIVO' ? 'Suspender' : 'Activar'}
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

export default AdminViajeros;