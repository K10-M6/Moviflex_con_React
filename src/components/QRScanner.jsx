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
    const [loading, setLoading] = useState(false);
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

    const procesarQR = async (decodedText) => {
        try {
            setLoading(true);
            setError('');

            console.log("📱 Token escaneado:", decodedText.substring(0, 50) + "...");

            try {

                const payload = JSON.parse(atob(decodedText.split('.')[1]));
                console.log("📦 Token decodificado COMPLETO:", payload);


                const usuarioQR = {
                    id: payload.id,
                    email: payload.email,
                    idRol: payload.idRol,
                    nombre: payload.nombre || payload.name || 'Usuario',
                    ...payload
                };

                console.log("✅ Usuario a guardar:", usuarioQR);
                console.log("✅ Nombre extraído:", usuarioQR.nombre);

                login(decodedText, usuarioQR);

                setTimeout(() => {
                    const rolId = Number(usuarioQR.idRol);
                    if (rolId === ROLES.ADMIN) {
                        console.log("🚀 Redirigiendo a ADMIN");
                        navigate('/dashboard/home');
                    } else if (rolId === ROLES.CONDUCTOR) {
                        console.log("🚀 Redirigiendo a CONDUCTOR");
                        navigate('/driver-home');
                    } else if (rolId === ROLES.VIAJERO) {
                        console.log("🚀 Redirigiendo a VIAJERO");
                        navigate('/user-home');
                    }
                }, 500);

                onHide();

            } catch (e) {
                console.error("❌ Error decodificando token:", e);
                setError('Token inválido');
            }

        } catch (error) {
            console.error('❌ Error procesando QR:', error);
            setError('Error al procesar el QR');
        } finally {
            setLoading(false);
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
                    // Guardamos la promesa de limpieza
                    const clearPromise = (scanner && scanner.getState() === 2)
                        ? scanner.clear()
                        : Promise.resolve();

                    clearPromise.then(() => {
                        setScanning(false);
                        procesarQR(decodedText);
                    }).catch(err => {
                        console.error("Error al limpiar scanner:", err);
                        setScanning(false);
                        procesarQR(decodedText);
                    });
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
                    const element = document.getElementById('qr-reader-file');
                    if (!element) {
                        setError('Error interno del escáner');
                        return;
                    }

                    const html5QrCode = new Html5Qrcode('qr-reader-file');

                    html5QrCode.scanFile(file, true)
                        .then(decodedText => {
                            console.log("✅ QR leído de archivo");
                            html5QrCode.clear();
                            procesarQR(decodedText);
                        })
                        .catch(err => {
                            console.error('❌ Error:', err);
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
                        disabled={loading}
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
                        disabled={loading}
                    >
                        <FaUpload className="me-2" />
                        Subir Imagen
                    </Button>
                </div>

                {loading && (
                    <div className="text-center mb-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Procesando...</span>
                        </div>
                        <p className="mt-2">Procesando QR...</p>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="text-center">
                        {error}
                    </Alert>
                )}

                {scanMethod === 'camera' && !loading && (
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

                {scanMethod === 'upload' && !loading && (
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
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QRScanner;