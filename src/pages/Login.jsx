import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from '../components/Navbar';
import { Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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
                navigate("/dashboard");
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
            background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
            minHeight: '100vh',
            minWidth: '100vw',   
            display: 'flex',
            flexDirection: 'column'}}>
        <Navbar />
            
            <Row className="flex-grow-1 justify-content-center align-items-center">
                <Col xs={9} sm={8} md={6} lg={4}>
                    <Card className="shadow border-2" style={{ maxWidth: '400px', width: '100%' }}>
                        <Card.Body className="p-4">
                            <Card.Title as="h2" className="text-center mb-4">
                                Iniciar Sesión
                            </Card.Title>
                            
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
                                    <Form.Control
                                        type="email"
                                        placeholder="ejemplo@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Ingrese su contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        minLength={1}
                                    />
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
        </div>
    );
}

export default Login;