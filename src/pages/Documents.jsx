import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import Navbar from '../components/Navbar';

function RegisterDocumentacion() {
  const navigate = useNavigate();
  
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [imagenFrontal, setImagenFrontal] = useState(null);
  const [imagenDorsal, setImagenDorsal] = useState(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function guardarDocumentacion(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append('tipoDocumento', tipoDocumento);
        formData.append('numeroDocumento', numeroDocumento);
        if (imagenFrontal) formData.append('imagenFrontal', imagenFrontal);
        if (imagenDorsal) formData.append('imagenDorsal', imagenDorsal);

        const respuesta = await fetch("http://localhost:3000/api/auth/documentacion_subir", {
            method: "POST",
            body: formData
        });

        const data = await respuesta.json();
        console.log(data);

        if (respuesta.ok) {
            setSuccess("¡Documentación enviada exitosamente para revisión!");
            setTimeout(() => {
              navigate("/perfil"); 
            }, 1500);
        } else {
            setError(data.message || 'Error al enviar la Documentación');
        }
    }

  return (
    <div style={{background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', minHeight: '100vh', width: '100vw'}}>
    <Navbar/>
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col xs={12} md={5} lg={5}>
          <Card className="shadow border-4">
            <Card.Body className="p-4">
              <Card.Title as="h2" className="text-center mb-4">
                Registrar Documentación
              </Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={guardarDocumentacion} encType="multipart/form-data">
                
                <Form.Group className="mb-3" controlId="tipoDocumento">
                  <Form.Select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    required
                  >
                    <option value="">Seleccione tipo de documento</option>
                    <option value="LICENCIA">Licencia de conducir</option>
                    <option value="Cedula">Cédula de ciudadanía </option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="numeroDocumento">
                  <Form.Control
                    type="text"
                    placeholder="Número de Documento"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="imagenFrontal">
                  <Form.Label>Imagen Frontal del Documento</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagenFrontal(e.target.files[0])}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="imagenDorsal">
                  <Form.Label>Imagen Dorsal del Documento</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagenDorsal(e.target.files[0])}
                    required
                  />
                </Form.Group>

                <Button type="submit" size="lg" className="w-100" style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'}}>
                  Enviar Documentación
                </Button>
              </Form>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
}

export default RegisterDocumentacion;