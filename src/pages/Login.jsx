import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Carousel } from "react-bootstrap";
import Logo from './Imagenes/TODO_MOVI.png';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaQrcode } from "react-icons/fa";
import Navbar from '../components/Navbar';
import QRScanner from '../components/QRScanner';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    
    const navigate = useNavigate();
    const { login, token, usuario } = useAuth();

    const ROLES = {
        ADMIN: 1,
        CONDUCTOR: 2,
        VIAJERO: 3
    };

    useEffect(() => {
        const rolId = usuario?.idRol || usuario?.rol?.id;

        if (rolId === ROLES.ADMIN) {
            navigate("/dashboard/home");
        } else if (rolId === ROLES.CONDUCTOR) {
            navigate("/driver-home");
        } else if (rolId === ROLES.VIAJERO) {
            navigate("/user-home");
        }
    }, [token, usuario, navigate]);

    async function guardar(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
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

                const user = data.usuario;
                const rolId = user.idRol || user.rol?.id;

                if (rolId === ROLES.ADMIN) {
                    navigate("/dashboard/home");
                } else if (rolId === ROLES.CONDUCTOR) {
                    navigate("/driver-home");
                } else if (rolId === ROLES.VIAJERO) {
                    navigate("/user-home");
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

    const handleQRScan = async (qrData) => {
        setLoading(true);
        setError("");
        
        try {
            console.log("📱 Datos del QR:", qrData);
            const datos = JSON.parse(qrData);
            
            if (datos.tipo === 'login_token') {
                if (datos.expira && datos.expira < Date.now()) {
                    setError("El código QR ha expirado. Genera uno nuevo.");
                    setLoading(false);
                    return;
                }

                if (datos.token) {
                    const usuarioQR = {
                        email: datos.email,
                        idRol: datos.idRol
                    };
                    
                    login(datos.token, usuarioQR);
                    setSuccess("¡Login automático con QR exitoso!");
                }
                
            } else {
                setError("El código QR no es válido para iniciar sesión");
            }
        } catch (error) {
            console.error("Error parseando QR:", error);
            setError("El código QR no tiene el formato correcto");
        } finally {
            setLoading(false);
        }
    };

    const imagenes = [
        "https://periodicolafuente.com/wp-content/uploads/2018/09/%C2%BFPor-qu%C3%A9-viajar-en-carro-por-M%C3%A9xico-es-algo-que-debes-vivir_LA-FUENTE-QUERETARO-.jpg",
        "https://www.elcarrocolombiano.com/wp-content/uploads/2021/11/Los-10-carros-mas-rapidos-del-mundo-2021.jpg",
        "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_790,h_395/https://alkilautos.com/blog/wp-content/uploads/2020/01/VIAJAR-TRIP-PERUCOM.jpg",
    ];

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
                    
                    {/* COLUMNA IZQUIERDA: CASILLA DE LOGIN REDISEÑADA */}
                    <Col xs={12} md={4} lg={4} xl={5}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        <Card className="shadow-lg border-0" style={{ 
                            borderRadius: '25px', 
                            overflow: 'hidden',
                            width: '100%'
                        }}>
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Logo Moviflexx"
                                        style={{
                                            width: '140px',
                                            height: 'auto',
                                        }}
                                    />
                                    <h5 className="fw-bold text-dark mt-3">¡Bienvenido de nuevo!</h5>
                                </div>

                                <Button
                                    onClick={() => setShowQRScanner(true)}
                                    variant="outline-primary"
                                    className="w-100 py-2 mb-3 d-flex justify-content-center align-items-center gap-2"
                                    style={{ 
                                        borderRadius: '12px', 
                                        borderColor: '#4acfbd',
                                        color: '#4acfbd',
                                        fontWeight: 'bold'
                                    }}
                                    disabled={loading}
                                >
                                    <FaQrcode />
                                    {loading ? 'Procesando...' : 'Iniciar sesión con QR'}
                                </Button>

                                <div className="text-center mb-2">
                                    <small className="text-muted">o</small>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                                {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label className="small fw-bold">
                                            <FaEnvelope className="me-2" />Correo Electrónico
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Ingrese su correo electrónico"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                            style={{ 
                                                borderRadius: '12px',
                                                padding: '10px 15px'
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="password">
                                        <Form.Label className="small fw-bold">
                                            <FaLock className="me-2" />Contraseña
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Ingrese su contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{ 
                                                    borderRadius: '12px',
                                                    padding: '10px 40px 10px 15px'
                                                }}
                                            />
                                            <span 
                                                className="position-absolute end-0 top-50 translate-middle-y me-3" 
                                                style={{ cursor: 'pointer', zIndex: 10 }} 
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash color="#666"/> : <FaEye color="#666"/>}
                                            </span>
                                        </div>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 py-2 mb-3"
                                        style={{ 
                                            background: '#4acfbd', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontWeight: 'bold' 
                                        }}
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
                                    <a href="/register" className="text-decoration-none fw-bold" style={{ color: '#124c83' }}>
                                        Regístrate aquí
                                    </a>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* COLUMNA DERECHA: MANTENIDA IGUAL (carrusel y mensaje originales) */}
                    <Col xs={13} md={8} lg={4} xl={6} className="mt-4"
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
                                borderRadius: '200px',
                                overflow: 'hidden',
                                border: '2px solid white',
                            }}>
                                <Carousel fade indicators controls={false} interval={2500}>
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
                                Bienvenido de Nuevo
                            </h3>
                            <p className="text-white mt-2" style={{ fontSize: '1.1rem' }}>
                                Accede a tu cuenta para gestionar tus viajes
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>

            <QRScanner
                show={showQRScanner}
                onHide={() => setShowQRScanner(false)}
                onScanSuccess={handleQRScan}
            />
        </div>
    );
}

export default Login;