import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NavbarAdmin from "./NavAdmin";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";

function AdminUsuarios(){
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    
    useEffect(()=> {
        traerUsuarios();
    }, []);
    
    async function traerUsuarios(){
        await fetch("http://backendmovi-production.up.railway.app/api/auth",{
            method:"GET",
            headers: {
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        }).then(response => response.json())
        .then(data => setUsuarios(data));
    }

    async function eliminarUsuario(id) {
        await fetch(`http://localhost:3000/api/auth/usuarios/${id}`,{
            method: "DELETE",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerUsuarios();
    }

    async function BloquearUsuario(id) {
        await fetch(`http://backendmovi-production.up.railway.app${id}/estado`,{
            method: "PATCH",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+token
            }
        });
        traerUsuarios();
    }
    
    function getRolBadge(rolId) {
        switch(rolId) {
            case 1:
                return <Badge bg="primary">Admin</Badge>;
            case 2:
                return <Badge bg="info">Conductor</Badge>;
            case 3:
                return <Badge bg="secondary">Pasajero</Badge>;
        }
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
                        <h1 className="display-5 fw-bold">Lista de Usuarios</h1>
                        <p className="text-muted">Administra los usuarios registrados en la plataforma</p>
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
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Creado En</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((usuario) => (
                                            <tr>
                                                <td className="fw-semibold">{usuario.idUsuarios}</td>
                                                <td>{usuario.nombre}</td>
                                                <td>{usuario.email}</td>
                                                <td>{usuario.telefono || "No especificado"}</td>
                                                <td>{getRolBadge(usuario.idRol)}</td>
                                                <td>
                                                    <Button variant="outline-danger" size="sm"onClick={() => eliminarUsuario(usuario.idUsuarios)}>
                                                        Eliminar
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm"onClick={() => BloquearUsuario(usuario.idUsuarios)}>
                                                        {usuario.estado === 'INACTIVO' ? 'ACTIVAR' : 'Desactivar'}
                                                    </Button>
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

export default AdminUsuarios;