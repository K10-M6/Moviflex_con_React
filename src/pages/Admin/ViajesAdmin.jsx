import { useState, useEffect } from "react";
import NavbarAdmin from "./NavAdmin";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminViajes(){
    const [viajes, setViajes] = useState([]);
    
    useEffect(()=> {
        traerViajes();
    }, []);
    
    async function traerViajes(){
        await fetch("",{
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }).then(response => response.json())
        .then(data => setViajes(data));
    }

    async function eliminarViaje(id) {
        await fetch(`http://localhost:3000/api/auth/viajes/${id}`,{
            method: "DELETE",
            headers:{
                "Content-Type":"application/json"
            }
        });
        traerViajes();
    }
    
    async function cambiarEstadoViaje(id) {
        await fetch(`http://localhost:3000/api/auth/viajes/${id}/estado`,{
            method: "PATCH",
            headers:{
                "Content-Type":"application/json"
            }
        });
        traerViajes();
    }
    
    function getEstadoBadge(estado) {
        if (estado === 'CREADO') {
            return <Badge bg="secondary">Creado</Badge>;
        } else if (estado === 'PUBLICADO') {
            return <Badge bg="info">Publicado</Badge>;
        } else if (estado === 'EN_CURSO') {
            return <Badge bg="primary">En Curso</Badge>;
        } else if (estado === 'FINALIZADO') {
            return <Badge bg="success">Finalizado</Badge>;
        } else if (estado === 'CANCELADO') {
            return <Badge bg="danger">Cancelado</Badge>;
        } else {
            return <Badge bg="warning" text="dark">{estado}</Badge>;
        }
    }
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleString();
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
                        <h1 className="display-5 fw-bold">Lista de Viajes</h1>
                        <p className="text-muted">Administra los viajes registrados en la plataforma</p>
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
                                            <th>ID Ruta</th>
                                            <th>ID Vehículo</th>
                                            <th>Fecha/Hora Salida</th>
                                            <th>Cupos Totales</th>
                                            <th>Cupos Disponibles</th>
                                            <th>Estado</th>
                                            <th>Creado En</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viajes.map((viaje) => (
                                            <tr key={viaje.idViajes}>
                                                <td className="fw-semibold">{viaje.idViajes}</td>
                                                <td>{viaje.idRuta}</td>
                                                <td>{viaje.idVehiculos}</td>
                                                <td>{formatearFecha(viaje.fechaHoraSalida)}</td>
                                                <td>{viaje.cuposTotales}</td>
                                                <td>{viaje.cuposDisponibles}</td>
                                                <td>{formatearFecha(viaje.creadoEn)}</td>
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

export default AdminViajes;