import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Image, Modal, Badge } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCheckCircle, FaCamera, FaVideo, FaExclamationTriangle, FaSmile, FaFrown } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';
// Importar las mismas imágenes que usa Login
import FondoPantalla from './Imagenes/AutoresContacto.png';
import ImagenTransparencia from './Imagenes/TRANSPARENCIA MOVIFLEX.png';

function Register() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
    const [step, setStep] = useState(1);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [fotoBase64, setFotoBase64] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const rol = "CONDUCTOR";

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [showCamera, setShowCamera] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [rostroValido, setRostroValido] = useState(null); 
    const [mensajeRostro, setMensajeRostro] = useState("");
    const [verificandoRostro, setVerificandoRostro] = useState(false);
    const [errorRostroBackend, setErrorRostroBackend] = useState("");

    const verificarRostroAntesDeEnviar = async (base64Image) => {
        setVerificandoRostro(true);
        setRostroValido(null);
        setErrorRostroBackend("");
        
        try {
            const img = document.createElement('img');
            img.src = base64Image;
            
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            
            if (img.width < 200 || img.height < 200) {
                setRostroValido(false);
                setMensajeRostro("La imagen es muy pequeña. Usa una foto más grande para mejor reconocimiento.");
                toast.error('Imagen demasiado pequeña para análisis facial', { icon: '📸' });
                return false;
            }
            
            const calidadAparente = base64Image.length > 50000; 
            if (!calidadAparente) {
                setRostroValido(false);
                setMensajeRostro("La imagen parece tener baja calidad. Usa una foto más nítida.");
                toast.error('Baja calidad de imagen', { icon: '🔍' });
                return false;
            }
            
            setRostroValido(true);
            setMensajeRostro("La imagen tiene buena calidad para análisis facial");
            toast.success('Imagen apta para reconocimiento facial', { icon: '🤖' });
            return true;
            
        } catch (error) {
            console.error("Error al verificar imagen:", error);
            setRostroValido(false);
            setMensajeRostro("No se pudo verificar la imagen. Intenta de nuevo.");
            return false;
        } finally {
            setVerificandoRostro(false);
        }
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
            setErrorRostroBackend("");
            
            detenerCamara();
            
            toast.success('¡Foto tomada correctamente!');
            
            verificarRostroAntesDeEnviar(fotoBase64);
        }
    };

    async function guardar(e) {
        e.preventDefault();
        setError("");
        setErrorRostroBackend("");
        setLoading(true);

        const loadingToast = toast.loading('Registrando usuario...');

        try {
            const datosEnviar = {
                nombre: nombre.trim(),
                email: email.trim(),
                telefono: telefono.trim(),
                password: password,
                rol: rol,
                image: fotoBase64
            };

            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/registro", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosEnviar)
            });

            const data = await respuesta.json();

            toast.dismiss(loadingToast);

            if (respuesta.ok) {
                toast.success('¡Registro exitoso! Serás redirigido al inicio de sesión.', {
                    duration: 3000,
                    icon: '🎉'
                });
                
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                let mensajeError = data.error || data.message || "Error en el registro.";
                
                if (mensajeError.toLowerCase().includes("rostro") || 
                    mensajeError.toLowerCase().includes("facial") ||
                    mensajeError.toLowerCase().includes("duplicado")) {
                    
                    setRostroValido(false);
                    setErrorRostroBackend(mensajeError);
                    
                    toast.error('❌ ' + mensajeError, {
                        duration: 6000,
                        icon: '👤'
                    });
                    
                    setStep(2);
                    
                } else if (mensajeError.toLowerCase().includes("foto") || 
                         mensajeError.toLowerCase().includes("imagen") ||
                         mensajeError.toLowerCase().includes("cloudinary")) {

                    setErrorRostroBackend("📸 Problema con la imagen: " + mensajeError);
                    toast.error('Error en la imagen: ' + mensajeError, {
                        icon: '🖼️'
                    });
                    setStep(2);
                    
                } else if (mensajeError.toLowerCase().includes("email") || 
                         mensajeError.toLowerCase().includes("correo")) {
                    
                    setStep(1);
                    setEmail("");
                    toast.error('📧 ' + mensajeError);
                    
                } else {
                    setStep(1);
                    toast.error(mensajeError, { icon: '❌' });
                }
                
                setError(mensajeError);
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            toast.dismiss(loadingToast);
            toast.error('Error de conexión. Verifica tu internet e intenta de nuevo.', {
                duration: 5000,
                icon: '🌐'
            });
            setError("No se pudo conectar con el servidor. Revisa tu internet.");
        } finally {
            setLoading(false);
        }
    }

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
            setShowCamera(true);
            
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
        setShowCamera(false);
    };

    const validarPassword = (pwd) => {
        if (pwd.length < 8) return "Mínimo 8 caracteres.";
        if (!/[A-Z]/.test(pwd)) return "Debe incluir una mayúscula.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Debe incluir un carácter especial.";
        return "";
    };

    const handleNextStep = () => {
        setError("");
        setErrorRostroBackend("");
        
        if (step === 1) {
            if (!nombre || !email || !telefono) {
                const errorMsg = "Por favor, completa todos los campos para continuar.";
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                const errorMsg = "Por favor, ingresa un email válido.";
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }
            toast.success('Datos personales válidos');
        }
        
        if (step === 2) {
            if (!fotoBase64) {
                const errorMsg = "Por favor, toma una foto con la cámara.";
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }
            toast.success('Foto de perfil tomada correctamente');
        }
        
        if (step === 3) {
            const pError = validarPassword(password);
            if (pError) {
                setPasswordError(pError);
                toast.error(pError);
                return;
            }
            toast.success('Contraseña válida');
        }
        
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setError("");
        setErrorRostroBackend("");
        setStep(step - 1);
        
        if (step === 3 && cameraActive) {
            detenerCamara();
        }
    };

    return (
        <div style={{
            backgroundImage: `url(${FondoPantalla})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
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
            
            <Container className="d-flex flex-column justify-content-center py-5" style={{ flexGrow: 1 }}>
                <Row className="justify-content-center align-items-center">
                    
                    <Col xs={12} md={6} lg={5}>
                        <Card className="shadow-lg border-0" style={{ 
                            borderRadius: '25px', 
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Movi Logo" style={{ width: '140px' }} />
                                    <h4 className="fw-bold text-dark mt-3">Registro de Conductor</h4>
                                    <p className="text-muted small">Completa los 3 pasos para empezar a ganar.</p>
                                </div>

                                <div className="mb-4">
                                    <ProgressBar now={(step / 3) * 100} variant="info" style={{ height: '7px' }} />
                                    <div className="d-flex justify-content-between mt-2">
                                        <span className="small fw-bold text-primary">Paso {step} de 3</span>
                                        <span className="small text-muted">
                                            {step === 1 ? "Contacto" : step === 2 ? "Foto de Perfil" : step === 3 ? "Seguridad" : "Finalizar"}
                                        </span>
                                    </div>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                                
                                {errorRostroBackend && (
                                    <Alert variant="danger" className="py-2 small">
                                        <FaExclamationTriangle className="me-2" />
                                        {errorRostroBackend}
                                    </Alert>
                                )}
                                
                                {step === 2 && fotoBase64 && !errorRostroBackend && (
                                    <>
                                        {verificandoRostro ? (
                                            <Alert variant="info" className="py-2 small d-flex align-items-center">
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Verificando...</span>
                                                </div>
                                                Verificando calidad de imagen para análisis facial...
                                            </Alert>
                                        ) : rostroValido === true ? (
                                            <Alert variant="success" className="py-2 small d-flex align-items-center">
                                                <FaSmile className="me-2" size={18} />
                                                {mensajeRostro}
                                            </Alert>
                                        ) : rostroValido === false ? (
                                            <Alert variant="warning" className="py-2 small d-flex align-items-center">
                                                <FaFrown className="me-2" size={18} />
                                                {mensajeRostro}
                                            </Alert>
                                        ) : null}
                                    </>
                                )}

                                <Form onSubmit={guardar}>
                                    
                                    {step === 1 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold"><FaUser className="me-2"/>Nombre Completo</Form.Label>
                                                <Form.Control 
                                                    size="lg" 
                                                    type="text" 
                                                    value={nombre} 
                                                    onChange={(e) => setNombre(e.target.value)} 
                                                    placeholder="Tu Nombre" 
                                                    required 
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold"><FaEnvelope className="me-2"/>Correo Electrónico</Form.Label>
                                                <Form.Control 
                                                    size="lg" 
                                                    type="email" 
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="Correo electronico" 
                                                    required 
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold"><FaPhone className="me-2"/>Teléfono de Contacto</Form.Label>
                                                <Form.Control 
                                                    size="lg" 
                                                    type="tel" 
                                                    value={telefono} 
                                                    onChange={(e) => setTelefono(e.target.value)} 
                                                    placeholder="Celular" 
                                                    required 
                                                />
                                            </Form.Group>
                                            <Button 
                                                onClick={handleNextStep} 
                                                className="w-100 py-3 d-flex justify-content-center align-items-center gap-2" 
                                                style={{ background: '#4acfbd', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
                                            >
                                                Siguiente Paso <FaArrowRight />
                                            </Button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Form.Group className="mb-4 text-center">
                                                <Form.Label className="small fw-bold d-block">
                                                    <FaCamera className="me-2"/>
                                                    Foto de Perfil
                                                    {fotoBase64 && !errorRostroBackend && (
                                                        <Badge bg={rostroValido ? "success" : "secondary"} className="ms-2">
                                                            {rostroValido ? "Verificada" : "Pendiente"}
                                                        </Badge>
                                                    )}
                                                    {errorRostroBackend && (
                                                        <Badge bg="danger" className="ms-2">
                                                            Error
                                                        </Badge>
                                                    )}
                                                </Form.Label>
                                                
                                                <div className="d-flex justify-content-center mb-3">
                                                    <div style={{ 
                                                        width: '150px', 
                                                        height: '150px', 
                                                        borderRadius: '50%', 
                                                        overflow: 'hidden',
                                                        border: `3px solid ${
                                                            errorRostroBackend ? '#dc3545' : 
                                                            rostroValido === true ? '#4acfbd' : 
                                                            rostroValido === false ? '#ffc107' : '#4acfbd'
                                                        }`,
                                                        backgroundColor: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {fotoPreview ? (
                                                            <Image 
                                                                src={fotoPreview} 
                                                                alt="Preview" 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                            />
                                                        ) : (
                                                            <FaCamera size={40} color="#ccc" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-grid gap-2 mb-3">
                                                    <Button 
                                                        variant="outline-success" 
                                                        onClick={iniciarCamara}
                                                        className="d-flex align-items-center justify-content-center gap-2 py-3"
                                                        disabled={cameraActive || verificandoRostro}
                                                        size="lg"
                                                    >
                                                        <FaVideo size={20} /> {cameraActive ? 'Cámara activa' : 'Tomar foto con cámara'}
                                                    </Button>
                                                </div>
                                                
                                                <Form.Text className="text-muted">
                                                    Toma una foto clara de tu rostro con buena iluminación
                                                </Form.Text>
                                                
                                                <div className="mt-3 p-2 bg-light rounded-3 small text-start">
                                                    <div className="fw-bold mb-1">
                                                        <FaExclamationTriangle className="me-1 text-warning" />
                                                        Recomendaciones para la foto
                                                    </div>
                                                    <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                                                        <li>Usa buena iluminación</li>
                                                        <li>Muestra tu rostro claramente</li>
                                                        <li>Evita sombras o lentes oscuros</li>
                                                        <li>La IA verificará que no haya duplicados</li>
                                                    </ul>
                                                </div>
                                            </Form.Group>

                                            <div className="d-flex gap-2">
                                                <Button variant="light" onClick={handlePrevStep} className="w-50 py-3" style={{ borderRadius: '12px' }} disabled={verificandoRostro}>
                                                    <FaArrowLeft /> Atrás
                                                </Button>
                                                <Button 
                                                    onClick={handleNextStep} 
                                                    className="w-50 py-3" 
                                                    style={{ background: '#4acfbd', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
                                                    disabled={!fotoBase64 || verificandoRostro || !!errorRostroBackend}
                                                >
                                                    {verificandoRostro ? 'Verificando...' : 'Siguiente'} 
                                                    {!verificandoRostro && <FaArrowRight className="ms-2" />}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold"><FaLock className="me-2"/>Crea una Contraseña Segura</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control 
                                                        size="lg"
                                                        type={showPassword ? "text" : "password"} 
                                                        value={password} 
                                                        onChange={(e) => {
                                                            setPassword(e.target.value);
                                                            setPasswordError(validarPassword(e.target.value));
                                                        }}
                                                        placeholder="Mínimo 8 caracteres"
                                                        required 
                                                    />
                                                    <span 
                                                        className="position-absolute end-0 top-50 translate-middle-y me-3" 
                                                        style={{ cursor: 'pointer', zIndex: 10 }} 
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <FaEyeSlash color="#666"/> : <FaEye color="#666"/>}
                                                    </span>
                                                </div>
                                                {passwordError && <small className="text-danger d-block mt-2">{passwordError}</small>}
                                                <ul className="text-muted mt-3 small">
                                                    <li>Al menos 1 Mayúscula</li>
                                                    <li>Al menos 1 Carácter especial (!@#$)</li>
                                                </ul>
                                            </Form.Group>

                                            <div className="d-flex gap-2">
                                                <Button variant="light" onClick={handlePrevStep} className="w-50 py-3" style={{ borderRadius: '12px' }}>
                                                    <FaArrowLeft /> Atrás
                                                </Button>
                                                <Button 
                                                    onClick={handleNextStep} 
                                                    className="w-50 py-3" 
                                                    style={{ background: '#4acfbd', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
                                                    disabled={!!passwordError || !password}
                                                >
                                                    Revisar
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="text-center animate__animated animate__fadeIn">
                                            <FaCheckCircle size={50} color="#4acfbd" className="mb-3" />
                                            <h5 className="fw-bold">Verifica tu información</h5>
                                            <p className="small text-muted mb-4">Al hacer clic en finalizar, crearás tu cuenta de conductor.</p>
                                            
                                            <div className="text-start bg-light p-3 rounded-4 mb-4" style={{ fontSize: '0.9rem', border: '1px solid #eee' }}>
                                                <div className="d-flex align-items-center mb-3">
                                                    {fotoPreview && (
                                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', marginRight: '10px', border: '2px solid #4acfbd' }}>
                                                            <Image src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong>Nombre:</strong> {nombre}
                                                        <div className="small">
                                                            {errorRostroBackend ? (
                                                                <span className="text-danger">❌ Error: {errorRostroBackend}</span>
                                                            ) : rostroValido === true ? (
                                                                <span className="text-success">✓ Rostro verificado</span>
                                                            ) : rostroValido === false ? (
                                                                <span className="text-warning">⚠️ Posible problema con el rostro</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-2"><strong>Email:</strong> {email}</div>
                                                <div className="mb-2"><strong>Teléfono:</strong> {telefono}</div>
                                                <div><strong>Perfil:</strong> Conductor Movi</div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="light" 
                                                    onClick={handlePrevStep} 
                                                    className="w-50 py-3" 
                                                    disabled={loading} 
                                                    style={{ borderRadius: '12px' }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button 
                                                    type="submit" 
                                                    className="w-50 py-3" 
                                                    style={{ background: '#124c83', border: 'none', borderRadius: '12px', fontWeight: 'bold' }} 
                                                    disabled={loading || !!errorRostroBackend}
                                                >
                                                    {loading ? "Registrando..." : "Finalizar"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* SECCIÓN DE LA IMAGEN DE TRANSPARENCIA (REEMPLAZA EL CARRUSEL) */}
                    <Col xs={12} md={6} lg={6} className="text-center d-none d-md-flex flex-column align-items-center justify-content-center">
                        <img 
                            src={ImagenTransparencia} 
                            alt="Moviflex Transparencia" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '600px', 
                                height: 'auto',
                                filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))'
                            }} 
                        />
                        <h3 className="mt-4 fw-bold" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            Conduce con Movi, tu camino, tus reglas
                        </h3>
                        <p className="text-white mt-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                            Regístrate ahora y únete a nuestra familia de conductores
                        </p>
                    </Col>

                </Row>
            </Container>

            <Modal show={showCamera} onHide={detenerCamara} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tomar Foto con Cámara</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-0">
                    <div style={{ position: 'relative', backgroundColor: '#000', minHeight: '400px' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'cover' }}
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
                    <Button variant="secondary" onClick={detenerCamara}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={tomarFoto}
                        disabled={!cameraActive}
                    >
                        <FaCamera /> Tomar Foto
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Register;