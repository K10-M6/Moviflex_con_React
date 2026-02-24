import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Modal, ProgressBar, Badge } from "react-bootstrap";
import { FaIdCard, FaFileImage, FaArrowLeft, FaCheckCircle, FaCamera, FaVideo, FaExclamationTriangle, FaSmile, FaFrown } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';
import toast, { Toaster } from 'react-hot-toast';

function Documents() {
  const navigate = useNavigate();
  const { token, usuario } = useAuth();
  
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");

  const [frontalBase64, setFrontalBase64] = useState("");
  const [frontalPreview, setFrontalPreview] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCameraFrontal, setShowCameraFrontal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [tipoDocumentoActual, setTipoDocumentoActual] = useState("frontal");
  
  const [documentoValido, setDocumentoValido] = useState(null);
  const [mensajeDocumento, setMensajeDocumento] = useState("");
  const [verificandoDocumento, setVerificandoDocumento] = useState(false);
  const [errorDocumentoBackend, setErrorDocumentoBackend] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const verificarDocumentoAntesDeEnviar = async (base64Image, tipo) => {
    setVerificandoDocumento(true);
    setDocumentoValido(null);
    setErrorDocumentoBackend("");
    
    try {
      const img = document.createElement('img');
      img.src = base64Image;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      if (img.width < 300 || img.height < 200) {
        setDocumentoValido(false);
        setMensajeDocumento("La imagen es muy pequeña. Usa una foto más grande para mejor legibilidad.");
        toast.error('Imagen demasiado pequeña para análisis', { icon: '📸' });
        return false;
      }
      
      const calidadAparente = base64Image.length > 50000;
      if (!calidadAparente) {
        setDocumentoValido(false);
        setMensajeDocumento("La imagen parece tener baja calidad. Usa una foto más nítida.");
        toast.error('Baja calidad de imagen', { icon: '🔍' });
        return false;
      }
      
      setDocumentoValido(true);
      setMensajeDocumento("La imagen tiene buena calidad para verificación");
      toast.success('Imagen apta para verificación', { icon: '✅' });
      return true;
      
    } catch (error) {
      console.error("Error al verificar imagen:", error);
      setDocumentoValido(false);
      setMensajeDocumento("No se pudo verificar la imagen. Intenta de nuevo.");
      return false;
    } finally {
      setVerificandoDocumento(false);
    }
  };

  const iniciarCamara = () => {
    setTipoDocumentoActual('frontal');
    setShowCameraFrontal(true);
    
    setTimeout(() => {
      iniciarCamaraStream();
    }, 100);
  };

  const iniciarCamaraStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
      toast.success('Cámara activada correctamente');
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setShowCameraFrontal(false);
  };

  const tomarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.9);
      
      setFrontalBase64(fotoBase64);
      setFrontalPreview(fotoBase64);
      setErrorDocumentoBackend("");
      verificarDocumentoAntesDeEnviar(fotoBase64, 'frontal');
      toast.success('¡Foto tomada correctamente!');
      
      detenerCamara();
    }
  };

  async function guardarDocumentacion(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrorDocumentoBackend("");
    setLoading(true);

    if (!frontalBase64) {
      const errorMsg = "Debes tomar la foto del documento";
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
        imagenFrontal: frontalBase64
      };

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

      const data = await respuesta.json();

      toast.dismiss(toastId);

      if (respuesta.ok) {
        setSuccess("✅ ¡Documentación enviada exitosamente para revisión!");
        toast.success('Documentación enviada correctamente');
        
        setTimeout(() => {
          navigate("/driver-profile");
        }, 2000);
      } else {
        let mensajeError = data.error || data.message || 'Error al enviar la documentación';
        
        if (mensajeError.toLowerCase().includes("documento") || 
            mensajeError.toLowerCase().includes("ilegible") ||
            mensajeError.toLowerCase().includes("calidad")) {
          
          setDocumentoValido(false);
          setErrorDocumentoBackend(mensajeError);
          toast.error('❌ ' + mensajeError, { duration: 6000 });
        } else {
          setError(mensajeError);
          toast.error(mensajeError);
        }
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

  const imagenLista = frontalBase64;

  return (
    <div style={{
      backgroundColor: '#124c83',
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4acfbd',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
      
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
                
                {errorDocumentoBackend && (
                  <Alert variant="danger" className="py-2 small">
                    <FaExclamationTriangle className="me-2" />
                    {errorDocumentoBackend}
                  </Alert>
                )}

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
                      {frontalBase64 && documentoValido === true && (
                        <Badge bg="success" className="ms-2">Válida</Badge>
                      )}
                      {frontalBase64 && documentoValido === false && (
                        <Badge bg="warning" className="ms-2">Revisar</Badge>
                      )}
                    </Form.Label>
                    <Form.Text className="text-muted d-block mb-2">
                      Toma una foto clara y legible de la parte frontal del documentodonde se vean todos tus datos
                    </Form.Text>
                  
                    <div className="d-grid gap-2 mb-2">
                      <Button
                        variant="outline-success"
                        onClick={() => iniciarCamara()}
                        className="w-100 py-3"
                        disabled={cameraActive || verificandoDocumento}
                        size="lg"
                      >
                        <FaVideo className="me-2" />
                        {frontalBase64 ? '📸 Tomar otra foto' : '📸 Tomar foto del documento'}
                      </Button>
                    </div>
                    
                    {frontalPreview && (
                      <div className="text-center mt-3">
                        <p className="mb-2"><strong>Vista previa frontal:</strong></p>
                        <div style={{ 
                          maxHeight: '200px', 
                          border: `2px solid ${documentoValido === true ? '#4acfbd' : documentoValido === false ? '#ffc107' : '#ddd'}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'inline-block'
                        }}>
                          <img 
                            src={frontalPreview} 
                            alt="Vista previa frontal del documento" 
                            style={{ maxHeight: '200px', width: 'auto' }} 
                          />
                        </div>
                      </div>
                    )}
                  </Form.Group>



                  {verificandoDocumento && (
                    <Alert variant="info" className="py-2 small d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Verificando...</span>
                      </div>
                      Verificando calidad de imagen para análisis...
                    </Alert>
                  )}

                  {!verificandoDocumento && documentoValido === true && (
                    <Alert variant="success" className="py-2 small d-flex align-items-center">
                      <FaSmile className="me-2" size={18} />
                      {mensajeDocumento}
                    </Alert>
                  )}

                  {!verificandoDocumento && documentoValido === false && (
                    <Alert variant="warning" className="py-2 small d-flex align-items-center">
                      <FaFrown className="me-2" size={18} />
                      {mensajeDocumento}
                    </Alert>
                  )}

                  <div className="mt-3 p-2 bg-light rounded-3 small text-start">
                    <div className="fw-bold mb-1">
                      <FaExclamationTriangle className="me-1 text-warning" />
                      Recomendaciones para fotos de documentos
                    </div>
                    <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                      <li>Usa buena iluminación, evita sombras</li>
                      <li>Asegura que todo el texto sea legible</li>
                      <li>El documento debe ocupar la mayor parte de la foto</li>
                      <li>Evita reflejos, brillos o fotos borrosas</li>
                      <li>La foto debe ser a color y nítida</li>
                      <li>Alinea el documento dentro del recuadro guía</li>
                    </ul>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <Button 
                      type="submit" 
                      className="flex-fill py-3"
                      style={{ 
                        background: imagenLista ? 'linear-gradient(20deg, #4acfbd, #59c2ff)' : '#6c757d',
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                      disabled={loading || !imagenLista || !tipoDocumento || !numeroDocumento || verificandoDocumento}
                    >
                      {loading ? 'Enviando documentación...' : '📨 Enviar documentación para revisión'}
                    </Button>

                    <Button variant="outline-secondary" onClick={() => navigate("/driver-profile")} className="px-4">
                      <FaArrowLeft />
                    </Button>
                  </div>
                </Form>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showCameraFrontal} onHide={detenerCamara} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Tomar Foto del Documento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          <div style={{ position: 'relative', backgroundColor: '#000', minHeight: '450px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!cameraActive && (
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white'
              }}>
                <p>Iniciando cámara...</p>
              </div>
            )}
            
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              height: '70%',
              border: '3px solid rgba(74, 207, 189, 0.7)',
              borderRadius: '10px',
              pointerEvents: 'none',
              boxShadow: '0 0 30px rgba(74, 207, 189, 0.5)'
            }} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={detenerCamara} size="lg">
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={tomarFoto}
            disabled={!cameraActive}
            size="lg"
          >
            <FaCamera className="me-2" /> Tomar Foto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Documents;