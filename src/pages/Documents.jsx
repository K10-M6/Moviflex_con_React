import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaIdCard, FaFileImage, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "./context/AuthContext"; // ← AGREGAR
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';

function Documents() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [imagenFrontal, setImagenFrontal] = useState(null);
  const [imagenDorsal, setImagenDorsal] = useState(null);
  const [imagenFrontalPreview, setImagenFrontalPreview] = useState("");
  const [imagenDorsalPreview, setImagenDorsalPreview] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageFrontalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFrontal(file);
      setImagenFrontalPreview(URL.createObjectURL(file));
    }
  };

  const handleImageDorsalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenDorsal(file);
      setImagenDorsalPreview(URL.createObjectURL(file));
    }
  };

  async function guardarDocumentacion(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!token) {
      setError("No hay sesión activa. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    if (!tipoDocumento || !numeroDocumento || !imagenFrontal || !imagenDorsal) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('tipoDocumento', tipoDocumento);
    formData.append('numeroDocumento', numeroDocumento);
    formData.append('imagenFrontal', imagenFrontal);
    formData.append('imagenDorsal', imagenDorsal);

    try {
      const respuesta = await fetch("https://backendmovi-production.up.railway.app/api/documentacion/documentacion_subir", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}` // ← TOKEN AQUÍ
        },
        body: formData
      });

      const data = await respuesta.json();
      console.log(data);

      if (respuesta.ok) {
        setSuccess("✅ ¡Documentación enviada exitosamente para revisión!");
        setTimeout(() => {
          navigate("/perfil");
        }, 2000);
      } else {
        setError(data.message || 'Error al enviar la Documentación');
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      backgroundColor: '#124c83',
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      
      <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1, padding: '20px' }}>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={5}>
            <Card className="shadow border-2" style={{ fontSize: '0.95rem' }}>
              <Card.Body className="p-4">
                
                <div className="text-center mb-4">
                  <img src={Logo} alt="Logo Moviflexx" 
                    style={{
                      width: '180px',
                      height: 'auto',
                    }}
                  />
                </div>

                <h3 className="text-center mb-4" style={{ color: '#124c83' }}>
                  <FaIdCard className="me-2" />
                  Registrar Documentación
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={guardarDocumentacion} encType="multipart/form-data">
                  
                  <Form.Group className="mb-3" controlId="tipoDocumento">
                    <Form.Label>Tipo de Documento <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Seleccione tipo de documento</option>
                      <option value="LICENCIA">Licencia de conducir</option>
                      <option value="CEDULA">Cédula de ciudadanía</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="numeroDocumento">
                    <Form.Label>Número de Documento <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingrese el número de documento"
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="imagenFrontal">
                    <Form.Label>Imagen Frontal del Documento <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageFrontalChange}
                      required
                      disabled={loading}
                    />
                    {imagenFrontalPreview && (
                      <div className="mt-2 text-center">
                        <img 
                          src={imagenFrontalPreview} 
                          alt="Vista previa frontal" 
                          style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '5px' }} 
                        />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="imagenDorsal">
                    <Form.Label>Imagen Dorsal del Documento <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageDorsalChange}
                      required
                      disabled={loading}
                    />
                    {imagenDorsalPreview && (
                      <div className="mt-2 text-center">
                        <img 
                          src={imagenDorsalPreview} 
                          alt="Vista previa dorsal" 
                          style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '5px' }} 
                        />
                      </div>
                    )}
                  </Form.Group>

                  <div className="d-flex gap-2 mb-3">
                    <Button 
                      type="submit" 
                      className="flex-fill"
                      style={{ background: 'linear-gradient(20deg, #4acfbd, rgba(89, 194, 255, 0.66))' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <FaFileImage className="me-2" />
                          Enviar Documentación
                        </>
                      )}
                    </Button>

                    <Button 
                      variant="outline-secondary"
                      onClick={() => navigate("/perfil")}
                    >
                      <FaArrowLeft />
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

export default Documents;