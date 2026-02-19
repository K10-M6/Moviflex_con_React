import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaIdCard, FaFileImage, FaArrowLeft, FaCloudUploadAlt } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';

function Documents() {
  const navigate = useNavigate();
  const { token, usuario } = useAuth();
  
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [imagenFrontal, setImagenFrontal] = useState(null);
  const [imagenDorsal, setImagenDorsal] = useState(null);
  const [imagenFrontalPreview, setImagenFrontalPreview] = useState("");
  const [imagenDorsalPreview, setImagenDorsalPreview] = useState("");
  
  // Estados para subida a Cloudinary
  const [subiendoFrontal, setSubiendoFrontal] = useState(false);
  const [subiendoDorsal, setSubiendoDorsal] = useState(false);
  const [frontalUrl, setFrontalUrl] = useState("");
  const [dorsalUrl, setDorsalUrl] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/tu-cloud-name/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "tu-upload-preset";

  const handleImageFrontalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFrontal(file);
      setImagenFrontalPreview(URL.createObjectURL(file));
      setFrontalUrl("");
    }
  };

  const handleImageDorsalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenDorsal(file);
      setImagenDorsalPreview(URL.createObjectURL(file));
      setDorsalUrl("");
    }
  };

  const subirImagenACloudinary = async (file, tipo) => {
    const setSubiendo = tipo === 'frontal' ? setSubiendoFrontal : setSubiendoDorsal;
    setSubiendo(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const respuesta = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      const data = await respuesta.json();
      
      if (respuesta.ok) {
        if (tipo === 'frontal') {
          setFrontalUrl(data.secure_url);
        } else {
          setDorsalUrl(data.secure_url);
        }
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Error al subir imagen');
      }
    } catch (error) {
      setError(`Error al subir imagen ${tipo}: ${error.message}`);
      return null;
    } finally {
      setSubiendo(false);
    }
  };

  async function guardarDocumentacion(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!token) {
      const usuarioLocal = JSON.parse(localStorage.getItem("app_usuario") || "{}");
      if (!usuarioLocal || !usuarioLocal.registroTemporal) {
        setError("No hay sesión activa. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }
    }

    if (!tipoDocumento || !numeroDocumento || !imagenFrontal || !imagenDorsal) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    try {
      let frontalImageUrl = frontalUrl;
      let dorsalImageUrl = dorsalUrl;

      if (!frontalUrl && imagenFrontal) {
        frontalImageUrl = await subirImagenACloudinary(imagenFrontal, 'frontal');
      }
      if (!dorsalUrl && imagenDorsal) {
        dorsalImageUrl = await subirImagenACloudinary(imagenDorsal, 'dorsal');
      }

      if (!frontalImageUrl || !dorsalImageUrl) {
        setError("No se pudieron subir las imágenes");
        setLoading(false);
        return;
      }

      const datosEnviar = {
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento,
        imagenFrontalUrl: frontalImageUrl,
        imagenDorsalUrl: dorsalImageUrl
      };

      console.log("Enviando datos:", datosEnviar);

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/documentacion_subir", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(datosEnviar)
      });

      const data = await respuesta.json();
      console.log("Respuesta del servidor:", data);

      if (respuesta.ok) {
        setSuccess("✅ ¡Documentación enviada exitosamente para revisión!");
        
        const usuarioLocal = JSON.parse(localStorage.getItem("app_usuario") || "{}");
        if (usuarioLocal.registroTemporal) {
          delete usuarioLocal.registroTemporal;
          localStorage.setItem("app_usuario", JSON.stringify(usuarioLocal));
        }
        
        setTimeout(() => {
          navigate("/perfil");
        }, 2000);
      } else {
        setError(data.message || 'Error al enviar la Documentación');
      }
    } catch (error) {
      console.error("Error completo:", error);
      setError("Error de conexión con el servidor: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const imagenesListas = frontalUrl && dorsalUrl;

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
          <Col xs={12} md={8} lg={6}>
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

                <Form onSubmit={guardarDocumentacion}>
                  
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
                    <Form.Label>
                      Imagen Frontal del Documento <span className="text-danger">*</span>
                      {frontalUrl && <span className="text-success ms-2">✓ Subida</span>}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageFrontalChange}
                      required={!frontalUrl}
                      disabled={loading || subiendoFrontal}
                    />
                    {subiendoFrontal && (
                      <div className="mt-2 text-info">
                        <FaCloudUploadAlt className="me-2" />
                        Subiendo imagen...
                      </div>
                    )}
                    {imagenFrontalPreview && (
                      <div className="mt-2 text-center">
                        <img 
                          src={imagenFrontalPreview} 
                          alt="Vista previa frontal" 
                          style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '5px' }} 
                        />
                        {frontalUrl && (
                          <div className="mt-1">
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => subirImagenACloudinary(imagenFrontal, 'frontal')}
                              disabled={subiendoFrontal}
                            >
                              {frontalUrl ? 'Re-subir' : 'Subir a Cloudinary'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Form.Group>

                  {/* IMAGEN DORSAL */}
                  <Form.Group className="mb-4" controlId="imagenDorsal">
                    <Form.Label>
                      Imagen Dorsal del Documento <span className="text-danger">*</span>
                      {dorsalUrl && <span className="text-success ms-2">✓ Subida</span>}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageDorsalChange}
                      required={!dorsalUrl}
                      disabled={loading || subiendoDorsal}
                    />
                    {subiendoDorsal && (
                      <div className="mt-2 text-info">
                        <FaCloudUploadAlt className="me-2" />
                        Subiendo imagen...
                      </div>
                    )}
                    {imagenDorsalPreview && (
                      <div className="mt-2 text-center">
                        <img 
                          src={imagenDorsalPreview} 
                          alt="Vista previa dorsal" 
                          style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '5px' }} 
                        />
                        {dorsalUrl && (
                          <div className="mt-1">
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => subirImagenACloudinary(imagenDorsal, 'dorsal')}
                              disabled={subiendoDorsal}
                            >
                              {dorsalUrl ? 'Re-subir' : 'Subir a Cloudinary'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Form.Group>

                  {/* BOTONES */}
                  <div className="d-flex gap-2 mb-3">
                    <Button 
                      type="submit" 
                      className="flex-fill"
                      style={{ background: 'linear-gradient(20deg, #4acfbd, rgba(89, 194, 255, 0.66))' }}
                      disabled={loading || subiendoFrontal || subiendoDorsal || !imagenesListas}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <FaFileImage className="me-2" />
                          {imagenesListas ? 'Enviar Documentación' : 'Primero sube las imágenes'}
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

                  {/* Mensaje de ayuda */}
                  {!imagenesListas && imagenFrontal && imagenDorsal && (
                    <Alert variant="info" className="small">
                      <FaCloudUploadAlt className="me-2" />
                      Haz clic en "Subir a Cloudinary" debajo de cada imagen antes de enviar.
                    </Alert>
                  )}
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