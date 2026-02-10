import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from '../components/Navbar';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Asumiendo que tu login en context ya guarda todo
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function guardar(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const respuesta = await fetch("https://backendmovi-production.up.railway.app", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                login(data.token, data.usuario); // Esto guarda la sesión
                setSuccess("¡Bienvenido de nuevo!");
                
                // La redirección la hará el RequiredAuth al detectar el cambio de estado, 
                // o puedes forzarla aquí a "/"
                navigate("/");
            } else {
                setError(data.message || 'Credenciales incorrectas');
            }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
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
            <Navbar />
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
                                        <Card.Title as="h4" className="text-center mb-0 text-white" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.2)' }}>
                                            Iniciar Sesión
                                        </Card.Title>
                                    </div>
                                </div>

                                {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}
                                {success && <Alert variant="success" className="py-2 text-center">{success}</Alert>}

                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
                                        <div style={{ position: 'relative' }}>
                                            <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', zIndex: 10 }} />
                                            <Form.Control
                                                type="email"
                                                placeholder="correo@ejemplo.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                style={{ paddingLeft: '40px' }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="password">
                                        <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
                                        <div style={{ position: 'relative' }}>
                                            <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', zIndex: 10 }} />
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                            />
                                            <div 
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#6c757d', zIndex: 10 }}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </div>
                                        </div>
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        className="w-100 border-0" 
                                        disabled={loading}
                                        style={{ background: 'linear-gradient(135deg, #a385ff, #8a65ff)', fontWeight: 'bold' }}
                                    >
                                        {loading ? "Entrando..." : "Entrar"}
                                    </Button>
                                </Form>
                                
                                <div className="text-center mt-3">
                                    <span>¿No tienes cuenta? </span>
                                    <span onClick={() => navigate("/register")} style={{ color: '#a385ff', cursor: 'pointer', fontWeight: 'bold' }}>Regístrate</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;
