import React, { useState, useRef } from 'react';
import { Modal, Button, Alert, Form } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaCamera, FaUpload } from 'react-icons/fa';

function QRScanner({ show, onHide, onScanSuccess }) {
  const [scanMethod, setScanMethod] = useState('camera'); 
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);

  const startCameraScan = () => {
    setError('');
    setScanning(true);
    
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true
        },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScanning(false);
          onScanSuccess(decodedText);
          onHide();
        },
        (errorMessage) => {

          console.log('Error escaneando:', errorMessage);
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
              html5QrCode.clear();
              onScanSuccess(decodedText);
              onHide();
            })
            .catch(err => {
              setError('No se pudo leer el código QR de la imagen. Asegúrate de que sea un QR válido.');
              console.error('Error leyendo QR de archivo:', err);
            });
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };


  const handleClose = () => {
    stopScanning();
    onHide();
  };

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
            
            <Form.Control
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