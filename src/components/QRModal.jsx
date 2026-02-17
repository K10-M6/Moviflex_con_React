import React, { useRef, useCallback, useEffect, useState } from "react";
import { Modal, Button, Alert } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import { FaDownload, FaPrint, FaQrcode, FaUserTag } from 'react-icons/fa';
import PropTypes from 'prop-types';

const QRModal = ({ 
  show, 
  onHide, 
  qrValue, 
  usuario, 
  onDownload, 
  onPrint,
  titulo = "Tu código QR de acceso",
  mensajeExpiracion = "Este código QR expira en tres horas"
}) => {
  const qrContainerRef = useRef(null);
  const [qrReady, setQrReady] = useState(false);

  const getRolNombre = (idRol) => {
    const roles = {
      1: 'Administrador',
      2: 'Conductor',
      3: 'Viajero'
    };
    return roles[idRol] || 'Usuario';
  };

  useEffect(() => {
    if (!show || !qrValue) {
      setQrReady(false);
      return;
    }

    const timer = setTimeout(() => {
      if (qrContainerRef.current) {
        console.log("✅ SVG listo!");
        setQrReady(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [show, qrValue]);

  const svgToPng = (svgElement) => {
    return new Promise((resolve, reject) => {
      try {

        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          URL.revokeObjectURL(url);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        };
        
        img.onerror = reject;
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDownload = useCallback(async () => {
    console.log(" Iniciando descarga...");
    
    if (onDownload) {
      onDownload();
      return;
    }

    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) {
      alert("Error: No se encontró el código QR");
      return;
    }

    try {
      const blob = await svgToPng(svgElement);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${usuario?.nombre || 'usuario'}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error al descargar el QR");
    }
  }, [onDownload, usuario?.nombre]);

  const handlePrint = useCallback(() => {

    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) {
      alert("Error: No se encontró el código QR");
      return;
    }

    svgToPng(svgElement).then((blob) => {
      const url = URL.createObjectURL(blob);
      
      const ventanaImpresion = window.open('', '_blank');
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>QR de Acceso - ${usuario?.nombre || 'Usuario'}</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial; margin: 0; background: #f5f5f5; }
              .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              img { max-width: 400px; border: 2px solid #124c83; padding: 20px; border-radius: 10px; }
              h2 { color: #124c83; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>QR de Acceso</h2>
              <p><strong>${usuario?.nombre || 'Usuario'}</strong></p>
              <p>Email: ${usuario?.email || ''}</p>
              <p><FaUserTag /> Rol: ${getRolNombre(usuario?.idRol)}</p>
              <img src="${url}" />
              <p>Escanea este código para iniciar sesión</p>
              <p><small>${mensajeExpiracion}</small></p>
            </div>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      setTimeout(() => ventanaImpresion.print(), 250);
    });
  }, [usuario, mensajeExpiracion]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#124c83', color: 'white' }}>
        <Modal.Title>
          <FaQrcode className="me-2" /> 
          {titulo}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center p-4">
        {qrValue ? (
          <>
            {!qrReady && (
              <div className="text-info mb-2">
                ⏳ Generando código QR...
              </div>
            )}
            
            <div 
              ref={qrContainerRef}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '10px',
                display: 'inline-block',
                marginBottom: '20px',
                border: '2px solid #124c83',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}
            >
              <QRCode
                value={qrValue}
                size={256}
                level="H"
                fgColor="#124c83"
                bgColor="#ffffff"
              />
            </div>
            
            <p className="mb-3">
              <strong>Usuario:</strong> {usuario?.nombre || 'No especificado'}<br />
              <small className="text-muted">Email: {usuario?.email || 'No disponible'}</small><br />
              <small className="text-info">
                <FaUserTag className="me-1" /> 
                Rol: {getRolNombre(usuario?.idRol)}
              </small><br />
              <small className="text-warning">⏰ {mensajeExpiracion}</small>
            </p>
            
            <div className="d-flex gap-2 justify-content-center">
              <Button 
                variant="success" 
                onClick={handleDownload}
                disabled={!qrReady}
              >
                <FaDownload className="me-2" />
                Descargar
              </Button>
            </div>

            <Alert variant="warning" className="mt-3 mb-0 text-start">
              <strong>🔐 Seguridad:</strong>
              <ul className="mb-0 mt-2">
                <li>Este QR contiene tu token de acceso personal</li>
                <li>No lo compartas con nadie</li>
                <li>{mensajeExpiracion}</li>
                <li>Si alguien más lo escanea, tendrá acceso a tu cuenta</li>
              </ul>
            </Alert>
          </>
        ) : (
          <Alert variant="info">
            No hay datos para generar el QR. Intenta nuevamente.
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
};

QRModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  qrValue: PropTypes.string,
  usuario: PropTypes.shape({
    nombre: PropTypes.string,
    email: PropTypes.string,
    idRol: PropTypes.number
  }),
  onDownload: PropTypes.func,
  titulo: PropTypes.string,
  mensajeExpiracion: PropTypes.string
};

export default QRModal;