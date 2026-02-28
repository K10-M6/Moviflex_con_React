import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Carousel } from 'react-bootstrap';
import Navbar from '../components/Navbar';
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
  const autores = [
    { id: 1, nombre: "Arlys", rol: "Backend", img: Arlys },
    { id: 2, nombre: "Carlos", rol: "Desarrollador Móvil", img: Carlos },
    { id: 3, nombre: "Janier", rol: "Frontend ", img: Janier },
    { id: 4, nombre: "Juan Cerón", rol: "Frontend Diseño", img: JuanCeron },
    { id: 5, nombre: "Juan Ocampo", rol: "Tester", img: JuanOcampo },
    { id: 6, nombre: "Kevin", rol: "Documentación", img: Kevin },
  ];

  const colorCartas = '#56bca7'; // Cambia este color para modificar el fondo de las cartas
  const slidesFunciona = [
    { id: 1, titulo: "Regístrate Como Conductor", desc: "¡Registrate como conductor desde la web!", img: "https://static.vecteezy.com/system/resources/previews/003/287/978/non_2x/man-using-laptop-on-the-table-searching-browsing-social-media-free-photo.jpg" },
    { id: 2, titulo: "Regístrate Como Viajero", desc: "¡Crea tu cuenta desde nuestra app!", img: "https://via.placeholder.com/400x250" },
    { id: 3, titulo: "Busca o Crea Rutas", desc: "Busca rutas disponibles o crea tu propia ruta fija.", img: "https://play-lh.googleusercontent.com/bD-ogD73DdAPn6xTmPd0w3l9O4pqpOj7VL9JBr81lvqieE1DnX3-U8q0YQbSEzFZWQ" },
    { id: 4, titulo: "Comparte tu Viaje", desc: "Invita a otros usuarios a compartir tu trayecto y ahorra en tus viajes.", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
    { id: 5, titulo: "Recibe Notificaciones", desc: "Mantente informado sobre tus rutas y solicitudes en tiempo real.", img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" },
    { id: 6, titulo: "Soporte Técnico", desc: "¿Tienes dudas? Nuestro equipo de soporte está listo para ayudarte.", img: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=400&q=80" },
    { id: 7, titulo: "Viajes Seguros", desc: "Todos los conductores y viajeros son verificados para tu seguridad.", img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80" },
    { id: 8, titulo: "Historial de Rutas", desc: "Consulta y gestiona tus viajes anteriores fácilmente.", img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80" },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f3f1', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ position: 'absolute', width: '100%', zIndex: 1000 }}>
        <Navbar transparent={true} />
      </div>

      {/* SECCIÓN HERO (Se mantiene igual) */}
      <div style={{ 
        position: 'relative', minHeight: '650px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: '80px'
      }}>
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${ImagenFondoPaisaje})`, backgroundSize: 'cover',
            backgroundPosition: 'center', zIndex: 1
        }}></div>

        <Container style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
                <h1 className="display-4 fw-bold text-dark mb-3">Conectamos personas. Optimizamos trayectos.</h1>
                <Button size="lg" style={{background: '#000', border: 'none'}} as={Link} to="/register">Comenzar Ahora</Button>
            </Col>
          </Row>
        </Container>

        <div style={{ position: 'relative', zIndex: 5, width: '100%', textAlign: 'center' }}>
            <Image src={ImagenHomebase} alt="HomeBase Visual" fluid style={{ maxWidth: '800px', width: '85%', borderRadius: '20px' }} />
        </div>
      </div>

      {/* SECCIÓN ¿CÓMO FUNCIONA? */}
<Container className="py-5">
  <Row className="text-center mb-5">
    <Col>
      <h2 className="fw-bold" style={{ fontSize: '2.5rem', color: '#333' }}>¿Cómo Funciona?</h2>
      <p className="text-muted">Tres simples pasos para comenzar tu experiencia</p>
    </Col>
  </Row>
  
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 16 }}>
      <div style={{
        display: 'flex',
        gap: '32px',
        minWidth: 320,
        padding: '8px 8px 8px 0',
        transition: 'all 0.3s',
      }}>
        {slidesFunciona.map((item) => (
          <div key={item.id} style={{
            background: colorCartas,
            borderRadius: '30px',
            minWidth: 320,
            maxWidth: 370,
            flex: '0 0 320px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
            border: '1px solid rgba(0,0,0,0.05)',
            padding: '32px 24px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
          }}>
            {/* Imagen removida, solo texto */}
            <h3 className="fw-bold mb-3" style={{ fontSize: '1.5rem', color: '#fff' }}>{item.titulo}</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#f4f4f4', marginBottom: '20px', padding: '0 10px' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  
    <Row className="justify-content-center mt-5">
      <Col lg={10}>
        <div style={{ 
          borderRadius: '20px', overflow: 'hidden', 
          
        }}>
          <h2 className="fw-bold text-center mb-4" style={{ color: '#333' }}>¡Únete a la Revolución del Viaje Compartido!</h2>
          <Image src={imagenAbajo} fluid style={{ width: '100%', height: 'auto' }}/>
        </div>
      </Col>
    </Row>
  </Container>

      {/* 2. SECCIÓN EQUIPO (CUADRO CON FONDO DE AUTORES) */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* El cuadro ahora tiene AutoresContacto.png de fondo */}
            <div style={{ 
              backgroundImage: `url(${imagencontacto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '40px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              {/* Overlay oscuro para que se vea bien el texto de los autores */}
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0)', padding: '60px 20px' }}>
                <div className="text-center mb-5">
                  <h2 className="fw-bold"style={{color: '#56bca7'}}>Equipo MoviFlex</h2>
                  <p className="text-white-50">Los creadores de tu nueva forma de viajar</p>
                </div>
                <Row className="justify-content-center">
                  {autores.map((autor) => (
                    <Col key={autor.id} xs={6} md={4} lg={2} className="text-center mb-4">
                      <Image 
                        src={autor.img} 
                        roundedCircle 
                        className="mb-2 border border-2 border-white shadow" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                      />
                      <h6 className="fw-bold mb-0 small" style={{color: '#56bca7'}}>{autor.nombre}</h6>
                      <p className="-50" style={{ fontSize: '10px', color: '#56bca7' }}>{autor.rol}</p>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>



      <footer className="py-5 text-white text-center mt-auto" style={{ background: '#56bca7' }}>
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