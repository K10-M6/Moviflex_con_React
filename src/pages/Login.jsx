import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Carousel, Modal, ProgressBar } from "react-bootstrap";
import Logo from './Imagenes/TODO_MOVI.png';
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
    const [facialMode, setFacialMode] = useState(null);
    const [fotoBase64, setFotoBase64] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const [verificando, setVerificando] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    
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

    const convertirABase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Por favor, selecciona un archivo de imagen válido.");
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                setError("La imagen no debe superar los 5MB.");
                return;
            }

            try {
                const base64 = await convertirABase64(file);
                setFotoBase64(base64);
                setFotoPreview(URL.createObjectURL(file));
            } catch (error) {
                setError("Error al procesar la imagen. Intenta de nuevo.");
            }
        }
    };

    const abrirFacialModal = (mode) => {
        setFacialMode(mode);
        setFotoBase64("");
        setFotoPreview("");
        setError("");
        setShowFacialModal(true);
        
        if (mode === 'camera') {
            setTimeout(() => iniciarCamara(), 500);
        }
    };

    const cerrarFacialModal = () => {
        detenerCamara();
        setShowFacialModal(false);
        setFacialMode(null);
        setFotoBase64("");
        setFotoPreview("");
    };

    const enviarLoginFacial = async () => {
        if (!fotoBase64) {
            setError("Debes tomar una foto o subir una imagen");
            return;
        }

        setVerificando(true);
        setError("");

        try {
            const datosEnviar = {
                image: fotoBase64
            };

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
            console.log("📱 Datos del QR:", qrData);
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
            console.error("Error parseando QR:", error);
            setError("El código QR no tiene el formato correcto");
        } finally {
            setLoading(false);
        }
    };

    const imagenes = [
        "https://periodicolafuente.com/wp-content/uploads/2018/09/%C2%BFPor-qu%C3%A9-viajar-en-carro-por-M%C3%A9xico-es-algo-que-debes-vivir_LA-FUENTE-QUERETARO-.jpg",
        "https://st2.depositphotos.com/1757635/7119/i/950/depositphotos_71197259-stock-photo-man-driving-a-car.jpg",
        "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_790,h_395/https://alkilautos.com/blog/wp-content/uploads/2020/01/VIAJAR-TRIP-PERUCOM.jpg",
    ];

    return (
        <div style={{
            backgroundColor: '#124c83',
            minHeight: '100vh',
            minWidth: '100vw',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />
            <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1 }}>
                <Row className="justify-content-center">
                    
                    <Col xs={12} md={4} lg={4} xl={5}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        <Card className="shadow-lg border-0" style={{ 
                            borderRadius: '25px', 
                            overflow: 'hidden',
                            width: '100%'
                        }}>
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Logo Moviflexx"
                                        style={{
                                            width: '140px',
                                            height: 'auto',
                                        }}
                                    />
                                    <h5 className="fw-bold text-dark mt-3">¡Bienvenido de nuevo!</h5>
                                </div>

                                <Button
                                    onClick={() => setShowQRScanner(true)}
                                    variant="outline-primary"
                                    className="w-100 py-2 mb-2 d-flex justify-content-center align-items-center gap-2"
                                    style={{ 
                                        borderRadius: '12px', 
                                        borderColor: '#4acfbd',
                                        color: '#4acfbd',
                                        fontWeight: 'bold'
                                    }}
                                    disabled={loading}
                                >
                                    <FaQrcode />
                                    {loading ? 'Procesando...' : 'Iniciar sesión con QR'}
                                </Button>

                                <Button
                                    onClick={() => abrirFacialModal('camera')}
                                    variant="outline-success"
                                    className="w-100 py-2 mb-3 d-flex justify-content-center align-items-center gap-2"
                                    style={{ 
                                        borderRadius: '12px', 
                                        borderColor: '#28a745',
                                        color: '#28a745',
                                        fontWeight: 'bold'
                                    }}
                                    disabled={loading}
                                >
                                    <FaCamera />
                                    {loading ? 'Procesando...' : 'Iniciar sesión con reconocimiento facial'}
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
                                            placeholder="Ingrese su correo electrónico"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                            style={{ 
                                                borderRadius: '12px',
                                                padding: '10px 15px'
                                            }}
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
                                                style={{ 
                                                    borderRadius: '12px',
                                                    padding: '10px 40px 10px 15px'
                                                }}
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
                                        style={{ 
                                            background: '#4acfbd', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontWeight: 'bold' 
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Iniciando sesión...
                                            </>
                                        ) : 'Iniciar Sesión'}
                                    </Button>
                                </Form>

                                <p className="text-center text-muted mt-3">
                                    ¿No tienes cuenta?{" "}
                                    <a href="/register" className="text-decoration-none fw-bold" style={{ color: '#124c83' }}>
                                        Regístrate aquí
                                    </a>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={13} md={8} lg={4} xl={6} className="mt-4"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        <div className="text-center w-100">
                            <div style={{
                                width: '100%',
                                maxWidth: '900px',
                                margin: '50px auto',
                                borderRadius: '200px',
                                overflow: 'hidden',
                                border: '2px solid white',
                            }}>
                                <Carousel fade indicators controls={false} interval={2500}>
                                    {imagenes.map((img, index) => (
                                        <Carousel.Item key={index}>
                                            <img
                                                src={img}
                                                alt={`slide-${index}`}
                                                className="d-block w-100"
                                                style={{
                                                    height: '400px',
                                                    width: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </div>

                            <h3 className="mt-3" style={{ color: '#fdfdfd' }}>
                                Bienvenido de Nuevo
                            </h3>
                            <p className="text-white mt-2" style={{ fontSize: '1.1rem' }}>
                                Accede a tu cuenta para gestionar tus viajes
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Modal show={showFacialModal} onHide={cerrarFacialModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Inicio de Sesión Facial</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex gap-2 mb-4">
                        <Button
                            variant={facialMode === 'camera' ? 'success' : 'outline-success'}
                            onClick={() => {
                                setFacialMode('camera');
                                setFotoBase64("");
                                setFotoPreview("");
                                setTimeout(() => iniciarCamara(), 500);
                            }}
                            className="flex-fill"
                        >
                            <FaVideo className="me-2" />
                            Usar Cámara
                        </Button>
                        <Button
                            variant={facialMode === 'upload' ? 'primary' : 'outline-primary'}
                            onClick={() => {
                                setFacialMode('upload');
                                detenerCamara();
                                setFotoBase64("");
                                setFotoPreview("");
                            }}
                            className="flex-fill"
                        >
                            <FaCamera className="me-2" />
                            Subir Foto
                        </Button>
                    </div>

                    {facialMode === 'camera' && (
                        <div className="text-center">
                            <div style={{ 
                                position: 'relative', 
                                backgroundColor: '#000', 
                                minHeight: '300px',
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    style={{ width: '100%', height: 'auto', maxHeight: '400px' }}
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
                            
                            {cameraActive && (
                                <Button 
                                    variant="success" 
                                    onClick={tomarFoto}
                                    className="mt-3 w-100"
                                    disabled={verificando}
                                >
                                    Tomar Foto
                                </Button>
                            )}
                        </div>
                    )}

                    {facialMode === 'upload' && (
                        <div className="text-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            
                            <Button
                                variant="primary"
                                onClick={() => fileInputRef.current.click()}
                                className="mb-3 w-100"
                                disabled={verificando}
                            >
                                <FaCamera className="me-2" />
                                Seleccionar Foto
                            </Button>
                        </div>
                    )}

                    {fotoPreview && (
                        <div className="text-center mt-3">
                            <div style={{ 
                                width: '200px', 
                                height: '200px', 
                                margin: '0 auto',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '3px solid #4acfbd'
                            }}>
                                <img 
                                    src={fotoPreview} 
                                    alt="Preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            </div>
                            
                            {verificando && (
                                <div className="mt-3">
                                    <ProgressBar animated now={100} label="Verificando rostro..." />
                                </div>
                            )}
                            
                            {!verificando && (
                                <Button
                                    variant="success"
                                    onClick={enviarLoginFacial}
                                    className="mt-3 w-100"
                                    disabled={!fotoBase64}
                                >
                                    Verificar Rostro e Iniciar Sesión
                                </Button>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarFacialModal} disabled={verificando}>
                        Cancelar
                    </Button>
                </Modal.Footer>
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