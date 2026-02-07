    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { useAuth } from "./context/AuthContext";
    import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
    import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
    import Navbar from '../components/Navbar';

    function Register() {
        const navigate = useNavigate();
        const { guardarToken, guardarUsuario } = useAuth();
        const [nombre, setNombre] = useState("");
        const [email, setEmail] = useState("");
        const [telefono, setTelefono] = useState("");
        const [password, setPassword] = useState("");
        const [idRol, setIdRol] = useState("");
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
                const respuesta = await fetch("https://backendmovi-production.up.railway.app/api/auth/registro", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({nombre, email, telefono, password, idRol})
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    if (data.token) guardarToken(data.token);
                    if (data.usuario) guardarUsuario(data.usuario);

                    setSuccess("¡Registro exitoso!");
                    navigate("/login");
                } else {
                    setError(data.message || 'Error al registrarse');
                }
            } catch (error) {
                setError("Error de conexión con el servidor");
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
            flexDirection: 'column'}}>
                <Navbar/>
                <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1 }}>
                    <Row className="justify-content-center">
                        <Col xs={12} md={5} lg={5}>
                            <Card className="shadow border-2">
                                <Card.Body className="p-4">
                                    <div className="text-center mb-3">
                                        <div style={{
                                            width: '150px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6C3BFF, #EDE7FF)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '5px'
                                        }}>
                                            <i className="bi bi-person-circle text-white">
                                                <Card.Title as="h2" className="text-center mb-3" style={{textShadow: '1px 1px 1px rgba(0,0,0,2)'}}>
                                                    Registrarse
                                                </Card.Title>
                                            </i>
                                        </div>
                                    </div>
                                    
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    {success && <Alert variant="success">{success}</Alert>}
                                    
                                    <Form onSubmit={guardar}>
                                        <Form.Group className="mb-3" controlId="nombre">
                                            <Form.Control
                                                type="text"
                                                placeholder="Ingrese su nombre"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Control
                                                type="email"
                                                placeholder="Ingrese su correo electrónico"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="telefono">
                                            <Form.Control
                                                type="tel"
                                                placeholder="Ingrese su teléfono"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="password">
                                            <Form.Control
                                                type="password"
                                                placeholder="Ingrese su contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{paddingLeft: '40px'}}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="rol">
                                            <Form.Select
                                                value={idRol}
                                                onChange={(e) => setIdRol(e.target.value)}
                                                required
                                                disabled={loading}
                                            >
                                                <option value="">Seleccione un rol</option>
                                                <option value="2">Conductor</option>
                                                <option value="3">Viajero</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            className="w-100" 
                                            style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)'}}
                                            disabled={loading}
                                            
                                        >
                                            {loading ? "Registrando..." : "Registrarse"}
                                        </Button>
                                    </Form>

                                    <p className="text-center text-muted mt-3">
                                        ¿Ya tienes cuenta?{" "}
                                        <a href="/login" className="text-decoration-none">
                                            Inicia sesión aquí
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

    export default Register;