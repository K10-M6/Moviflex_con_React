import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Carousel, ProgressBar } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';

function Register() {
    const navigate = useNavigate();
    
    // --- ESTADOS DE DATOS ---
    const [step, setStep] = useState(1);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const rol = "CONDUCTOR"; // Rol fijo según lo solicitado

    // --- ESTADOS de UX ---
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const imagenes = [
        "https://resizer.glanacion.com/resizer/v2/los-autos-mas-caros-que-se-vendieron-este-2023-no-FQFIMWVMVZGXHIS7BH2SIXGGZQ.jpg?auth=f76b37a176625c85e2fb9ae828be3d4c686100df1081520c6661f90841a3d52b&width=1200&quality=70&smart=false&height=800",
        "https://www.elcarrocolombiano.com/wp-content/uploads/2021/11/Los-10-carros-mas-rapidos-del-mundo-2021.jpg",
        "https://cdn.motor1.com/images/mgl/0x0/0qzJjA/superdeportivos-mas-rapidos-del-mundo.jpg"
    ];

    // --- LOGICA DE VALIDACIÓN ---
    const validarPassword = (pwd) => {
        if (pwd.length < 8) return "Mínimo 8 caracteres.";
        if (!/[A-Z]/.test(pwd)) return "Debe incluir una mayúscula.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Debe incluir un carácter especial.";
        return "";
    };

    const handleNextStep = () => {
        setError("");
        if (step === 1) {
            if (!nombre || !email || !telefono) {
                setError("Por favor, completa todos los campos para continuar.");
                return;
            }
        }
        if (step === 2) {
            const pError = validarPassword(password);
            if (pError) {
                setPasswordError(pError);
                return;
            }
        }
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setError("");
        setStep(step - 1);
    };

    // --- ENVÍO A LA API ---
    async function guardar(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const datosEnviar = {
                nombre: nombre.trim(),
                email: email.trim(),
                telefono: telefono.trim(),
                password: password,
                rol: rol
            };

            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosEnviar)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                // ÉXITO: Redirección al componente de Documentos
                navigate("/driver-profile"); 
            } else {
                setError(data.message || "Error en el registro. Intenta con otro correo.");
                setStep(1); // Regresar al inicio para corregir
            }
        } catch (err) {
            setError("No se pudo conectar con el servidor. Revisa tu internet.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ backgroundColor: '#124c83', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            <Container className="d-flex flex-column justify-content-center py-5" style={{ flexGrow: 1 }}>
                <Row className="justify-content-center align-items-center">
                    
                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <Col xs={12} md={6} lg={5}>
                        <Card className="shadow-lg border-0" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Movi Logo" style={{ width: '140px' }} />
                                    <h4 className="fw-bold text-dark mt-3">Registro de Conductor</h4>
                                    <p className="text-muted small">Completa los 3 pasos para empezar a ganar.</p>
                                </div>

                                {/* Barra de Progreso */}
                                <div className="mb-4">
                                    <ProgressBar now={(step / 3) * 100} variant="info" style={{ height: '7px' }} />
                                    <div className="d-flex justify-content-between mt-2">
                                        <span className="small fw-bold text-primary">Paso {step} de 3</span>
                                        <span className="small text-muted">{step === 1 ? "Contacto" : step === 2 ? "Seguridad" : "Finalizar"}</span>
                                    </div>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                                <Form onSubmit={guardar}>
                                    
                                    {/* PASO 1: DATOS PERSONALES */}
                                    {step === 1 && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold"><FaUser className="me-2"/>Nombre Completo</Form.Label>
                                                <Form.Control size="lg" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu Nombre" required />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold"><FaEnvelope className="me-2"/>Correo Electrónico</Form.Label>
                                                <Form.Control size="lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electronico" required />
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold"><FaPhone className="me-2"/>Teléfono de Contacto</Form.Label>
                                                <Form.Control size="lg" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Celular" required />
                                            </Form.Group>
                                            <Button onClick={handleNextStep} className="w-100 py-3 d-flex justify-content-center align-items-center gap-2" style={{ background: '#4acfbd', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>
                                                Siguiente Paso <FaArrowRight />
                                            </Button>
                                        </div>
                                    )}

                                    {/* PASO 2: CONTRASEÑA */}
                                    {step === 2 && (
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
                                                    <span className="position-absolute end-0 top-50 translate-middle-y me-3" style={{ cursor: 'pointer', zIndex: 10 }} onClick={() => setShowPassword(!showPassword)}>
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
                                                <Button variant="light" onClick={handlePrevStep} className="w-50 py-3" style={{ borderRadius: '12px' }}><FaArrowLeft /> Atrás</Button>
                                                <Button onClick={handleNextStep} className="w-50 py-3" style={{ background: '#4acfbd', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Revisar</Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* PASO 3: CONFIRMACIÓN */}
                                    {step === 3 && (
                                        <div className="text-center animate__animated animate__fadeIn">
                                            <FaCheckCircle size={50} color="#4acfbd" className="mb-3" />
                                            <h5 className="fw-bold">Verifica tu información</h5>
                                            <p className="small text-muted mb-4">Al hacer clic en finalizar, crearás tu cuenta de conductor y pasarás a cargar tus documentos.</p>
                                            
                                            <div className="text-start bg-light p-3 rounded-4 mb-4" style={{ fontSize: '0.9rem', border: '1px solid #eee' }}>
                                                <div className="mb-2"><strong>Nombre:</strong> {nombre}</div>
                                                <div className="mb-2"><strong>Email:</strong> {email}</div>
                                                <div><strong>Perfil:</strong> Conductor Movi</div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button variant="light" onClick={handlePrevStep} className="w-50 py-3" disabled={loading} style={{ borderRadius: '12px' }}>Editar</Button>
                                                <Button type="submit" className="w-50 py-3" style={{ background: '#124c83', border: 'none', borderRadius: '12px', fontWeight: 'bold' }} disabled={loading}>
                                                    {loading ? "Registrando..." : "Finalizar"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* COLUMNA DERECHA: DISEÑO VISUAL (Solo visible en tablets/PC) */}
                    <Col md={6} lg={6} className="d-none d-md-block ps-lg-5">
                        <div style={{ borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '6px solid rgba(255,255,255,0.1)' }}>
                            <Carousel fade indicators={false} controls={false} interval={3500}>
                                {imagenes.map((img, idx) => (
                                    <Carousel.Item key={idx}>
                                        <img src={img} alt="Drive" className="d-block w-100" style={{ height: '500px', objectFit: 'cover' }} />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </div>
                        <div className="text-white mt-4 text-center text-md-start">
                            <h2 className="fw-bold display-6">Conduce con Movi</h2>
                            <p className="lead opacity-75">Tu camino, tus reglas. Regístrate ahora y sube tu documentación en el siguiente paso.</p>
                        </div>
                    </Col>

                </Row>
            </Container>
        </div>
    );
}

export default Register;