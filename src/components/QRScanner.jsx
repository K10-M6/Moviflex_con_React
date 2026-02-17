import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaCamera, FaUpload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/context/AuthContext';

function QRScanner({ show, onHide }) {
    const [error, setError] = useState('');
    const [scanMethod, setScanMethod] = useState('camera');
    const [scanning, setScanning] = useState(false);
    const fileInputRef = useRef(null);
    const scannerRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const ROLES = {
        ADMIN: 1,
        CONDUCTOR: 2,
        VIAJERO: 3
    };

    const handleClose = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
        }
        setScanning(false);
        onHide();
    };

    const procesarQR = (decodedText) => {
        try {
            console.log("📱 QR escaneado:", decodedText);
            const datos = JSON.parse(decodedText);
            
            if (datos.tipo === 'login_token') {
                if (datos.expira && datos.expira < Date.now()) {
                    setError('El código QR ha expirado');
                    return;
                }
                
                if (!datos.idRol) {
                    console.error("❌ El QR no contiene idRol");
                    setError('El QR no contiene información de rol válida');
                    return;
                }
                
                const usuarioQR = {
                    email: datos.email,
                };
                
                console.log("✅ Usuario QR:", usuarioQR);
                console.log("✅ Rol detectado:", datos.idRol);
                
                login(datos.token, usuarioQR);
                
                const rolId = Number(datos.idRol);
                if (rolId === ROLES.ADMIN) {
                    console.log("🚀 Redirigiendo a ADMIN");
                    navigate('/dashboard/home');
                } else if (rolId === ROLES.CONDUCTOR) {
                    console.log("🚀 Redirigiendo a CONDUCTOR");
                    navigate('/driver-home');
                } else if (rolId === ROLES.VIAJERO) {
                    console.log("🚀 Redirigiendo a VIAJERO");
                    navigate('/user-home');
                } else {
                    console.log("🚀 Rol desconocido");
                    navigate('/');
                }
                
                onHide();
            } else {
                setError('QR no válido para login');
            }
        } catch (error) {
            console.error('Error procesando QR:', error);
            setError('Error al procesar el QR');
        }
    };

    const startCameraScan = () => {
        setError('');
        setScanning(true);

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 5,
                    qrbox: { width: 300, height: 300 },
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true,
                    aspectRatio: 1.0,
                    defaultZoomValueIfSupported: 2,
                    videoConstraints: {
                        facingMode: "environment"
                    }
                },
                false
            );
            
            scanner.render(
                (decodedText) => {
                    console.log("✅ QR escaneado con cámara");
                    scanner.clear();
                    setScanning(false);
                    procesarQR(decodedText);
                },
                (errorMessage) => {
                    if (!errorMessage?.includes('NotFoundException')) {
                        console.log('Error escáner:', errorMessage);
                    }
                }
            );
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setError('');

        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecciona un archivo de imagen válido');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                import('html5-qrcode').then(({ Html5Qrcode }) => {
                    const html5QrCode = new Html5Qrcode('qr-reader-file');
                    
                    html5QrCode.scanFile(file, true)
                        .then(decodedText => {
                            console.log("✅ QR leído de archivo EXITOSAMENTE");
                            console.log("📦 Contenido:", decodedText);
                            html5QrCode.clear();
                            procesarQR(decodedText);
                        })
                        .catch(err => {
                            console.error('❌ Error leyendo QR:', err);
                            
                            if (err.toString().includes('NotFoundException')) {
                                setError('No se encontró ningún código QR en la imagen. Asegúrate de que la imagen sea clara y el QR esté bien visible.');
                            } else {
                                setError('No se pudo leer el código QR. Intenta con otra imagen.');
                            }
                        });
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, []);

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: '#124c83', color: 'white' }}>
                <Modal.Title>
                    <FaQrcode className="me-2" />
                    Escanear Código QR
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <div className="d-flex justify-content-center mb-4">
                    <Button
                        variant={scanMethod === 'camera' ? 'primary' : 'outline-primary'}
                        onClick={() => {
                            setScanMethod('camera');
                            stopScanning();
                        }}
                        className="me-2"
                        style={{ borderRadius: '30px' }}
                    >
                        <FaCamera className="me-2" />
                        Usar Cámara
                    </Button>
                    <Button
                        variant={scanMethod === 'upload' ? 'primary' : 'outline-primary'}
                        onClick={() => {
                            setScanMethod('upload');
                            stopScanning();
                        }}
                        style={{ borderRadius: '30px' }}
                    >
                        <FaUpload className="me-2" />
                        Subir Imagen
                    </Button>
                </div>

                {error && (
                    <Alert variant="danger" className="text-center">
                        {error}
                    </Alert>
                )}

                {scanMethod === 'camera' && (
                    <div>
                        {!scanning ? (
                            <div className="text-center">
                                <p className="mb-3">Haz clic en "Iniciar Cámara" para comenzar a escanear</p>
                                <Button 
                                    onClick={startCameraScan}
                                    variant="success"
                                    size="lg"
                                    style={{ borderRadius: '30px' }}
                                >
                                    <FaCamera className="me-2" />
                                    Iniciar Cámara
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div id="qr-reader" style={{ width: '100%' }}></div>
                                <div className="text-center mt-3">
                                    <Button 
                                        onClick={stopScanning}
                                        variant="danger"
                                    >
                                        Detener Escaneo
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {scanMethod === 'upload' && (
                    <div className="text-center">
                        <div 
                            className="border rounded p-5 mb-3"
                            style={{ 
                                border: '2px dashed #124c83',
                                cursor: 'pointer',
                                backgroundColor: '#f8f9fa'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FaUpload size={40} className="mb-3" style={{ color: '#124c83' }} />
                            <p>Haz clic para seleccionar una imagen con código QR</p>
                            <p className="text-muted small">Formatos soportados: PNG, JPG, JPEG</p>
                        </div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />

                        <div id="qr-reader-file" style={{ display: 'none' }}></div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QRScanner;