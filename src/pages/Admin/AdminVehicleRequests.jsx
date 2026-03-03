import React, { useRef, useCallback, useEffect, useState } from "react";
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
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
  const [error, setError] = useState(null);

  const getRolNombre = (idRol) => {
    const roles = {
      1: 'Administrador',
      2: 'Conductor',
      3: 'Viajero'
    };
    return roles[idRol] || 'Usuario';
  };

  // Validar que el QR value sea un string válido
  const isValidQRValue = useCallback(() => {
    if (!qrValue || typeof qrValue !== 'string') {
      setError("El valor del QR no es válido");
      return false;
    }
    
    // Verificar que no sea un objeto [object Object]
    if (qrValue === '[object Object]' || qrValue.includes('[object')) {
      setError("El token tiene formato incorrecto");
      return false;
    }
    
    // Verificar longitud mínima de un token JWT válido
    if (qrValue.length < 20) {
      setError("El token es demasiado corto");
      return false;
    }
    
    setError(null);
    return true;
  }, [qrValue]);

  useEffect(() => {
    if (!show) {
      setQrReady(false);
      setError(null);
      return;
    }

    if (!qrValue) {
      setError("No hay datos para generar el QR");
      setQrReady(false);
      return;
    }

    // Validar el QR value
    if (!isValidQRValue()) {
      setQrReady(false);
      return;
    }

    // Mostrar el QR en consola para debug (solo desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log("QR Value (primeros 20 chars):", qrValue.substring(0, 20) + "...");
    }

    const timer = setTimeout(() => {
      if (qrContainerRef.current) {
        console.log("✅ QR listo!");
        setQrReady(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [show, qrValue, isValidQRValue]);

  const svgToPng = (svgElement) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;

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

        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDownload = useCallback(async () => {
    console.log("📥 Iniciando descarga...");

    if (onDownload) {
      onDownload();
      return;
    }

    if (!isValidQRValue()) {
      alert(`Error: ${error || "El QR no es válido"}`);
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
      link.download = `QR-${usuario?.nombre?.replace(/\s+/g, '-') || 'usuario'}.png`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error("Error en descarga:", error);
      alert("Error al descargar el QR");
    }
  }, [onDownload, usuario?.nombre, isValidQRValue, error]);

  const handlePrint = useCallback(() => {
    if (!isValidQRValue()) {
      alert(`Error: ${error || "El QR no es válido"}`);
      return;
    }

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
              body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; margin: 0; background: #f5f5f5; }
              .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 500px; }
              img { max-width: 100%; border: 2px solid #124c83; padding: 20px; border-radius: 10px; }
              h2 { color: #124c83; margin-bottom: 20px; }
              .info { margin: 15px 0; color: #555; }
              .warning { color: #f39c12; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>QR de Acceso</h2>
              <div class="info">
                <p><strong>${usuario?.nombre || 'Usuario'}</strong></p>
                <p>Email: ${usuario?.email || ''}</p>
                <p>Rol: ${getRolNombre(usuario?.idRol)}</p>
              </div>
              <img src="${url}" alt="QR Code" />
              <p>Escanea este código para iniciar sesión</p>
              <p class="warning"><small>${mensajeExpiracion}</small></p>
            </div>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      setTimeout(() => ventanaImpresion.print(), 250);
    }).catch(error => {
      console.error("Error en impresión:", error);
      alert("Error al preparar la impresión");
    });
  }, [usuario, mensajeExpiracion, isValidQRValue, error]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#124c83', color: 'white' }}>
        <Modal.Title>
          <FaQrcode className="me-2" />
          {titulo}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center p-4">
        {error ? (
          <Alert variant="danger" className="mb-0">
            <Alert.Heading>Error al generar el QR</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">
              Por favor, intenta generar un nuevo código QR.
            </p>
          </Alert>
        ) : qrValue ? (
          <>
            {!qrReady && (
              <div className="text-info mb-2">
                <Spinner animation="border" size="sm" className="me-2" />
                Generando código QR...
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
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                opacity: qrReady ? 1 : 0.7
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

            <div className="mb-3">
              <p className="mb-1">
                <strong>Usuario:</strong> {usuario?.nombre || 'No especificado'}
              </p>
              <p className="mb-1">
                <small className="text-muted">Email: {usuario?.email || 'No disponible'}</small>
              </p>
              <p className="mb-1">
                <small className="text-info">
                  <FaUserTag className="me-1" />
                  Rol: {getRolNombre(usuario?.idRol)}
                </small>
              </p>
              <p className="mb-0">
                <small className="text-warning">⏰ {mensajeExpiracion}</small>
              </p>
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <Button
                variant="success"
                onClick={handleDownload}
                disabled={!qrReady}
              >
                <FaDownload className="me-2" />
                Descargar QR
              </Button>
              <Button
                variant="primary"
                onClick={handlePrint}
                disabled={!qrReady}
              >
                <FaPrint className="me-2" />
                Imprimir QR
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
  onPrint: PropTypes.func,
  titulo: PropTypes.string,
  mensajeExpiracion: PropTypes.string
};

export default QRModal;