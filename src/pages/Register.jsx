import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTag } from "react-icons/fa";
import Navbar from '../components/Navbar';

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [rol, setRol] = useState("PASAJERO"); 
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    


    function validarPassword(pwd) {
        if (!pwd) return "La contraseña es requerida";
        
        if (pwd.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (!/[A-Z]/.test(pwd)) {
            return "Debe incluir al menos una letra mayúscula.";
        }
        if (!/[a-z]/.test(pwd)) {
            return "Debe incluir al menos una letra minúscula.";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            return "Debe incluir al menos un carácter especial (!@#$%^&* etc).";
        }
        return "";
    }

    async function guardar(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setPasswordError("");

        const pwdError = validarPassword(password);
        if (pwdError) {
            setPasswordError(pwdError);
            return;
        }

        if (!telefono || telefono.trim() === "") {
            setError("El teléfono es requerido");
            return;
        }

        if (!rol) {
            setError("Debe seleccionar un rol");
            return;
        }

        setLoading(true);

        try {

            const datosEnviar = {
                nombre: nombre.trim(),
                email: email.trim(),
                telefono: telefono.trim(),
                password: password,
                rol: rol 
            };
            
            console.log(" Enviando registro con datos (igual que app móvil):", datosEnviar);

            const respuesta = await fetch("https://backendmovi-production.up.railway.app/api/auth/registro", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datosEnviar)
            });

            const data = await respuesta.json();
            console.log("gitRespuesta del registro:", data);
            
            if (respuesta.ok) {
                if (data.token && data.usuario) {
                    login(data.token, data.usuario);
                    
                    const rolAsignado = data.usuario.idRol || data.usuario.rol?.id;
                    const tipoUsuario = rol === "CONDUCTOR" ? "Conductor" : "Viajero";
                    
                    setSuccess(`¡Registro exitoso como ${tipoUsuario}! Redirigiendo...`);
                
                    setTimeout(() => {
                        if (rolAsignado === 1) {
                            navigate("/dashboard/home");
                        } else if (rolAsignado === 2 || rol === "CONDUCTOR") {
                            navigate("/driver-home");
                        } else {
                            navigate("/user-home");
                        }
                    }, 1500);
                } else {
                    setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
                    setTimeout(() => navigate("/login"), 1500);
                }
            } else {
                setError(data.message || 'Error al registrarse');
            }
        } catch (error) {
            console.error(" Error en registro:", error);
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            background: 'linear-gradient(20deg, #EDE7FF 30%, #a385ff 100%)',
            minHeight: '100vh',
            minWidth: '100vw',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar/>
            <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1 }}>
                <Row className="justify-content-center">
                    <Col xs={12} md={4} lg={4} xl={3} className="mt-4">
                        <Card className="shadow border-2" style={{ fontSize: '0.9rem' }}>
                            <Card.Body className="p-3">
                                <div className="text-center mb-3">
                                    <div style={{
                                        width: '150px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #a385ff, #EDE7FF)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '5px'
                                    }}>
                                        <i className="bi bi-person-circle text-white">
                                            <Card.Title as="h4" className="text-center mb-2" style={{textShadow: '1px 1px 1px rgba(0,0,0,2)'}}>
                                                Registrarse
                                            </Card.Title>
                                        </i>
                                    </div>
                                </div>
                                
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                
                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-2" controlId="nombre">
                                        <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese su nombre completo"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-2" controlId="email">
                                        <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
                                        <div style={{ position: 'relative' }}>
                                            <FaEnvelope style={{
                                                position: 'absolute',
                                                left: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#6c757d',
                                                zIndex: 10
                                            }} />
                                            <Form.Control
                                                type="email"
                                                placeholder="ejemplo@correo.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-2" controlId="telefono">
                                        <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="Ingrese su número de teléfono"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-2" controlId="password">
                                        <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
                                        <div style={{ position: 'relative' }}>
                                            <FaLock style={{
                                                position: 'absolute',
                                                left: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#6c757d',
                                                zIndex: 10
                                            }} />
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Cree una contraseña segura"
                                                value={password}
                                                onChange={(e) => {
                                                    const newPassword = e.target.value;
                                                    setPassword(newPassword);
                                                    if (newPassword.length > 0) {
                                                        setPasswordError(validarPassword(newPassword));
                                                    } else {
                                                        setPasswordError("");
                                                    }
                                                }}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px', paddingRight: '40px'}}
                                            />
                                            <Button
                                                variant="link"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#6c757d',
                                                    zIndex: 10,
                                                    padding: 0,
                                                    border: 'none'
                                                }}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </div>

                                        {passwordError && (
                                            <Alert variant="danger" className="mt-2 py-2 mb-0" style={{ fontSize: '0.8rem' }}>
                                                <strong>Requisitos de contraseña:</strong>
                                                <ul className="mb-0">
                                                    {password.length < 8 && <li>Al menos 8 caracteres</li>}
                                                    {!/[A-Z]/.test(password) && <li>Al menos una mayúscula</li>}
                                                    {!/[a-z]/.test(password) && <li>Al menos una minúscula</li>}
                                                    {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && <li>Al menos un carácter especial</li>}
                                                </ul>
                                            </Alert>
                                        )}
                                        
                                        {!passwordError && password.length > 0 && (
                                            <Alert variant="success" className="mt-2 py-2 mb-0" style={{fontSize: '0.8rem'}}>
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                Contraseña válida
                                            </Alert>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="rol">
                                        <Form.Label>
                                            <FaUserTag className="me-1" />
                                            Tipo de Usuario <span className="text-danger">*</span>
                                        </Form.Label>
                                    
                                        <div className="d-flex gap-4 mt-2">
                                            <Form.Check
                                                type="radio"
                                                id="rolPasajero"
                                                label="Pasajero"
                                                name="rolGroup"
                                                value="PASAJERO"
                                                checked={rol === "PASAJERO"}
                                                onChange={(e) => setRol(e.target.value)}
                                                disabled={loading}
                                                className="fw-normal"
                                            />
                                            <Form.Check
                                                type="radio"
                                                id="rolConductor"
                                                label="Conductor"
                                                name="rolGroup"
                                                value="CONDUCTOR"
                                                checked={rol === "CONDUCTOR"}
                                                onChange={(e) => setRol(e.target.value)}
                                                disabled={loading}
                                                className="fw-normal"
                                            />
                                        </div>
                                        
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        className="w-100 mb-1 d-block mx-auto py-2 fw-bold" 
                                        style={{
                                            background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)',
                                            border: 'none',
                                            fontSize: '1rem'
                                        }}
                                        disabled={loading || passwordError}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Registrando...
                                            </>
                                        ) : "Crear Cuenta"}
                                    </Button>
                                </Form>

                                <div className="text-center mt-3">
                                    <p className="text-muted mb-0">
                                        ¿Ya tienes cuenta?{" "}
                                        <a href="/login" className="text-decoration-none fw-bold" style={{ color: '#6f42c1' }}>
                                            Inicia sesión aquí
                                        </a>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col xs={12} md={8} lg={8} xl={9} className="mt-4">
                        <div className="text-center w-100">
                            <div style={{
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto',
                                borderRadius: '15px',
                                overflow: 'hidden',
                                border: '2px solid white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <img 
                                    src=""
                                    alt="Conductores y Viajeros"
                                    className="img-fluid"
                                    style={{
                                        height: 'auto',
                                        display: 'block',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        
                            <h3 className="mt-3 fw-bold" style={{ color: '#6C3BFF' }}>
                                Únete a nuestra comunidad
                            </h3>
                            <p className="text-muted">
                                Conéctate con conductores verificados y viajeros de confianza
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Register;