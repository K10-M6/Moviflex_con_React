import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Carousel } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTag } from "react-icons/fa";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';

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

    const imagenes = [
        "https://resizer.glanacion.com/resizer/v2/los-autos-mas-caros-que-se-vendieron-este-2023-no-FQFIMWVMVZGXHIS7BH2SIXGGZQ.jpg?auth=f76b37a176625c85e2fb9ae828be3d4c686100df1081520c6661f90841a3d52b&width=1200&quality=70&smart=false&height=800",
        "https://www.elcarrocolombiano.com/wp-content/uploads/2021/11/Los-10-carros-mas-rapidos-del-mundo-2021.jpg",
        "https://cdn.motor1.com/images/mgl/0x0/0qzJjA/superdeportivos-mas-rapidos-del-mundo.jpg"
    ];

    function validarPassword(pwd) {
        if (!pwd) return "La contraseña es requerida";
        if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una letra mayúscula.";
        if (!/[a-z]/.test(pwd)) return "Debe incluir al menos una letra minúscula.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Debe incluir al menos un carácter especial.";
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

        if (!telefono?.trim()) {
            setError("El teléfono es requerido");
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

            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/registro", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datosEnviar)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                if (data.token && data.usuario) {
                    login(data.token, data.usuario);
                    const rolAsignado = data.usuario.idRol || data.usuario.rol?.id;
                    const tipoUsuario = rol === "CONDUCTOR" ? "Conductor" : "Viajero";
                    
                    setSuccess(`¡Registro exitoso como ${tipoUsuario}! Redirigiendo...`);
                    
                    setTimeout(() => {
                        if (rolAsignado === 1) navigate("/dashboard/home");
                        else if (rolAsignado === 2 || rol === "CONDUCTOR") navigate("/driver-home");
                        else navigate("/user-home");
                    }, 1500);
                } else {
                    setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
                    setTimeout(() => navigate("/login"), 1500);
                }
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
            backgroundColor: '#124c83',
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
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Logo Moviflexx" 
                                        style={{
                                            width: '200px',
                                            height: 'auto',
                                        }}
                                    />
                                </div>
                                
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                
                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-1" controlId="nombre">
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

                                    <Form.Group className="mb-1" controlId="email">
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
                                                style={{ paddingLeft: '40px' }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-1" controlId="telefono">
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
                                                placeholder="Cree una contraseña segura"
                                                value={password}
                                                onChange={(e) => {
                                                    const newPassword = e.target.value;
                                                    setPassword(newPassword);
                                                    setPasswordError(newPassword ? validarPassword(newPassword) : "");
                                                }}
                                                required
                                                disabled={loading}
                                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
                                                <ul className="mb-0">
                                                    {password.length < 8 && <li>Al menos 8 caracteres</li>}
                                                    {!/[A-Z]/.test(password) && <li>Al menos una mayúscula</li>}
                                                    {!/[a-z]/.test(password) && <li>Al menos una minúscula</li>}
                                                    {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && <li>Al menos un carácter especial</li>}
                                                </ul>
                                            </Alert>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="rol">
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
                                            />
                                        </div>
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        className="w-70 mb-1 d-block mx-auto py-1" 
                                        style={{ background: 'linear-gradient(20deg, #4acfbd, rgba(89, 194, 255, 0.66))' }}
                                        disabled={loading || passwordError}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Registrando...
                                            </>
                                        ) : 'Registrarse'}
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
                    
                    <Col xs={13} md={8} lg={9} xl={9} className="mt-4"
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
                                borderRadius: '100px',
                                overflow: 'hidden',
                                border: '2px solid white',
                            }}>
                                <Carousel fade indicators={true} controls={false} interval={500}>
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
                                Únete a nuestra comunidad
                            </h3>
                            <p className="text-white mt-2" style={{ fontSize: '1.1rem' }}>
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