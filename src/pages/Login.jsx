import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Carousel } from "react-bootstrap";
import Logo  from './Imagenes/TODO_MOVI.png';
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

    useEffect(()=> {
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

                const user = data.usuario;
                const rolId = user.idRol || user.rol?.id;
                
                if (rolId === ROLES.ADMIN) {
                    navigate("/dashboard/home");
                } else if ( rolId === ROLES.CONDUCTOR) {
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

    const handleQRSuccess = async (qrData) => {
        try {
            setLoading(true);
            setError("");
            

            console.log("QR escaneado:", qrData);
            

            const respuesta = await fetch("https://backendmovi-production-c657.up.railway.app/api/auth/qr-login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ qrToken: qrData })
            });

            const data = await respuesta.json();
            
            if (respuesta.ok && data.token && data.usuario) {
                login(data.token, data.usuario);
                setSuccess("¡Login con QR exitoso!");
                
                const rolId = data.usuario.idRol || data.usuario.rol?.id;
                if (rolId === ROLES.ADMIN) {
                    navigate("/dashboard/home");
                } else if (rolId === ROLES.CONDUCTOR) {
                    navigate("/driver-home");
                } else if (rolId === ROLES.VIAJERO) {
                    navigate("/user-home");
                }
            } else {
                setError(data.message || 'Error al procesar el código QR');
            }
        } catch (error) {
            setError('Error en la conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const imagenes = [
        "https://periodicolafuente.com/wp-content/uploads/2018/09/%C2%BFPor-qu%C3%A9-viajar-en-carro-por-M%C3%A9xico-es-algo-que-debes-vivir_LA-FUENTE-QUERETARO-.jpg",
        "https://www.elcarrocolombiano.com/wp-content/uploads/2021/11/Los-10-carros-mas-rapidos-del-mundo-2021.jpg",
        "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_790,h_395/https://alkilautos.com/blog/wp-content/uploads/2020/01/VIAJAR-TRIP-PERUCOM.jpg", // ← CORREGIDA LA URL
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
                    <Col xs={12} md={4} lg={4} xl={3}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Card className="shadow border-2" style={{
                            fontSize: '0.9rem'
                        }}>
                            <Card.Body className="p-3">
                                <div className="text-center mb-4">
                                   <img src={Logo} alt="Logo Moviflexx" 
                                        style={{
                                            width: '200px',
                                            height: 'auto',
                                        }}
                                    />
                                </div>
                                
                                <div className="text-center mb-3">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => setShowQRScanner(true)}
                                        style={{
                                            borderRadius: '30px',
                                            borderColor: '#124c83',
                                            color: '#124c83',
                                            width: '100%'
                                        }}
                                    >
                                        <FaQrcode className="me-2" />
                                        Iniciar sesión con QR
                                    </Button>
                                </div>

                                <div className="text-center mb-2">
                                    <small className="text-muted">o</small>
                                </div>

                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                
                                <Form onSubmit={guardar}>
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
                                        style={{background: 'linear-gradient(20deg, #4acfbd, rgba(89, 194, 255, 0.66))'}}
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
                onScanSuccess={handleQRSuccess}
            />
        </div>
    );
}

export default Login;