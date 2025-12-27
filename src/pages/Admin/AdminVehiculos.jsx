import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NavbarAdmin from "./NavAdmin";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminVehiculos(){
    const { token } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    
    useEffect(()=> {
        traerVehiculos();
    }, []);
    
    async function traerVehiculos(){
        await fetch("http://localhost:3000/api/auth/mis-vehiculos",{
            method:"GET",
            headers: {
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        }).then(response => response.json())
        .then(data => setVehiculos(data));
    }

    async function eliminarVehiculo(id) {
        await fetch(`http://localhost:3000/api/auth/:${id}`,{
            method: "DELETE",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerVehiculos();
    }
    
    async function cambiarEstadoVehiculo(id) {
        await fetch(`http://localhost:3000/api/auth/`,{
            method: "PATCH",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerVehiculos();
    }
    
    function getEstadoBadge(estado) {
        if (estado === 'ACTIVO') {
            return <Badge bg="success">Activo</Badge>;
        } else if (estado === 'INACTIVO') {
            return <Badge bg="secondary">Inactivo</Badge>;
        } else {
            return <Badge bg="warning" text="dark">{estado}</Badge>;
        }
    }

    function formatearCapacidad(capacidad) {
        if (capacidad) {
            return `${capacidad} personas`;
        }
        return "No especificado";
    }

    return(
        <div
        style={{
        background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
        minHeight: '100vh',
        minWidth: '100vw'}}>
            <NavbarAdmin />
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="display-5 fw-bold">Lista de Vehículos</h1>
                        <p className="text-muted">Administra los vehículos registrados en la plataforma</p>
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
                                            <th>Marca</th>
                                            <th>Modelo</th>
                                            <th>Placa</th>
                                            <th>Capacidad</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehiculos.map((vehiculo) => (
                                            <tr key={vehiculo.idVehiculos}>
                                                <td className="fw-semibold">{vehiculo.idVehiculos}</td>
                                                <td>{vehiculo.idUsuario}</td>
                                                <td>{vehiculo.marca || "No especificado"}</td>
                                                <td>{vehiculo.modelo || "No especificado"}</td>
                                                <td>{vehiculo.placa || "Sin placa"}</td>
                                                <td>{formatearCapacidad(vehiculo.capacidad)}</td>
                                                <td>{getEstadoBadge(vehiculo.estado)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm"
                                                            onClick={() => eliminarVehiculo(vehiculo.idVehiculos)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                        <Button 
                                                            variant="outline-warning" 
                                                            size="sm"
                                                            onClick={() => cambiarEstadoVehiculo(vehiculo.idVehiculos)}
                                                        >
                                                            {vehiculo.estado === 'ACTIVO' ? '' : 'Activar'}
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

export default AdminVehiculos;