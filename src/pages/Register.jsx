import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Image, Modal } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCamera, FaVideo } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import NavbarCustom from '../components/Navbar';
import QRScanner from '../components/QRScanner';
import { API_URL } from '../config';
// --- IMÁGENES ---
import LogoMoviflex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png'; // Mismo fondo del Login

function Register() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // --- ESTADOS ORIGINALES ---
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
    const [terminosAceptados, setTerminosAceptados] = useState(false);
    const [otp, setOtp] = useState("");

    const termsText = `CONTRATO MARCO DE LICENCIA DE USO DE SOFTWARE...`;

    // --- LÓGICA DE CÁMARA ---
    const iniciarCamara = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
            });
            setStream(mediaStream);
            setCameraActive(true);
            setShowCamera(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = mediaStream; }, 100);
        } catch (err) {
            toast.error('Error al acceder a la cámara.');
        }
    };

    const detenerCamara = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setCameraActive(false);
        setShowCamera(false);
    };

    const tomarFoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.9);
            setFotoBase64(base64);
            setFotoPreview(base64);
            detenerCamara();
            toast.success('¡Foto tomada!');
        }
    };

    // --- LÓGICA DE REGISTRO ---
    async function handleRequestOtp() {
        if (!email) return toast.error("Ingresa un correo");
        setLoading(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/request-pre-otp`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                toast.success(data.mensaje);
                setStep(2);
            } else {
                toast.error(data.error || "Error al enviar el código.");
            }
        } catch (err) {
            toast.error('Error de conexión.');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp() {
        if (otp.length !== 6) return toast.error("Ingresa el código de 6 dígitos");
        setLoading(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/verify-pre-otp`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                toast.success(data.mensaje);
                setStep(3);
            } else {
                toast.error(data.error || "Código incorrecto.");
            }
        } catch (err) {
            toast.error('Error al verificar.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResendOtp() {
        return handleRequestOtp(); // Reutilizamos para reenviar
    }

    async function guardar(e) {
        if (e) e.preventDefault();
        if (!terminosAceptados) return toast.error("Acepta los términos");
        setLoading(true);
        try {
            const datosEnviar = { nombre, email, telefono, password, rol, image: fotoBase64 };
            const respuesta = await fetch(`${API_URL}/auth/registro`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosEnviar)
            });
            if (respuesta.ok) {
                toast.success('¡Registro exitoso!');
                setTimeout(() => navigate("/login"), 2000);
            } else {
                const data = await respuesta.json();
                setError(data.error || "Error en el registro.");
            }
        } catch (err) {
            toast.error('Error de conexión.');
        } finally {
            setLoading(false);
        }
    }

    const handleNextStep = () => {
        if (step === 1) return handleRequestOtp();
        if (step === 2) return handleVerifyOtp();
        if (step === 3 && (!nombre || !telefono)) return toast.error("Completa los campos");
        if (step === 4 && !fotoBase64) return toast.error("Toma una foto");
        if (step === 5 && (passwordError || !password)) return toast.error("Revisa la contraseña");
        setStep(step + 1);
    };

    const handlePrevStep = () => setStep(step - 1);

    const validarPassword = (pwd) => {
        if (pwd.length < 8) return "Mínimo 8 caracteres.";
        if (!/[A-Z]/.test(pwd)) return "Debe incluir una mayúscula.";
        return "";
    };

    const inputStyle = {
        borderRadius: '12px',
        backgroundColor: '#f8fafb',
        border: '1px solid #e1e8ed',
        padding: '10px 15px',
        fontSize: '0.95rem'
    };

    return (
        <div style={{
            backgroundImage: `url(${FondoPantalla})`, // Fondo integrado
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Toaster position="top-right" />
            <NavbarCustom />

            <Container className="d-flex flex-column justify-content-center flex-grow-1 py-4">
                <Row className="justify-content-center align-items-center g-0">

                    {/* COLUMNA FORMULARIO (IZQUIERDA) */}
                    <Col xs={12} md={10} lg={5} xl={4} className="p-3">
                        <Card className="shadow-lg border-0" style={{ borderRadius: '25px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <img src={LogoMoviflex} alt="Logo" style={{ width: '150px' }} />
                                    <h5 className="fw-bold mt-3 mb-1">Crea tu cuenta</h5>
                                    <ProgressBar now={(step / 6) * 100} variant="info" className="mt-3" style={{ height: '5px', borderRadius: '10px' }} />
                                    <small className="text-muted d-block mt-2">Paso {step} de 6</small>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                                <Form onSubmit={guardar}>
                                    {step === 1 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <p className="small mb-3 text-center">Ingresa tu correo para recibir un código de verificación.</p>
                                            <Form.Group className="mb-4">
                                                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo Electrónico" required style={inputStyle} />
                                            </Form.Group>
                                            <Button type="button" onClick={handleNextStep} disabled={loading} className="w-100 py-2 border-0" style={{ background: '#4acfbd', borderRadius: '12px', fontWeight: 'bold' }}>
                                                {loading ? "Enviando..." : "Enviar Código"} <FaArrowRight className="ms-2" size={14} />
                                            </Button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="animate__animated animate__fadeIn text-center">
                                            <p className="small mb-4">Ingresa el código enviado a <strong>{email}</strong></p>
                                            <Form.Group className="mb-4">
                                                <Form.Control
                                                    type="text"
                                                    maxLength="6"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                    placeholder="000000"
                                                    style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                                                />
                                            </Form.Group>
                                            <Button type="button" onClick={handleNextStep} disabled={loading || otp.length !== 6} className="w-100 py-2 border-0 mb-3" style={{ background: '#4acfbd', borderRadius: '12px', fontWeight: 'bold' }}>
                                                {loading ? "Verificando..." : "Verificar Email"}
                                            </Button>
                                            <div className="d-flex justify-content-between px-2">
                                                <span onClick={handlePrevStep} style={{ cursor: 'pointer', fontSize: '0.85rem' }} className="text-muted">Cambiar Correo</span>
                                                <span onClick={handleResendOtp} style={{ color: '#4acfbd', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Reenviar Código</span>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Form.Group className="mb-3">
                                                <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre Completo" required style={inputStyle} />
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Control type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" required style={inputStyle} />
                                            </Form.Group>
                                            <Button type="button" onClick={handleNextStep} className="w-100 py-2 border-0" style={{ background: '#4acfbd', borderRadius: '12px', fontWeight: 'bold' }}>
                                                Siguiente <FaArrowRight className="ms-2" size={14} />
                                            </Button>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="text-center animate__animated animate__fadeIn">
                                            <div className="d-flex justify-content-center mb-4">
                                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #4acfbd', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {fotoPreview ? <Image src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaCamera size={30} color="#ccc" />}
                                                </div>
                                            </div>
                                            <Button variant="outline-success" onClick={iniciarCamara} className="w-100 py-2 mb-3" style={{ borderRadius: '12px' }}>
                                                <FaVideo className="me-2" /> Tomar Foto
                                            </Button>
                                            <div className="d-flex gap-2">
                                                <Button type="button" variant="light" onClick={handlePrevStep} className="w-50 py-2" style={{ borderRadius: '12px' }}>Atrás</Button>
                                                <Button type="button" onClick={handleNextStep} disabled={!fotoBase64} className="w-50 py-2 border-0" style={{ background: '#4acfbd', borderRadius: '12px', fontWeight: 'bold' }}>Siguiente</Button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Form.Group className="mb-4">
                                                <div className="position-relative">
                                                    <Form.Control type={showPassword ? "text" : "password"} value={password}
                                                        onChange={(e) => { setPassword(e.target.value); setPasswordError(validarPassword(e.target.value)); }}
                                                        placeholder="Contraseña" required style={inputStyle} />
                                                    <span className="position-absolute end-0 top-50 translate-middle-y me-3" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <FaEyeSlash color="#8899a6" /> : <FaEye color="#8899a6" />}
                                                    </span>
                                                </div>
                                                {passwordError && <small className="text-danger mt-1 d-block" style={{ fontSize: '0.8rem' }}>{passwordError}</small>}
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button type="button" variant="light" onClick={handlePrevStep} className="w-50 py-2" style={{ borderRadius: '12px' }}>Atrás</Button>
                                                <Button type="button" onClick={handleNextStep} disabled={!!passwordError || !password} className="w-50 py-2 border-0" style={{ background: '#4acfbd', borderRadius: '12px', fontWeight: 'bold' }}>Siguiente</Button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <div className="bg-light p-3 rounded-4 mb-3" style={{ fontSize: '0.85rem' }}>
                                                <strong>{nombre}</strong><br />{email}
                                            </div>
                                            <Form.Check type="checkbox" label={<span style={{ fontSize: '0.8rem' }}>Acepto términos y condiciones</span>} checked={terminosAceptados} onChange={(e) => setTerminosAceptados(e.target.checked)} className="mb-4" />
                                            <div className="d-flex gap-2">
                                                <Button type="button" variant="light" onClick={handlePrevStep} className="w-50 py-2" style={{ borderRadius: '12px' }}>Atrás</Button>
                                                <Button type="submit" disabled={!terminosAceptados || loading} className="w-50 py-2 border-0" style={{ background: '#124c83', borderRadius: '12px', fontWeight: 'bold' }}>
                                                    {loading ? "..." : "Finalizar"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                                <p className="text-center mt-4 mb-0 small text-muted">¿Ya tienes cuenta? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#4acfbd' }}>Inicia Sesión</Link></p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* COLUMNA ILUSTRACIÓN (DERECHA) */}
                    <Col md={6} lg={6} className="d-none d-md-flex justify-content-center p-5">
                        <img src={EscenaHomeBase} alt="Ilustración" style={{ width: '100%', maxWidth: '500px', height: 'auto', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))' }} />
                    </Col>
                </Row>
            </Container>

            <Modal show={showCamera} onHide={detenerCamara} centered size="md">
                <Modal.Body className="p-0 text-center bg-black">
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="p-3 bg-white d-flex justify-content-center gap-3">
                        <Button variant="secondary" size="sm" onClick={detenerCamara}>Cancelar</Button>
                        <Button variant="success" size="sm" onClick={tomarFoto} disabled={!cameraActive}>Capturar</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Register;