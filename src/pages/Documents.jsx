import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaIdCard, FaFileImage, FaArrowLeft, FaCheckCircle, FaCamera } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';
import toast, { Toaster } from 'react-hot-toast';

function Documents() {
  const navigate = useNavigate();
  const { token, usuario } = useAuth();
  
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");

  const [imagenFrontal, setImagenFrontal] = useState(null);
  const [imagenDorsal, setImagenDorsal] = useState(null);
  const [imagenFrontalPreview, setImagenFrontalPreview] = useState("");
  const [imagenDorsalPreview, setImagenDorsalPreview] = useState("");
  
  const [frontalBase64, setFrontalBase64] = useState("");
  const [dorsalBase64, setDorsalBase64] = useState("");
  const [convirtiendoFrontal, setConvirtiendoFrontal] = useState(false);
  const [convirtiendoDorsal, setConvirtiendoDorsal] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const frontalInputRef = useRef(null);
  const dorsalInputRef = useRef(null);

  const validarImagen = (file) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const tamañoMaximo = 5 * 1024 * 1024;
    
    if (!tiposPermitidos.includes(file.type)) {
      return "Formato no permitido. Usa JPG, PNG o WEBP";
    }
    if (file.size > tamañoMaximo) {
      return "La imagen no debe superar los 5MB";
    }
    return null;
  };

  const convertirABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageFrontalChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validarImagen(file);
      if (error) {
        toast.error(error);
        setError(error);
        e.target.value = '';
        return;
      }

      try {
        setConvirtiendoFrontal(true);
        
        const previewUrl = URL.createObjectURL(file);
        setImagenFrontalPreview(previewUrl);
        setImagenFrontal(file);
        
        const base64 = await convertirABase64(file);
        setFrontalBase64(base64);
        
        toast.success('Imagen frontal seleccionada correctamente');
      } catch (error) {
        toast.error('Error al procesar la imagen frontal');
      } finally {
        setConvirtiendoFrontal(false);
      }
    }
  };

  const handleImageDorsalChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validarImagen(file);
      if (error) {
        toast.error(error);
        setError(error);
        e.target.value = '';
        return;
      }

      try {
        setConvirtiendoDorsal(true);
        
        const previewUrl = URL.createObjectURL(file);
        setImagenDorsalPreview(previewUrl);
        setImagenDorsal(file);
        
        const base64 = await convertirABase64(file);
        setDorsalBase64(base64);
        
        toast.success('Imagen dorsal seleccionada correctamente');
      } catch (error) {
        toast.error('Error al procesar la imagen dorsal');
      } finally {
        setConvirtiendoDorsal(false);
      }
    }
  };

  async function guardarDocumentacion(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!frontalBase64 || !dorsalBase64) {
      const errorMsg = "Debes seleccionar ambas imágenes";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (!tipoDocumento || !numeroDocumento) {
      const errorMsg = "Todos los campos son obligatorios";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Enviando documentación...');

    try {
      const datosEnviar = {
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento,
        imagenFrontal: frontalBase64,
        imagenDorsal: dorsalBase64
      };

      console.log("Enviando datos como JSON con imágenes en base64");

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/documentacion/documentacion_subir", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(datosEnviar) 
      });

      console.log('Status:', respuesta.status);
      
      const data = await respuesta.json();
      console.log("Respuesta del servidor:", data);

      toast.dismiss(toastId);

      if (respuesta.ok) {
        setSuccess("✅ ¡Documentación enviada exitosamente para revisión!");
        toast.success('Documentación enviada correctamente');
        
        setTimeout(() => {
          navigate("/driver-profile");
        }, 2000);
      } else {
        const errorMsg = data.error || data.message || 'Error al enviar la documentación';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error completo:", error);
      toast.dismiss(toastId);
      toast.error('Error de conexión con el servidor');
      setError("Error de conexión con el servidor: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const ambasImagenesListas = frontalBase64 && dorsalBase64;

  return (
    <div style={{
      backgroundColor: '#124c83',
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toaster />
      
      <Navbar />
      
      <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1, padding: '20px' }}>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow border-2">
              <Card.Body className="p-4">
                
                <div className="text-center mb-4">
                  <img src={Logo} alt="Logo" style={{ width: '180px' }} />
                </div>

                <h3 className="text-center mb-4" style={{ color: '#124c83' }}>
                  <FaIdCard className="me-2" />
                  Registrar Documentación
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={guardarDocumentacion}>
                  <Form.Group className="mb-3" controlId="tipoDocumento">
                    <Form.Label>
                      <strong>Tipo de documento de identidad</strong> <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">-- Seleccione una opción --</option>
                      <option value="LICENCIA">Licencia de conducir</option>
                      <option value="CEDULA">Cédula de ciudadanía</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Elige el tipo de documento que vas a registrar para verificación
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="numeroDocumento">
                    <Form.Label>
                      <strong>Número de identificación personal</strong> <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: 1234567890"
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Ingresa el número completo sin puntos, espacios ni guiones
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="imagenFrontal">
                    <Form.Label className="d-flex align-items-center">
                      <FaFileImage className="me-2" />
                      <strong>Fotografía frontal del documento</strong> <span className="text-danger">*</span>
                      {frontalBase64 && <FaCheckCircle className="text-success ms-2" size={18} />}
                    </Form.Label>
                    <Form.Text className="text-muted d-block mb-2">
                      Sube una foto clara y legible de la parte frontal donde se vean todos tus datos
                    </Form.Text>

                    <Form.Control
                      ref={frontalInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFrontalChange}
                      style={{ display: 'none' }}
                    />
                  
                    <Button
                      variant="outline-primary"
                      onClick={() => frontalInputRef.current.click()}
                      className="w-100 mb-2"
                      disabled={loading || convirtiendoFrontal}
                    >
                      <FaCamera className="me-2" />
                      {imagenFrontal ? '📸 Cambiar foto frontal' : '📤 Seleccionar foto frontal'}
                    </Button>
                    
                    {convirtiendoFrontal && <Alert variant="info">⏳ Procesando imagen frontal...</Alert>}
                    
                    {imagenFrontalPreview && (
                      <div className="text-center mt-2">
                        <p className="mb-1"><small>Vista previa frontal:</small></p>
                        <img src={imagenFrontalPreview} alt="Vista previa frontal del documento" style={{ maxHeight: '150px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="imagenDorsal">
                    <Form.Label className="d-flex align-items-center">
                      <FaFileImage className="me-2" />
                      <strong>Fotografía dorsal del documento</strong> <span className="text-danger">*</span>
                      {dorsalBase64 && <FaCheckCircle className="text-success ms-2" size={18} />}
                    </Form.Label>
                    <Form.Text className="text-muted d-block mb-2">
                      Sube una foto clara de la parte posterior donde se vea el código de barras o información adicional
                    </Form.Text>

                    <Form.Control
                      ref={dorsalInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageDorsalChange}
                      style={{ display: 'none' }}
                    />
                    
                    <Button
                      variant="outline-primary"
                      onClick={() => dorsalInputRef.current.click()}
                      className="w-100 mb-2"
                      disabled={loading || convirtiendoDorsal}
                    >
                      <FaCamera className="me-2" />
                      {imagenDorsal ? '📸 Cambiar foto dorsal' : '📤 Seleccionar foto dorsal'}
                    </Button>
                    
                    {convirtiendoDorsal && <Alert variant="info">⏳ Procesando imagen dorsal...</Alert>}
                    
                    {imagenDorsalPreview && (
                      <div className="text-center mt-2">
                        <p className="mb-1"><small>Vista previa dorsal:</small></p>
                        <img src={imagenDorsalPreview} alt="Vista previa dorsal del documento" style={{ maxHeight: '150px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      </div>
                    )}
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-fill"
                      style={{ 
                        background: ambasImagenesListas ? 'linear-gradient(20deg, #4acfbd, #59c2ff)' : '#6c757d',
                        border: 'none'
                      }}
                      disabled={loading || !ambasImagenesListas || !tipoDocumento || !numeroDocumento}
                    >
                      {loading ? 'Enviando documentación...' : '📨 Enviar documentación para revisión'}
                    </Button>

                    <Button variant="outline-secondary" onClick={() => navigate("/driver-profile")}>
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