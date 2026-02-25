import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Modal, ProgressBar } from "react-bootstrap";
import Logo from './Imagenes/TODO_MOVI.png';
// Importación de las nuevas imágenes
import FondoPantalla from './Imagenes/AutoresContacto.png';
import ImagenTransparencia from './Imagenes/TRANSPARENCIA MOVIFLEX.png';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaQrcode, FaCamera, FaVideo, FaUserCircle } from "react-icons/fa";
import Navbar from '../components/Navbar';
import QRScanner from '../components/QRScanner';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    
    const [showFacialModal, setShowFacialModal] = useState(false);
    const [fotoBase64, setFotoBase64] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const [verificando, setVerificando] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
    const navigate = useNavigate();
    const { login, token, usuario } = useAuth();

    const ROLES = {
        ADMIN: 1,
        CONDUCTOR: 2,
        VIAJERO: 3
    };

    useEffect(() => {
        const rolId = usuario?.idRol || usuario?.rol?.id;

        if (rolId === ROLES.ADMIN) {
            navigate("/dashboard/home");
        } else if (rolId === ROLES.CONDUCTOR) {
            navigate("/driver-home");
        } else if (rolId === ROLES.VIAJERO) {
            navigate("/user-home");
        }
    }, [token, usuario, navigate]);

    const iniciarCamara = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
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
            setError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const detenerCamara = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
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
            
            setFotoBase64(fotoBase64);
            setFotoPreview(fotoBase64);
            
            detenerCamara();
        }
    };

    const abrirFacialModal = () => {
        setFotoBase64("");
        setFotoPreview("");
        setError("");
        setShowFacialModal(true);
        setTimeout(() => iniciarCamara(), 500);
    };

    const cerrarFacialModal = () => {
        detenerCamara();
        setShowFacialModal(false);
        setFotoBase64("");
        setFotoPreview("");
    };

    const enviarLoginFacial = async () => {
        if (!fotoBase64) {
            setError("Debes tomar una foto primero");
            return;
        }

        setVerificando(true);
        setError("");

        try {
            const datosEnviar = { image: fotoBase64 };

            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosEnviar)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                if (!data.token || !data.usuario) {
                    setError('Error en la respuesta del servidor');
                    return;
                }

                login(data.token, data.usuario);
                setSuccess("¡Login facial exitoso!");
                cerrarFacialModal();

                const user = data.usuario;
                const rolId = user.idRol || user.rol?.id;

                if (rolId === ROLES.ADMIN) {
                    navigate("/dashboard/home");
                } else if (rolId === ROLES.CONDUCTOR) {
                    navigate("/driver-home");
                } else if (rolId === ROLES.VIAJERO) {
                    navigate("/user-home");
                }
            } else {
                setError(data.error || data.message || 'Rostro no reconocido');
            }
        } catch (error) {
            console.error("Error:", error);
            setError('Error en la conexión: ' + error.message);
        } finally {
            setVerificando(false);
        }
    };

    async function guardar(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await respuesta.json();
            if (respuesta.ok) {
                if (!data.token || !data.usuario) {
                    setError('Credenciales inválidas. El servidor no devolvió token/usuario.');
                    return;
                }

                login(data.token, data.usuario);
                setSuccess("¡Login exitoso!");

                const user = data.usuario;
                const rolId = user.idRol || user.rol?.id;

                if (rolId === ROLES.ADMIN) {
                    navigate("/dashboard/home");
                } else if (rolId === ROLES.CONDUCTOR) {
                    navigate("/driver-home");
                } else if (rolId === ROLES.VIAJERO) {
                    navigate("/user-home");
                }
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            setError('Error en la conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleQRScan = async (qrData) => {
        setLoading(true);
        setError("");

        try {
            const datos = JSON.parse(qrData);

            if (datos.tipo === 'login_token') {
                if (datos.expira && datos.expira < Date.now()) {
                    setError("El código QR ha expirado. Genera uno nuevo.");
                    setLoading(false);
                    return;
                }

                if (datos.token) {
                    const usuarioQR = {
                        email: datos.email,
                        idRol: datos.idRol
                    };

                    login(datos.token, usuarioQR);
                    setSuccess("¡Login automático con QR exitoso!");
                }

            } else {
                setError("El código QR no es válido para iniciar sesión");
            }
        } catch (error) {
            setError("El código QR no tiene el formato correcto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundImage: `url(${FondoPantalla})`, // Fondo actualizado
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            minWidth: '100vw',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />
            <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1 }}>
                <Row className="justify-content-center align-items-center">
                    
                    <Col xs={12} md={5} lg={4} xl={5}>
                        <Card className="shadow-lg border-0" style={{ 
                            borderRadius: '25px', 
                            overflow: 'hidden',
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)' // Ligera transparencia para el card
                        }}>
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Logo Moviflexx"
                                        style={{ width: '140px', height: 'auto' }}
                                    />
                                    <h5 className="fw-bold text-dark mt-3">¡Bienvenido de nuevo!</h5>
                                </div>

                                <Button
                                    onClick={() => setShowQRScanner(true)}
                                    variant="outline-primary"
                                    className="w-100 py-2 mb-2 d-flex justify-content-center align-items-center gap-2"
                                    style={{ borderRadius: '12px', borderColor: '#4acfbd', color: '#4acfbd', fontWeight: 'bold' }}
                                    disabled={loading}
                                >
                                    <FaQrcode />
                                    {loading ? 'Procesando...' : 'Iniciar sesión con QR'}
                                </Button>

                                <Button
                                    onClick={abrirFacialModal}
                                    variant="outline-success"
                                    className="w-100 py-2 mb-3 d-flex justify-content-center align-items-center gap-2"
                                    style={{ borderRadius: '12px', borderColor: '#28a745', color: '#28a745', fontWeight: 'bold' }}
                                    disabled={loading}
                                >
                                    <FaCamera />
                                    {loading ? 'Procesando...' : 'Login Facial'}
                                </Button>

                                <div className="text-center mb-2">
                                    <small className="text-muted">o</small>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                                {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label className="small fw-bold">
                                            <FaEnvelope className="me-2" />Correo Electrónico
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Ingrese su correo"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                            style={{ borderRadius: '12px', padding: '10px 15px' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="password">
                                        <Form.Label className="small fw-bold">
                                            <FaLock className="me-2" />Contraseña
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Ingrese su contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{ borderRadius: '12px', padding: '10px 40px 10px 15px' }}
                                            />
                                            <span 
                                                className="position-absolute end-0 top-50 translate-middle-y me-3" 
                                                style={{ cursor: 'pointer', zIndex: 10 }} 
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash color="#666"/> : <FaEye color="#666"/>}
                                            </span>
                                        </div>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 py-2 mb-3"
                                        style={{ background: '#4acfbd', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </Button>
                                </Form>
                                <p className="text-center text-muted mt-3">
                                    ¿No tienes cuenta? <a href="/register" className="text-decoration-none fw-bold" style={{ color: '#124c83' }}>Regístrate</a>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* SECCIÓN DE LA IMAGEN SUSTITUYENDO EL CARRUSEL */}
                    <Col xs={12} md={7} lg={6} xl={6} className="text-center d-none d-md-flex flex-column align-items-center justify-content-center">
                        <img 
                            src={ImagenTransparencia} 
                            alt="Moviflex Transparencia" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '600px', 
                                height: 'auto',
                                filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' // Sombra para resaltar la transparencia
                            }} 
                        />
                        <h3 className="mt-4 fw-bold" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            Tu movilidad, nuestra prioridad
                        </h3>
                    </Col>
                </Row>
            </Container>

            {/* Modales se mantienen igual... */}
            <Modal show={showFacialModal} onHide={cerrarFacialModal} size="lg" centered>
                {/* ... Contenido del modal facial ... */}
                <Modal.Header closeButton>
                    <Modal.Title>Inicio de Sesión Facial</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <div style={{ position: 'relative', backgroundColor: '#000', minHeight: '400px', borderRadius: '10px', overflow: 'hidden' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto' }} />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>
                        {!fotoPreview && cameraActive && (
                            <Button variant="success" onClick={tomarFoto} className="mt-4 w-100 py-3">
                                <FaCamera className="me-2" /> Tomar Foto
                            </Button>
                        )}
                        {fotoPreview && (
                            <div className="text-center mt-4">
                                <img src={fotoPreview} alt="Preview" style={{ width: '250px', borderRadius: '15px', border: '4px solid #4acfbd' }} />
                                {!verificando && (
                                    <Button variant="success" onClick={enviarLoginFacial} className="mt-4 w-100 py-3">
                                        Verificar e Iniciar Sesión
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            <QRScanner
                show={showQRScanner}
                onHide={() => setShowQRScanner(false)}
                onScanSuccess={handleQRScan}
            />
        </div>
    );
}

export default Login;