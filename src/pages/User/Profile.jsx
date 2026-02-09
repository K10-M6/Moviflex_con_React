import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

function Profile() {
  const { usuario, } = useAuth();
  
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [imagenUrl, setImagenUrl] = useState(null); 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenUrl(URL.createObjectURL(file));
      
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
   
    alert("Datos de perfil actualizados (simulación)");
  };

  return (
    <div style={{ 
        background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
        minHeight: '100vh', minWidth: '100vw'
    }}>
      <Navbar />
      <Container className="py-5">
        <Row className="justify-content-center mt-4">
          <Col md={8} lg={6}>
            <Card className="shadow border-2">
              <Card.Body className="p-4">
                <h2 className="mb-4 text-center">Mi Perfil</h2>
                <Form onSubmit={handleSaveChanges}>
                  
                
                  <div className="text-center mb-4">
                    <img 
                      src={imagenUrl || 'https://via.placeholder.com'} 
                      alt="Perfil" 
                      className="rounded-circle shadow-sm" 
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                    />
                    <Form.Group controlId="formFile" className="mt-3">
                        <Form.Label className="btn btn-outline-primary">Cambiar Foto</Form.Label>
                        <Form.Control type="file" onChange={handleImageChange} style={{ display: 'none' }} />
                    </Form.Group>
                  </div>

                  
                  <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre Completo</Form.Label>
                    <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingresa tu nombre" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formTelefono">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ingresa tu teléfono" />
                  </Form.Group>
                  
                  <Form.Group className="mb-4" controlId="formEmail">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control type="email" defaultValue={usuario?.email} disabled />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button type="submit" style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)', border: 'none'}}>
                        Guardar Cambios
                    </Button>
                    <Button as={Link} to="/tus-viajes" variant="outline-info">
                        Ver Mis Viajes
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Profile;
