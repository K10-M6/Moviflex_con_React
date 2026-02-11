import { useState } from "react";
        import { useNavigate } from "react-router-dom";
        import { useAuth } from "./context/AuthContext";
        import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
        import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
        import Navbar from '../components/Navbar';
        import './Imagenes/Conductores.png';
        function Register() {
            const navigate = useNavigate();
            const { guardarToken, guardarUsuario } = useAuth();
            const [nombre, setNombre] = useState("");
            const [email, setEmail] = useState("");
            const [telefono, setTelefono] = useState("");
            const [password, setPassword] = useState("");
            const [idRol, setIdRol] = useState("3");
            const [error, setError] = useState("");
            const [success, setSuccess] = useState("");
            const [loading, setLoading] = useState(false);
            const [showPassword, setShowPassword] = useState(false);
            const [passwordError, setPasswordError] = useState("");

            function validarPassword(pwd) {
                if (password.length < 8) {
                    return "La contraseña debe incluir por lo menos una mayúscula, una minúscula, un carácter especial y tener 8 carácteresw en total.";
                }
                if (!/[A-Z]/.test(password)) {
                    return "La contraseña debe incluir por lo menos una mayúscula, una minúscula, un carácter especial y tener 8 carácteresw en total.";
                }
                if (!/[a-z]/.test(password)) {
                    return "La contraseña debe incluir por lo menos una mayúscula, una minúscula, un carácter especial y tener 8 carácteresw en total.";
                }
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                    return "La contraseña debe incluir por lo menos una mayúscula, una minúscula, un carácter especial y tener 8 carácteresw en total.";
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
                backgroundcColor: '#124c83',
                minHeight: '100vh',
                minWidth: '100vw',
                display: 'flex',
                flexDirection: 'column'}}>
                    <Navbar/>
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
                                                        placeholder="Ingrese su nombre"
                                                        value={nombre}
                                                        onChange={(e) => setNombre(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        style={{paddingLeft: '40px'}}
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
                                                        placeholder="Ingrese su correo electrónico"
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
                                                    placeholder="Ingrese su teléfono"
                                                    value={telefono}
                                                    onChange={(e) => setTelefono(e.target.value)}
                                                    disabled={loading}
                                                    style={{paddingLeft: '40px'}}
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
                                                        placeholder="Ingrese su contraseña"
                                                        value={password}
                                                        onChange={(e) => {
                                                            setPassword(e.target.value);
                                                            if (e.target.value.length > 0) {
                                                                setPasswordError(validarPassword(e.target.value));
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

                                                {passwordError &&(
                                                    <Alert variant="danger" className="mt-2m py-2 mb-0" style={{
                                                        fontSize: '0.8rem',
                                                    }}>
                                                        <strong>Requisitos de contraseña:</strong>
                                                        <ul className="mb-0">
                                                            {password.length < 8 && <li>Debe tener al menos 8 caracteres.</li>}
                                                            {!/[A-Z]/.test(password) && 
                                                            <li>Debe incluir al menos una letra mayúscula.</li>}
                                                            {!/[a-z]/.test(password) && 
                                                            <li>Debe incluir al menos una letra minúscula.</li>}
                                                            {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && 
                                                            <li>Debe incluir al menos un carácter especial.</li>}
                                                        </ul>
                                                    </Alert>
                                                )}
                                                
                                                {!passwordError && password.length > 0 && (
                                                    <Alert variant="success" className="mt-2 py-2 mb-0" 
                                                    style={{fontSize: '0.8rem'}}>
                                                        <i className="bi bi-check-circle-fill me-1"></i>
                                                        Contraseña válida
                                                    </Alert>
                                                )}

                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="rol">
                                                <Form.Label>Rol <span className="text-danger">*</span></Form.Label>
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
                                                className="w-70 mb-1 d-block mx-auto py-1" 
                                                style={{background: 'linear-gradient(20deg, #6f42c1, #59c2ffff)',
                                                }}
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
                                        Únete a nuestra comunidad
                                    </h3>
                                    <p className="text-muted">
                                        Conéctate con conductores y viajeros de confianza
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            );
        }

        export default Register;