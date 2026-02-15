import { useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { FaDownload, FaPrint, FaArrowLeft } from "react-icons/fa";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import Logo from './Imagenes/TODO_MOVI.png';

function QRActivation() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const qrRef = useRef();

    const qrValue = token || "sin-token";
    const descargarQR = () => {
        const svg = qrRef.current.querySelector("svg");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const image = new Image();
        
        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
            
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `QR-Codigo-${user?.nombre || 'conductor'}.png`;
            link.click();
        };
        
        image.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svg));
    };

    const imprimirQR = () => {
        const svg = qrRef.current.querySelector("svg");
        const ventanaImpresion = window.open();
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Imprimir Código QR</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                            background: white;
                        }
                        .container {
                            text-align: center;
                        }
                        svg {
                            max-width: 400px;
                            margin: 20px 0;
                        }
                        h2 {
                            color: #124c83;
                        }
                        p {
                            font-size: 16px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Código de Activación QR</h2>
                        <p>Conductor: ${user?.nombre || "Usuario"}</p>
                        ${new XMLSerializer().serializeToString(svg)}
                        <p>Escanea este código desde la aplicación móvil Moviflex</p>
                    </div>
                </body>
            </html>
        `);
        ventanaImpresion.document.close();
        setTimeout(() => {
            ventanaImpresion.print();
        }, 250);
    };

    return (
        <div style={{
            backgroundColor: '#124c83',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />
            <Container className="d-flex flex-column justify-content-center" style={{ flexGrow: 1, paddingY: '40px' }}>
                <Row className="justify-content-center">
                    <Col xs={12} md={6} lg={5}>
                        <Card className="shadow border-2" style={{ fontSize: '0.95rem' }}>
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <img src={Logo} alt="Logo Moviflexx" 
                                        style={{
                                            width: '180px',
                                            height: 'auto',
                                        }}
                                    />
                                </div>

                                <h3 className="text-center mb-3" style={{ color: '#124c83' }}>
                                    Tu Código de Activación
                                </h3>

                                <Alert variant="info" className="text-center">
                                    <p className="mb-0">
                                        <strong>Conductor:</strong> {user?.nombre || "Usuario"}
                                    </p>
                                    <p className="mb-0 mt-2" style={{ fontSize: '0.9rem' }}>
                                        Escanea este código desde tu app móvil para activar tu cuenta
                                    </p>
                                </Alert>

                                <div 
                                    ref={qrRef}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '30px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        border: '2px solid #124c83'
                                    }}
                                >
                                    <QRCode
                                        value={qrValue}
                                        size={256}
                                        level="H"
                                        quietZone={10}
                                        bgColor="#ffffff"
                                        fgColor="#124c83"
                                    />
                                </div>

                                <Alert variant="warning" style={{ fontSize: '0.85rem' }}>
                                    <strong>⚠️ Importante:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li>Guarda este código de forma segura</li>
                                        <li>Úsalo solo en tu dispositivo móvil</li>
                                        <li>No lo compartas con otras personas</li>
                                    </ul>
                                </Alert>

                                {/* Botones de acción */}
                                <div className="d-flex gap-2 mb-3">
                                    <Button
                                        onClick={descargarQR}
                                        variant="success"
                                        className="flex-fill"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        <FaDownload className="me-2" />
                                        Descargar
                                    </Button>
                                    <Button
                                        onClick={imprimirQR}
                                        variant="primary"
                                        className="flex-fill"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        <FaPrint className="me-2" />
                                        Imprimir
                                    </Button>
                                </div>

                                <Button
                                    onClick={() => navigate('/login')}
                                    variant="outline-secondary"
                                    className="w-100"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    <FaArrowLeft className="me-2" />
                                    Volver
                                </Button>

                                <p className="text-center text-muted mt-4" style={{ fontSize: '0.85rem' }}>
                                    ¿Ya tienes tu código? 
                                    <a href="/login" className="ms-1" style={{ textDecoration: 'none' }}>
                                        Escanea aquí
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

export default QRActivation;
