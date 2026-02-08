import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from '../components/Navbar';
import { Row, Col, Card, Form, Button, Alert, Container } from "react-bootstrap";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    async function guardar(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const respuesta = await fetch("https://backendmovi-production.up.railway.app/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });

            const data = await respuesta.json();
            if (respuesta.ok) {
                if (!data.token || !data.usuario) {
                    setError('Credenciales inválidas. El servidor no devolvió token/usuario.');
                    return;
                }
                
                if (data.message && (data.message.includes('error') || data.message.includes('inválido') || data.message.includes('incorrecto'))) {
                    setError(data.message || 'Credenciales incorrectas');
                    return;
                }
                
                login(data.token, data.usuario);
                setSuccess("¡Login exitoso!");
                navigate("/homeuser");
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            setError('Error en la conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            background: 'linear-gradient(20deg, #EDE7FF 30%, #a385ff, #6C3BFF 80%)',
            minHeight: '100vh',
            minWidth: '100vw',
            display: 'flex',
            flexDirection: 'column'
        }}>
        <Navbar />
            <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1 }}>
                <Row className="justify-content-center">
                    <Col xs={10} md={4} lg={4}>
                        <Card className="shadow border-2">
                            <Card.Body className="p-4">
                                <div className="text-center mb-3">
                                    <div style={{
                                        width: '150px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6C3BFF, #EDE7FF)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '5px'
                                    }}>
                                        <i className="bi bi-person-circle text-white">
                                            <Card.Title as="h4" className="text-center mb-3" style={{textShadow: '1px 1px 1px rgba(0,0,0,2)'}}>
                                                Iniciar Sesión
                                            </Card.Title>
                                        </i>
                                    </div>
                                </div>
                                
                                {error && (
                                    <Alert variant="danger" onClose={() => setError("")} dismissible>
                                        <strong>Error:</strong> {error}
                                    </Alert>
                                )}
                                
                                {success && (
                                    <Alert variant="success" onClose={() => setSuccess("")} dismissible>
                                        <strong>Éxito:</strong> {success}
                                    </Alert>
                                )}                           
                                
                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-3" controlId="email">
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
                                                placeholder="Ingrese su correo electrónico"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="password">
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
                                                placeholder="Ingrese su contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px', paddingRight: '40px'}}
                                            />
                                            <Button
                                            variant="link"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 10
                                            }} >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <Button 
                                        style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'}} 
                                        type="submit" 
                                        size="lg" 
                                        className="w-100"
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
                                    <a href="/register" className="text-decoration-none">
                                        Regístrate aquí
                                    </a>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;