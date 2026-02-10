import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from '../components/Navbar';

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
                
                if (data.usuario.idRol === 1 || data.usuario.rol?.id === 1) {
                    navigate("/dashboard/home");
                } else if (data.usuario.idRol === 2 || data.usuario.rol?.id === 2) {
                    navigate("/");
                } else if (data.usuario.idRol === 3 || data.usuario.rol?.id === 3) {
                    navigate("/");
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
                        <Card className="shadow border-2" style={{
                            fontSize: '0.9rem'
                        }}>
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
                                                Iniciar Sesión
                                            </Card.Title>
                                        </i>
                                    </div>
                                </div>
                                
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                
                                <Form onSubmit={guardar}>
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
                                                placeholder="Ingrese su correo electrónico"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </div>
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
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        className="w-70 mb-1 d-block mx-auto py-1" 
                                        style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'}}
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
                    <Col xs={13} md={8} lg={9} xl={9} className="mt-4">
                        <div className=" text-center w-100">
                            <div style={{
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '4 auto',
                                borderRadius: '200px',
                                overflow: 'hidden',
                                border: '2px solid white',
                            }}>
                                <img 
                                    src="https://resizer.glanacion.com/resizer/v2/los-autos-mas-caros-que-se-vendieron-este-2023-no-FQFIMWVMVZGXHIS7BH2SIXGGZQ.jpg?auth=f76b37a176625c85e2fb9ae828be3d4c686100df1081520c6661f90841a3d52b&width=1200&quality=70&smart=false&height=800"
                                    alt="Conductores y Viajeros"
                                    className="img-fluid rounded shadow"
                                    style={{
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            </div>
                        
                            <h3 className="mt-3" style={{ color: '#6C3BFF' }}>
                                Bienvenido de Nuevo
                            </h3>
                            <p className="text-muted">
                                Accede a tu cuenta para gestionar tus viajes
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;