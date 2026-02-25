import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Carousel } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import imagencontacto from '../pages/Imagenes/AutoresContacto.png';
import imagenAbajo from '../pages/Imagenes/Mapa.png'; 
import ImagenFondoPaisaje from '../pages/Imagenes/Paisaje-tranquilo-con-plantas-verdes.png'; 
import ImagenHomebase from '../pages/Imagenes/HomeBaseImage.png'; 

function HomeBase() {
  const autores = [
    { id: 1, nombre: "Autor 1", rol: "Desarrollador", img: "https://ui-avatars.com/api/?name=A+1&background=random" },
    { id: 2, nombre: "Autor 2", rol: "Diseñador", img: "https://ui-avatars.com/api/?name=A+2&background=random" },
    { id: 3, nombre: "Autor 3", rol: "Logística", img: "https://ui-avatars.com/api/?name=A+3&background=random" },
    { id: 4, nombre: "Autor 4", rol: "Marketing", img: "https://ui-avatars.com/api/?name=A+4&background=random" },
    { id: 5, nombre: "Autor 5", rol: "Soporte", img: "https://ui-avatars.com/api/?name=A+5&background=random" },
    { id: 6, nombre: "Autor 6", rol: "QA Tester", img: "https://ui-avatars.com/api/?name=A+6&background=random" },
  ];

  const slidesFunciona = [
    { id: 1, titulo: "Regístrate Como Conductor", desc: "¡Registrate como conductor desde la web!", img: "https://static.vecteezy.com/system/resources/previews/003/287/978/non_2x/man-using-laptop-on-the-table-searching-browsing-social-media-free-photo.jpg" },
    { id: 2, titulo: "Regístrate Como Viajero", desc: "¡Crea tu cuenta desde nuestra app!", img: "https://via.placeholder.com/400x250" },
    { id: 3, titulo: "Busca o Crea Rutas", desc: "Busca rutas disponibles o crea tu propia ruta fija.", img: "https://play-lh.googleusercontent.com/bD-ogD73DdAPn6xTmPd0w3l9O4pqpOj7VL9JBr81lvqieE1DnX3-U8q0YQbSEzFZWQ" },
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
        <Row className="text-center mb-4">
          <Col><h2 className="fw-bold">¿Cómo Funciona?</h2></Col>
        </Row>
        <Carousel interval={4000} indicators={true} variant="dark">
          {slidesFunciona.map((item) => (
            <Carousel.Item key={item.id}>
              <Row className="align-items-center p-4">
                <Col md={6} className="text-center">
                  <Image src={item.img} fluid rounded className="shadow-sm" style={{ maxHeight: '250px' }} />
                </Col>
                <Col md={6}>
                  <h3 className="fw-bold">{item.id}. {item.titulo}</h3>
                  <p>{item.desc}</p>
                </Col>
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>

      {/* --- NUEVO ORDEN --- */}

      {/* 1. SECCIÓN MAPA (MEDIANO Y CENTRADO) */}
      <Container className="text-center py-5">
          <h2 className="fw-bold mb-4">Explora nuestra red de rutas</h2>
          <Row className="justify-content-center">
            <Col lg={8}> {/* Tamaño mediano ajustado */}
              <div style={{ 
                borderRadius: '20px', overflow: 'hidden', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                border: '2px solid #ddd' 
              }}>
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
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              {/* Overlay oscuro para que se vea bien el texto de los autores */}
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0)', padding: '60px 20px' }}>
                <div className="text-center mb-5">
                  <h2 className="fw-bold text-white">Equipo MoviFlex</h2>
                  <p className="text-white-50">Los creadores de tu nueva forma de viajar</p>
                </div>
                <Row className="justify-content-center">
                  {autores.map((autor) => (
                    <Col key={autor.id} xs={6} md={4} lg={2} className="text-center mb-4">
                      <Image src={autor.img} roundedCircle className="mb-2 border border-2 border-white shadow" style={{ width: '65px', height: '65px' }} />
                      <h6 className="text-white fw-bold mb-0 small">{autor.nombre}</h6>
                      <p className="text-white-50" style={{ fontSize: '10px' }}>{autor.rol}</p>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* 3. SECCIÓN PLANES (Sigue después de los autores) */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-4">
            <Col><h2 className="fw-bold">Planes para Todos</h2></Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={5} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 bg-dark text-white text-center p-3" style={{ borderRadius: '20px' }}>
                <Card.Body>
                  <Card.Title className="fw-bold">Pasajero</Card.Title>
                  <div className="display-5 fw-bold my-3">Gratis</div>
                  <Button variant="outline-light" className="w-100">Registrarse</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 bg-dark text-white text-center p-3" style={{ borderRadius: '20px' }}>
                <Card.Body>
                  <Card.Title className="fw-bold">Conductor Premium</Card.Title>
                  <div className="display-5 fw-bold my-3">COP 10k</div>
                  <Button variant="light" className="w-100 fw-bold">Elegir Plan</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <footer className="py-5 bg-dark text-white text-center mt-auto">
        <Container>
          <h2 className="mb-4">Únete a nuestra comunidad</h2>
          <Button as={Link} to="/register" variant="light" className="px-5 fw-bold">Registrarse Ahora</Button>
          <p className="mt-5 text-secondary small">© 2025 MoviFlexx.</p>
        </Container>
      </footer>
    </div>
  );
}

export default HomeBase;