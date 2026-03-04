import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useState } from 'react';

// --- IMPORTACIÓN DE IMÁGENES ---
import imagencontacto from '../pages/Imagenes/AutoresContacto.png'; 
import imagenAbajo from '../pages/Imagenes/Mapa.png'; 
import ImagenFondoPaisaje from '../pages/Imagenes/Paisaje-tranquilo-con-plantas-verdes.png'; 
import ImagenHomebase from '../pages/Imagenes/HomeBaseImage.png'; 

// IMPORTACIONES DE LAS IMÁGENES DE AUTORES
import Arlys from './Autores/Arlys.PNG';
import Carlos from './Autores/Carlos.PNG';
import Janier from './Autores/Janier.PNG';
import JuanCeron from './Autores/JuanCeron.PNG';
import JuanOcampo from './Autores/JuanOcampo.PNG';
import Kevin from './Autores/Kevin.PNG';

function HomeBase() {
    // =======================
  // ESTADOS FORMULARIO
  // =======================

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    tipo: '',
    mensaje: ''
  });

  const [mensajeEstado, setMensajeEstado] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeEstado('');
    setLoading(true);

    try {
      const response = await axios.post(
        `https://backendmovi-production-c657.up.railway.app/api/contacto/`,
        formData
      );

      setMensajeEstado(response.data.mensaje);

      setFormData({
        nombre: '',
        correo: '',
        tipo: '',
        mensaje: ''
      });

    } catch (error) {
      console.error(error);
      setMensajeEstado('Error al enviar el mensaje');
    }

    setLoading(false);
  };

  const autores = [
    { id: 1, nombre: "Arlys", rol: "Backend", img: Arlys },
    { id: 2, nombre: "Carlos", rol: "Desarrollador Móvil", img: Carlos },
    { id: 3, nombre: "Janier", rol: "Frontend", img: Janier },
    { id: 4, nombre: "Juan Cerón", rol: "Frontend Diseño", img: JuanCeron },
    { id: 5, nombre: "Juan Ocampo", rol: "Tester", img: JuanOcampo },
    { id: 6, nombre: "Kevin", rol: "Documentación", img: Kevin },
  ];

  const verdeMenta = '#56bca7';

  const slidesFunciona = [
    { id: 1, titulo: "Regístrate Como Conductor", desc: "¡Registrate como conductor desde la web!" },
    { id: 2, titulo: "Regístrate Como Viajero", desc: "¡Crea tu cuenta desde nuestra app!" },
    { id: 3, titulo: "Busca o Crea Rutas", desc: "Busca rutas disponibles o crea tu propia ruta fija." },
    { id: 4, titulo: "Comparte tu Viaje", desc: "Invita a otros usuarios a compartir tu trayecto y ahorra en tus viajes." },
    { id: 5, titulo: "Recibe Notificaciones", desc: "Mantente informado sobre tus rutas y solicitudes en tiempo real." },
    { id: 6, titulo: "Soporte Técnico", desc: "¿Tienes dudas? Nuestro equipo de soporte está listo para ayudarte." },
    { id: 7, titulo: "Viajes Seguros", desc: "Todos los conductores y viajeros son verificados para tu seguridad." },
    { id: 8, titulo: "Historial de Rutas", desc: "Consulta y gestiona tus viajes anteriores fácilmente." },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `url(${imagencontacto})`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      
      <div style={{ position: 'absolute', width: '100%', zIndex: 1000 }}>
        <Navbar transparent={true} />
      </div>

      <div style={{ 
        position: 'relative', 
        minHeight: '650px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'visible', 
        paddingTop: '80px'
      }}>
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${ImagenFondoPaisaje})`, backgroundSize: 'cover',
            backgroundPosition: 'center', zIndex: 1
        }}></div>

        <Container style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
                <h1 className="display-4 fw-bold mb-3" style={{color: '#113d69'}}>Conectamos personas. Optimizamos trayectos.</h1>
            </Col>
          </Row>
        </Container>

        <div style={{ 
            position: 'relative', 
            zIndex: 15, 
            width: '100%', 
            textAlign: 'center',
            marginTop: '-120px'
        }}>
            <Image 
                src={ImagenHomebase} 
                alt="HomeBase Visual" 
                fluid 
                style={{ 
                    maxWidth: '800px', 
                    width: '85%', 
                    borderRadius: '20px',
                    filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))' 
                }} 
            />
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '80px 0', marginTop: '50px' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold" style={{ fontSize: '2.5rem', color: '#113d69' }}>¿Cómo Funciona?</h2>
              <p style={{color: '#113d69'}}>Tres simples pasos para comenzar tu experiencia</p>
            </Col>
          </Row>

          <Row className="g-4">
            {slidesFunciona.map((item) => (
              <Col key={item.id} xs={12} sm={6} lg={4} xl={3}>
                <div style={{
                  background: 'transparent',
                  padding: '32px 24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#113d69',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '55px',
                    height: '55px',
                    borderTop: '4px solid #56bca7',
                    borderLeft: '4px solid #56bca7',
                    borderTopLeftRadius: '30px',
                  }} />
                  
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '55px',
                    height: '55px',
                    borderBottom: '4px solid #56bca7',
                    borderRight: '4px solid #56bca7',
                    borderBottomRightRadius: '30px',
                  }} />
                  
                  <h3 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: '#56bca7' }}>{item.titulo}</h3>
                  <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#113d69', marginBottom: 0 }}>{item.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* SECCIÓN MAPA */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
            <h2 className="fw-bold mb-4" style={{ color: '#113d69' }}>¡Únete a la Revolución del Viaje Compartido!</h2>
            <Image src={imagenAbajo} fluid style={{ width: '100%', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}/>
          </Col>
        </Row>
      </Container>

      {/* SECCIÓN EQUIPO - CON AJUSTE ESPECÍFICO PARA KEVIN */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div style={{ 
              backgroundColor: verdeMenta,
              borderRadius: '40px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              padding: '60px 20px'
            }}>
              <div className="text-center mb-5">
                <h2 className="fw-bold" style={{color: '#fff'}}>Equipo MoviFlex</h2>
                <p className="text-white">Los creadores de tu nueva forma de viajar</p>
              </div>
              <Row className="justify-content-center">
                {autores.map((autor) => (
                  <Col key={autor.id} xs={6} md={4} lg={2} className="text-center mb-4">
                    <div style={{
                      width: '90px',
                      height: '90px',
                      margin: '0 auto',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      border: '2px solid white',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Image 
                        src={autor.img} 
                        alt={autor.nombre}
                        style={{ 
                          width: autor.nombre === "Kevin" ? '110%' : '100%',
                          height: autor.nombre === "Kevin" ? '110%' : '100%',
                          objectFit: autor.nombre === "Kevin" ? 'contain' : 'cover',
                          transform: autor.nombre === "Kevin" ? 'scale(1.1)' : 'none'
                        }} 
                      />
                    </div>
                    <h6 className="fw-bold mb-0 small mt-2" style={{color: '#fff'}}>{autor.nombre}</h6>
                    <p style={{ fontSize: '11px', color: '#000', fontWeight: '500' }}>{autor.rol}</p>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
      {/* SECCIÓN CONTACTO */}
<Container className="py-5">
  <Row className="justify-content-center">
    <Col lg={8}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '30px',
        padding: '50px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
      }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: '#113d69' }}>
            Contáctanos
          </h2>
          <p style={{ color: '#113d69' }}>
            ¿Tienes dudas o sugerencias?
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <Row className="mb-3">
            <Col md={6}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                className="form-control"
                required
              />
            </Col>

            <Col md={6}>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={handleChange}
                className="form-control"
                required
              />
            </Col>
          </Row>

          <div className="mb-3">
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccione tipo</option>
              <option value="Soporte">Soporte</option>
              <option value="Sugerencia">Sugerencia</option>
              <option value="Reclamo">Reclamo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="mb-4">
            <textarea
              name="mensaje"
              rows="4"
              placeholder="Escribe tu mensaje..."
              value={formData.mensaje}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="text-center">
            <Button
              type="submit"
              style={{
                backgroundColor: verdeMenta,
                border: 'none',
                padding: '10px 40px',
                borderRadius: '30px'
              }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </div>

          {mensajeEstado && (
            <p className="text-center mt-4 fw-semibold"
              style={{
                color: mensajeEstado.includes('Error')
                  ? 'red'
                  : verdeMenta
              }}>
              {mensajeEstado}
            </p>
          )}

        </form>
      </div>
    </Col>
  </Row>
</Container>


      <footer className="py-5 text-white text-center mt-auto" style={{ background: '#cccbd2af' }}>
        <Container>
          <h2 className="mb-4">Únete a nuestra comunidad</h2>
          <Button as={Link} to="/register" variant="light" className="px-5 fw-bold">Registrarse Ahora</Button>
          <p className="mt-5 text-white small">© 2025 MoviFlexx.</p>
        </Container>
      </footer>
    </div>
  );
}

export default HomeBase;