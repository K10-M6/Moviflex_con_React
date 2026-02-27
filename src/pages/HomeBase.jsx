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
  <Row className="text-center mb-5">
    <Col>
      <h2 className="fw-bold" style={{ fontSize: '2.5rem', color: '#333' }}>¿Cómo Funciona?</h2>
      <p className="text-muted">Tres simples pasos para comenzar tu experiencia</p>
    </Col>
  </Row>
  
  <Carousel 
    interval={4000} 
    indicators={true} 
    variant="dark"
    nextIcon={<span aria-hidden="true" className="carousel-control-next-icon bg-dark rounded-circle p-3"/>}
    prevIcon={<span aria-hidden="true" className="carousel-control-prev-icon bg-dark rounded-circle p-3"/>}
  >
    {slidesFunciona.map((item) => (
      <Carousel.Item key={item.id}>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '30px',
              padding: '40px 30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease',
              textAlign: 'center'
            }}>
              {/* Icono circular con color de fondo */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px',
                boxShadow: `0 10px 20px ${item.color}40`
              }}>
                <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                  {item.icono}
                </span>
              </div>
              
              {/* Número de paso con diseño circular pequeño */}
             
              
              {/* Contenido de la carta */}
              <h3 className="fw-bold mb-3" style={{ fontSize: '1.8rem', color: '#333' }}>
                {item.titulo}
              </h3>
              
              <p style={{ 
                fontSize: '1.1rem', 
                lineHeight: '1.6', 
                color: '#666',
                marginBottom: '30px',
                padding: '0 15px'
              }}>
                {item.desc}
              </p>
              
              
            </div>
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
            <Col lg={10}> {/* Tamaño mediano ajustado */}
              <div style={{ 
                borderRadius: '20px', overflow: 'hidden', 
                
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