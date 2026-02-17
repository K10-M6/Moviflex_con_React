  import React, { useState, useEffect } from "react";
  import viajeEnCarro from "../../pages/Imagenes/viaje-en-carro1.jpg";
  import DNNYPYGT65C3JHMUEEZKEUM7AY from "../../pages/Imagenes/DNNYPYGT65C3JHMUEEZKEUM7AY.jpg";
  import salirACarreteraGonhergo from "../../pages/Imagenes/salir-a-carretera-gonhergo.jpg";
  import { useAuth } from "../../pages/context/AuthContext";
  import Navbar from "../../components/Navbar";
  import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
  import { FaQrcode } from "react-icons/fa";
  import { Link } from "react-router-dom";
  import PropTypes from "prop-types";
  import QRModal from "../../components/QRModal";

  const UserHeader = ({ name, bio, cover, onEdit }) => {
    const background = cover || "";

    return (
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
        style={{
          minHeight: "600px",
          backgroundImage: background ? "url(" + background + ")" : "none",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundColor: '#124c8300',
        }}
      >
        <span className="mask bg-gradient-default opacity-8" />
        <Container className="d-flex align-items-center justify-content-center" fluid style={{ justifyContent: "center", textAlign: "center" }}>
          <Row className="w-100 justify-content-center">
            <Col className="text-center">
              <h1 className="display-2 text-white">Bienvenido {name}</h1>
              <p className="text-white mt-0 mb-5">{bio}</p>
              <Button
                variant="info"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onEdit) onEdit();
                }}
              >
                Edit profile
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  const BackgroundSlider = ({ images = [], interval = 6000, overlayColor = 'rgba(18,76,131,0.45)' }) => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
      if (!images || images.length === 0) return;
      setFade(true);
      const timeout = setTimeout(() => setFade(false), interval - 1000);
      const t = setInterval(() => {
        setFade(true);
        setTimeout(() => {
          setIndex(i => (i + 1) % images.length);
          setFade(false);
        }, 2500); 
      }, interval);
      return () => {
        clearInterval(t);
        clearTimeout(timeout);
      };
    }, [images, interval]);

    return (
      <div aria-hidden="true">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {images.map((src, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: i === index ? (fade ? 1 : 1) : (fade && (i === (index + images.length - 1) % images.length) ? 0 : 0),
                transition: 'opacity 1s cubic-bezier(.4,0,.2,1)',
                filter: 'grayscale(10%) contrast(95%) brightness(95%)',
                zIndex: i === index ? 1 : 0,
              }}
            />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: overlayColor, transition: 'background 300ms', pointerEvents: 'none' }} />
        </div>
      </div>
    );
  };

  UserHeader.propTypes = {
    name: PropTypes.string,
    bio: PropTypes.string,
    cover: PropTypes.string,
    onEdit: PropTypes.func,
  };

  UserHeader.defaultProps = {
    name: "Jesse",
    bio:
      "This is your profile page. You can see the progress you've made with your work and manage your projects or assigned tasks",
    cover: null,
    onEdit: null,
  };

  function Profile() {
    const { usuario, token, logout } = useAuth();
    
    const [nombre, setNombre] = useState(usuario?.nombre || '');
    const [telefono, setTelefono] = useState(usuario?.telefono || '');
    const [imagenUrl, setImagenUrl] = useState(null); 
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrValue, setQrValue] = useState('');

    const backgroundImages = [
      viajeEnCarro,
      DNNYPYGT65C3JHMUEEZKEUM7AY,
      salirACarreteraGonhergo
    ];

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImagenUrl(URL.createObjectURL(file));
      }
    };

    const handleEdit = () => {
      const el = document.getElementById("profile-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSaveChanges = (e) => {
      e.preventDefault();
      alert("Datos de perfil actualizados (simulación)");
    };

    const generarQr = () => {
      if (!token) {
        alert("No hay Token disponible. Inicia sesión nuevamente.");
        return;
      }

      console.log("🔍 ===== DEPURACIÓN QR PERFIL =====");
      console.log("👤 Usuario actual:", usuario);
      console.log("🔑 Token existe?:", !!token);
      console.log("🆔 idRol desde usuario:", usuario?.idRol);
      console.log("🆔 idRol desde usuario.rol:", usuario?.rol?.id);

      const qrData = {
        tipo: 'login_token',
        token: token,
        email: usuario?.email,
        idRol: usuario?.idRol || usuario?.rol?.id, 
        expira: Date.now() + 10800000
      };

      console.log("🎯 QR generado (objeto):", qrData);
      console.log("🎯 QR string:", JSON.stringify(qrData));
      console.log("🎯 ¿Tiene idRol?", qrData.idRol ? `SÍ (${qrData.idRol})` : "NO");
      console.log("🎯 Tipo de idRol:", typeof qrData.idRol);
      console.log("🔍 ===== FIN DEPURACIÓN PERFIL =====\n");

      setQrValue(JSON.stringify(qrData));
      setShowQRModal(true);
    };

    return (
      <div style={{ minHeight: '100vh', minWidth: '100vw', position: 'relative' }}>
        <BackgroundSlider images={backgroundImages} overlayColor={'rgba(18, 76, 131, 0.27)'} />
        <div style={{ position: 'relative', zIndex: 2 }}>
    
          <div style={{ background: '#124c83ae', width: '100%', position: 'relative', zIndex: 10 }}>
            <Navbar />
          </div>
          
          <Container fluid className="py-3" style={{ marginTop: 24, maxWidth: 1400, minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <Row className="align-items-center justify-content-center w-100" style={{ minHeight: 320 }}>
              <Col xs={12} md={6} lg={5} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0)'}}>
                  <UserHeader
                    name={nombre || usuario?.nombre}
                    bio={usuario?.bio || "Mi perfil"}
                    cover={imagenUrl || usuario?.cover || null}
                    onEdit={handleEdit}
                  />
                </div>
              </Col>
              <Col xs={12} md={6} lg={5} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Card className="shadow border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: 'none', backdropFilter: 'blur(2px)', width: '100%', maxWidth: 500 }}>
                  <Card.Body className="p-4">
                    <h2 className="mb-4 text-center">Mi Perfil</h2>
                    <Form id="profile-form" onSubmit={handleSaveChanges}>
                      <div className="text-center mb-4">
                        <img 
                          src={imagenUrl || 'https://via.placeholder.com/150'} 
                          alt="Perfil" 
                          className="rounded-circle shadow-sm" 
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                        />
                        <Form.Group controlId="formFile" className="mt-3">
                          <Form.Label className="btn btn-outline-primary">Cambiar Foto</Form.Label>
                          <Form.Control type="file" onChange={handleImageChange} style={{ display: 'none' }} />
                        </Form.Group>
                      </div>
                      
                      <Form.Group className="mb-3" controlId="formNombre">
                        <Form.Label>Nombre Completo</Form.Label>
                        <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingresa tu nombre" />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="formTelefono">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ingresa tu teléfono" />
                      </Form.Group>
                      
                      <Form.Group className="mb-4" controlId="formEmail">
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control type="email" defaultValue={usuario?.email} disabled />
                      </Form.Group>

                      <div className="d-grid gap-2">
                        <Button onClick={generarQr}
                          variant="outline-primary"
                          style={{ borderColor: '#124c83', color: '#124c83'}}>
                          <FaQrcode className="me-2" />
                          Generar QR de acceso
                        </Button>

                        <Button type="submit" style={{background: '#050505', border: 'none', color: 'white'}}>
                          Guardar Cambios
                        </Button>
                        
                        <Button as={Link} to="/tus-viajes" variant="outline-info">
                          Ver Mis Viajes
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>

        <QRModal
          show={showQRModal}
          onHide={() => setShowQRModal(false)}
          qrValue={qrValue}
          usuario={usuario}
          titulo="Tu QR de Acceso Rápido"
          mensajeExpiracion="Válido por 3 horas"
        />
      </div>
    );
  }

  export default Profile;