import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge, Table } from "react-bootstrap";
import { FaIdCard, FaFileImage, FaArrowLeft, FaCheckCircle, FaCamera, FaVideo, FaExclamationTriangle, FaSmile, FaFrown, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';
import toast, { Toaster } from 'react-hot-toast';

function Documents() {
  const navigate = useNavigate();
  const { token, usuario } = useAuth();

  const [frontalBase64, setFrontalBase64] = useState("");
  const [frontalPreview, setFrontalPreview] = useState("");
  const [frontalComprimida, setFrontalComprimida] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [datosExtraidos, setDatosExtraidos] = useState(null);

  const [showCameraFrontal, setShowCameraFrontal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const [documentoValido, setDocumentoValido] = useState(null);
  const [mensajeDocumento, setMensajeDocumento] = useState("");
  const [verificandoDocumento, setVerificandoDocumento] = useState(false);
  const [errorDocumentoBackend, setErrorDocumentoBackend] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const comprimirImagen = (base64, maxSizeKB = 300) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let calidad = 0.8;
        let comprimida = canvas.toDataURL('image/jpeg', calidad);

        while (comprimida.length > maxSizeKB * 1024 && calidad > 0.3) {
          calidad -= 0.1;
          comprimida = canvas.toDataURL('image/jpeg', calidad);
        }

        resolve(comprimida);
      };
    });
  };

  const verificarDocumentoAntesDeEnviar = async (base64Image) => {
    setVerificandoDocumento(true);
    setDocumentoValido(null);
    setErrorDocumentoBackend("");

    try {
      const img = document.createElement('img');
      img.src = base64Image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      if (img.width < 400 || img.height < 300) {
        setDocumentoValido(false);
        setMensajeDocumento("La imagen es muy pequeña. Acerca la cámara al documento.");
        toast.error('Imagen demasiado pequeña', { icon: '📸' });
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
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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

  const tomarFoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.95);

      setFrontalBase64(fotoBase64);
      setFrontalPreview(fotoBase64);

      const comprimida = await comprimirImagen(fotoBase64, 250);
      setFrontalComprimida(comprimida);

      setErrorDocumentoBackend("");
      await verificarDocumentoAntesDeEnviar(fotoBase64);

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

    if (!frontalComprimida) {
      const errorMsg = "Debes tomar la foto del documento";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Enviando documentación...');

    try {
      const datosEnviar = {
        tipoDocumento: "LICENCIA_CONDUCCION",
        imagenFrontal: frontalComprimida
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
        setSuccess("✅ ¡Licencia de conducir enviada exitosamente para revisión!");
        toast.success('Documentación enviada correctamente');

        if (data.datosLicencia) {
          setDatosExtraidos(data.datosLicencia);
        }

        setTimeout(() => {
          navigate("/driver-profile");
        }, 3000);
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

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      backgroundImage: `linear-gradient(rgba(117, 192, 177, 0.55), rgba(117, 192, 177, 0.31)), url('https://vazquezauto.com.ar/wp-content/uploads/2024/01/tips1.png.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
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

                <h3 className="text-center mb-4" style={{ color: '#347064' }}>
                  <FaIdCard className="me-2" />
                  Registro de Licencia de Conducir
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

                  <Form.Group className="mb-4" controlId="imagenFrontal">
                    <Form.Label className="d-flex align-items-center">
                      <FaFileImage className="me-2" />
                      <strong>Fotografía de la Licencia de Conducir</strong> <span className="text-danger">*</span>
                      {frontalBase64 && <FaCheckCircle className="text-success ms-2" size={18} />}
                      {frontalBase64 && documentoValido === true && (
                        <Badge bg="success" className="ms-2">Válida</Badge>
                      )}
                      {frontalBase64 && documentoValido === false && (
                        <Badge bg="warning" className="ms-2">Revisar</Badge>
                      )}
                    </Form.Label>
                    <Form.Text className="text-muted d-block mb-2">
                      Toma una foto clara y legible de tu licencia de conducir donde se vean todos tus datos
                    </Form.Text>

                    <div className="d-grid gap-2 mb-2">
                      <Button
                        variant="outline-success"
                        onClick={iniciarCamara}
                        className="w-100 py-3"
                        disabled={cameraActive || verificandoDocumento}
                        size="lg"
                      >
                        <FaVideo className="me-2" />
                        {frontalBase64 ? '📸 Tomar otra foto' : '📸 Tomar foto de la licencia'}
                      </Button>
                    </div>

                    {frontalPreview && (
                      <div className="text-center mt-3">
                        <p className="mb-2"><strong>Vista previa:</strong></p>
                        <div style={{
                          maxHeight: '200px',
                          border: `2px solid ${documentoValido === true ? '#4acfbd' : documentoValido === false ? '#ffc107' : '#ddd'}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'inline-block'
                        }}>
                          <img
                            src={frontalPreview}
                            alt="Vista previa de la licencia"
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
                      Verificando calidad de imagen...
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

                  {datosExtraidos && (
                    <Card className="mt-4 border-success">
                      <Card.Header className="bg-success text-white">
                        <FaCheckCircle className="me-2" />
                        Datos extraídos de la licencia
                      </Card.Header>
                      <Card.Body>
                        <Table bordered size="sm">
                          <tbody>
                            <tr>
                              <td><strong><FaUser className="me-2" />Nombre:</strong></td>
                              <td>{datosExtraidos.nombre}</td>
                            </tr>
                            <tr>
                              <td><strong>Identificación:</strong></td>
                              <td>{datosExtraidos.identificacion}</td>
                            </tr>
                            <tr>
                              <td><strong><FaCalendarAlt className="me-2" />Fecha Expedición:</strong></td>
                              <td>{formatearFecha(datosExtraidos.fechaExpedicion)}</td>
                            </tr>
                            <tr>
                              <td><strong>Categoría:</strong></td>
                              <td><Badge bg="info">{datosExtraidos.categoria}</Badge></td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  )}

                  <div className="mt-3 p-2 bg-light rounded-3 small text-start">
                    <div className="fw-bold mb-1">
                      <FaExclamationTriangle className="me-1 text-warning" />
                      Recomendaciones para la foto
                    </div>
                    <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                      <li>Usa buena iluminación, evita sombras</li>
                      <li>Asegura que todos los textos sean legibles</li>
                      <li>La licencia debe ocupar la mayor parte de la foto</li>
                      <li>Evita reflejos, brillos o fotos borrosas</li>
                      <li>La foto debe ser a color y nítida</li>
                      <li>Asegúrate que se vea el código QR y el holograma</li>
                    </ul>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <Button
                      type="submit"
                      className="flex-fill py-3"
                      style={{
                        background: frontalComprimida ? 'linear-gradient(20deg, #4acfbd, #59c2ff)' : '#6c757d',
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                      disabled={loading || !frontalComprimida || verificandoDocumento}
                    >
                      {loading ? 'Enviando documentación...' : '📨 Enviar licencia para revisión'}
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
            Tomar Foto de la Licencia de Conducir
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
              height: '60%',
              border: '3px solid rgba(74, 207, 189, 0.7)',
              borderRadius: '10px',
              pointerEvents: 'none',
              boxShadow: '0 0 30px rgba(74, 207, 189, 0.5)'
            }} />

            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}>
              <FaCamera className="me-2" />Alinea la licencia dentro del recuadro
            </div>
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