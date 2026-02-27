import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge } from "react-bootstrap";
import { FaCar, FaFileImage, FaArrowLeft, FaCheckCircle, FaCamera, FaVideo, FaExclamationTriangle, FaSmile, FaFrown, FaIdCard } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Navbar from '../../components/Navbar';
import Logo from '../Imagenes/TODO_MOVI.png';
import toast, { Toaster } from 'react-hot-toast';

function VehicleRegistration() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Campos exactamente como en el modelo
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [capacidad, setCapacidad] = useState("");

  const [fotoBase64, setFotoBase64] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoComprimida, setFotoComprimida] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const [imagenValida, setImagenValida] = useState(null);
  const [mensajeImagen, setMensajeImagen] = useState("");
  const [verificandoImagen, setVerificandoImagen] = useState(false);
  const [errorBackend, setErrorBackend] = useState("");
  const [buscandoPlaca, setBuscandoPlaca] = useState(false);

  const [placaValidada, setPlacaValidada] = useState(false);

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

  const verificarImagenAntesDeEnviar = async (base64Image) => {
    setVerificandoImagen(true);
    setImagenValida(null);
    setErrorBackend("");

    try {
      const img = document.createElement('img');
      img.src = base64Image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      if (img.width < 600 || img.height < 400) {
        setImagenValida(false);
        setMensajeImagen("La imagen es muy pequeña. Acerca la cámara al vehículo.");
        toast.error('Imagen demasiado pequeña');
        return false;
      }

      setImagenValida(true);
      setMensajeImagen("La imagen tiene buena calidad");
      toast.success('Imagen apta');
      return true;

    } catch (error) {
      console.error("Error al verificar imagen:", error);
      setImagenValida(false);
      setMensajeImagen("No se pudo verificar la imagen. Intenta de nuevo.");
      return false;
    } finally {
      setVerificandoImagen(false);
    }
  };

  const iniciarCamara = () => {
    setShowCamera(true);
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
    setShowCamera(false);
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

      setFotoBase64(fotoBase64);
      setFotoPreview(fotoBase64);

      const comprimida = await comprimirImagen(fotoBase64, 250);
      setFotoComprimida(comprimida);

      setErrorBackend("");
      setPlacaValidada(false);
      await verificarImagenAntesDeEnviar(fotoBase64);

      toast.success('¡Foto tomada correctamente!');
      detenerCamara();

      // EXTRAER PLACA AUTOMÁTICAMENTE
      extraerPlacaDeFoto(comprimida);
    }
  };

  const extraerPlacaDeFoto = async (base64) => {
    setBuscandoPlaca(true);
    const toastId = toast.loading("Analizando placa...");
    try {
      const resp = await fetch("https://backendmovi-production-c657.up.railway.app/api/vehiculos/extraer-placa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fotoVehiculo: base64 })
      });

      const data = await resp.json();
      if (data.plate_text) {
        setPlaca(data.plate_text);
        setFotoComprimida(base64); // Por si acaso
        toast.success(`Placa detectada: ${data.plate_text}`, { id: toastId });
      } else {
        toast.error("No se pudo leer la placa automáticamente. Por favor ingrésala manual.", { id: toastId });
      }
    } catch (err) {
      console.error("Error extraiendo placa:", err);
      toast.error("Error al conectar con el servicio de reconocimiento", { id: toastId });
    } finally {
      setBuscandoPlaca(false);
    }
  };

  const validarPlaca = (placa) => {
    const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
    return placaRegex.test(placa.toUpperCase());
  };

  async function guardarVehiculo(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrorBackend("");
    setLoading(true);

    // Validaciones
    if (!marca.trim()) {
      setError("La marca es requerida");
      toast.error("La marca es requerida");
      setLoading(false);
      return;
    }

    if (!modelo.trim()) {
      setError("El modelo es requerido");
      toast.error("El modelo es requerido");
      setLoading(false);
      return;
    }

    if (!placa.trim()) {
      setError("La placa es requerida");
      toast.error("La placa es requerida");
      setLoading(false);
      return;
    }

    if (!validarPlaca(placa)) {
      setError("Formato de placa inválido. Debe ser 3 letras seguidas de 3 números (ej: ABC123)");
      toast.error("Formato de placa inválido");
      setLoading(false);
      return;
    }

    if (!capacidad || parseInt(capacidad) < 1) {
      setError("La capacidad debe ser al menos 1 pasajero");
      toast.error("Capacidad inválida");
      setLoading(false);
      return;
    }

    if (!fotoComprimida) {
      const errorMsg = "Debes tomar una foto del vehículo donde se vea la placa";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Registrando vehículo...');

    try {
      // Datos exactamente como los espera el modelo
      const datosEnviar = {
        marca: marca.trim(),
        modelo: modelo.trim(),
        placa: placa.toUpperCase().trim(),
        capacidad: parseInt(capacidad),
        fotoVehiculo: fotoComprimida
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/vehiculos/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(datosEnviar)
      });

      const data = await respuesta.json();

      toast.dismiss(toastId);

      if (respuesta.ok) {
        if (data.placaValidada) {
          setSuccess("✅ ¡Vehículo registrado y placa validada automáticamente!");
          toast.success('¡Vehículo y placa validados!', { duration: 5000 });
          setPlacaValidada(true);
        } else {
          setSuccess("✅ Vehículo registrado. La placa está pendiente de validación manual por un administrador.");
          toast.success('Vehículo registrado. Placa en revisión.', { duration: 6000 });
        }

        // Limpiar formulario
        setMarca("");
        setModelo("");
        setPlaca("");
        setCapacidad("");
        setFotoBase64("");
        setFotoPreview("");
        setFotoComprimida("");
        setImagenValida(null);

        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate("/driver-profile");
        }, 3000);
      } else {
        let mensajeError = data.error || data.message || 'Error al registrar el vehículo';

        if (mensajeError.toLowerCase().includes("placa") ||
          mensajeError.toLowerCase().includes("ilegible") ||
          mensajeError.toLowerCase().includes("calidad")) {
          setImagenValida(false);
          setErrorBackend(mensajeError);
          toast.error('❌ ' + mensajeError);
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
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#4acfbd', secondary: '#fff' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ff4b4b', secondary: '#fff' },
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
                  <FaCar className="me-2" />
                  Registro de Vehículo
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {errorBackend && (
                  <Alert variant="danger" className="py-2 small">
                    <FaExclamationTriangle className="me-2" />
                    {errorBackend}
                  </Alert>
                )}

                {placaValidada && (
                  <Alert variant="success" className="py-2 small d-flex align-items-center">
                    <FaCheckCircle className="me-2" />
                    ¡Placa validada correctamente!
                  </Alert>
                )}

                <Form onSubmit={guardarVehiculo}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Marca <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={marca}
                          onChange={(e) => setMarca(e.target.value)}
                          placeholder="Ej: Toyota, Renault"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Modelo <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={modelo}
                          onChange={(e) => setModelo(e.target.value)}
                          placeholder="Ej: Corolla, Logan"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <FaIdCard className="me-1" /> Placa <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={placa}
                          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                          placeholder="ABC123"
                          maxLength="6"
                          style={{ textTransform: 'uppercase' }}
                          disabled={loading}
                        />
                        <Form.Text className="text-muted">
                          3 letras + 3 números (ej: ABC123)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Capacidad <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          value={capacidad}
                          onChange={(e) => setCapacidad(e.target.value)}
                          placeholder="Ej: 4"
                          min="1"
                          disabled={loading}
                        />
                        <Form.Text className="text-muted">Número de pasajeros</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Foto del vehículo (debe mostrar la placa) */}
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center fw-bold">
                      <FaFileImage className="me-2" />
                      Foto del Vehículo <span className="text-danger">*</span>
                      {fotoBase64 && <FaCheckCircle className="text-success ms-2" size={18} />}
                      {fotoBase64 && imagenValida === true && (
                        <Badge bg="success" className="ms-2">Válida</Badge>
                      )}
                      {fotoBase64 && imagenValida === false && (
                        <Badge bg="warning" className="ms-2">Revisar</Badge>
                      )}
                    </Form.Label>
                    <Form.Text className="text-muted d-block mb-2">
                      La foto debe mostrar el vehículo completo con la placa visible
                    </Form.Text>

                    <Button
                      variant="outline-success"
                      onClick={iniciarCamara}
                      className="w-100 py-3 mb-3"
                      disabled={cameraActive || verificandoImagen || loading}
                      size="lg"
                    >
                      <FaVideo className="me-2" />
                      {fotoBase64 ? 'Tomar otra foto' : 'Tomar foto del vehículo'}
                    </Button>

                    {fotoPreview && (
                      <div className="text-center mt-3">
                        <div style={{
                          maxHeight: '200px',
                          border: `2px solid ${imagenValida === true ? '#4acfbd' : imagenValida === false ? '#ffc107' : '#ddd'}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'inline-block'
                        }}>
                          <img
                            src={fotoPreview}
                            alt="Vista previa del vehículo"
                            style={{ maxHeight: '200px', width: 'auto' }}
                          />
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  {verificandoImagen && (
                    <Alert variant="info" className="py-2 small d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" />
                      Verificando calidad de imagen...
                    </Alert>
                  )}

                  {!verificandoImagen && imagenValida === true && (
                    <Alert variant="success" className="py-2 small d-flex align-items-center">
                      <FaSmile className="me-2" />
                      {mensajeImagen}
                    </Alert>
                  )}

                  {!verificandoImagen && imagenValida === false && (
                    <Alert variant="warning" className="py-2 small d-flex align-items-center">
                      <FaFrown className="me-2" />
                      {mensajeImagen}
                    </Alert>
                  )}

                  {/* Recomendaciones */}
                  <div className="mt-3 p-2 bg-light rounded-3 small">
                    <div className="fw-bold mb-1">
                      <FaExclamationTriangle className="me-1 text-warning" />
                      Recomendaciones
                    </div>
                    <ul className="mb-0 ps-3">
                      <li>La placa debe ser claramente visible</li>
                      <li>Buena iluminación, sin reflejos</li>
                      <li>El vehículo debe ocupar la mayor parte de la foto</li>
                      <li>Evita fotos borrosas o movidas</li>
                    </ul>
                  </div>

                  {/* Botones */}
                  <div className="d-flex gap-2 mt-4">
                    <Button
                      type="submit"
                      className="flex-fill py-3"
                      style={{
                        background: fotoComprimida ? 'linear-gradient(20deg, #4acfbd, #59c2ff)' : '#6c757d',
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                      disabled={loading || !fotoComprimida || verificandoImagen}
                    >
                      {loading ? 'Registrando...' : 'Registrar vehículo'}
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

      {/* Modal de cámara - sin recuadros que estorben */}
      <Modal show={showCamera} onHide={detenerCamara} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Tomar Foto del Vehículo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          <div style={{ backgroundColor: '#000', minHeight: '450px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
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

export default VehicleRegistration;