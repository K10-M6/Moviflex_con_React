import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NavbarAdmin from "./NavAdmin";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminViajes(){
    const { token } = useAuth();
    const [viajes, setViajes] = useState([]);
    
    useEffect(()=> {
        traerViajes();
    }, []);
    
    async function traerViajes(){
        await fetch("https://backendmovi-production.up.railway.app/api/auth/viajes",{
            method:"GET",
            headers: {
                "Authorization":"Bearer "+token,
                "Content-Type":"application/json"
            }
        }).then(response => response.json())
        .then(data => setViajes(data))
        .catch(error => console.error("Error al traer viajes:", error));
    }

    async function eliminarViaje(id) {
        if (window.confirm("¿Estás seguro de eliminar este viaje?")) {
            await fetch(`https://backendmovi-production.up.railway.app/api/auth/viajes/${id}`,{
                method: "DELETE",
                headers:{
                    "Authorization":"Bearer "+token,
                    "Content-Type":"application/json"
                }
            });
            traerViajes();
        }
    }
    
    async function cambiarEstadoViaje(id) {
        await fetch(`https://backendmovi-production.up.railway.app/api/auth/viajes/${id}/estado`,{
            method: "PATCH",
            headers:{
                "Authorization":"Bearer "+token,
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
            minWidth: '95vh'
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
                                                <td>{getEstadoBadge(viaje.estado)}</td>
                                                <td>{formatearFecha(viaje.creadoEn)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm"
                                                            onClick={() => cambiarEstadoViaje(viaje.idViajes)}
                                                            title="Cambiar estado"
                                                        >
                                                            ↻
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => eliminarViaje(viaje.idViajes)}
                                                            title="Eliminar viaje"
                                                        >
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

export default AdminViajes;