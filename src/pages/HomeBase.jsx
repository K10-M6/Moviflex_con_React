import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Carousel } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import imagencontacto from '../pages/Imagenes/AutoresContacto.png';
import imagenAbajo from '../pages/Imagenes/Mapa.png'; 
import ImagenFondoPaisaje from '../pages/Imagenes/Paisaje-tranquilo-con-plantas-verdes.png'; 
import ImagenHomebase from '../pages/Imagenes/HomeBaseImage.png'; 
import { useState } from 'react';

function HomeBase() {
  // Datos de los autores - Edita esto para cambiar la info de cada uno
  const autores = [
    { id: 1, nombre: "Autor 1", rol: "Desarrollador", img: "https://ui-avatars.com/api/?name=A+1&background=random" },
    { id: 2, nombre: "Autor 2", rol: "Diseñador", img: "https://ui-avatars.com/api/?name=A+2&background=random" },
    { id: 3, nombre: "Autor 3", rol: "Logística", img: "https://ui-avatars.com/api/?name=A+3&background=random" },
    { id: 4, nombre: "Autor 4", rol: "Marketing", img: "https://ui-avatars.com/api/?name=A+4&background=random" },
    { id: 5, nombre: "Autor 5", rol: "Soporte", img: "https://ui-avatars.com/api/?name=A+5&background=random" },
    { id: 6, nombre: "Autor 6", rol: "QA Tester", img: "https://ui-avatars.com/api/?name=A+6&background=random" },
  ];

  const slidesFunciona = [
    { id: 1, titulo: "Regístrate Como Conductor", desc: "¡Registrate como conductor desde la web! Es necesario para poder ingresar tus datos con presicion y no tener inconvenientes.", img: "https://static.vecteezy.com/system/resources/previews/003/287/978/non_2x/man-using-laptop-on-the-table-searching-browsing-social-media-free-photo.jpg", link: "/register" },
    { id: 2, titulo: "Regístrate Como Viajero", desc: "¡Crea tu cuenta desde nuesta app! El registro web es exclusivo para conductores, pero puedes iniciar session una vez que te registres", img: "https://via.placeholder.com/400x250", link: "/" },
    { id: 3, titulo: "Busca o Crea Rutas", desc: "Busca rutas disponibles o crea tu propia ruta fija. para mayor flexibilidad, comparte las rutas con las personas.", img: "https://play-lh.googleusercontent.com/bD-ogD73DdAPn6xTmPd0w3l9O4pqpOj7VL9JBr81lvqieE1DnX3-U8q0YQbSEzFZWQ", link: "/" },
    { id: 4, titulo: "Viaja Seguro", desc: "Donde tu seguridad es muy importante para nosotros, estamos listos con botones de emergencias o gestos.", img: "https://www.estaentumundo.com/wp-content/imagenes/2021/04/telefonos_emergencias-777x476.jpg", link: "/" },
    { id: 5, titulo: "Ahorra en Gastos", desc: "Comparte costos de combustible y peajes fácilmente.", img: "https://www.ruta67.com/wp-content/uploads/2019/03/BuenAhorrador_940x480.jpg", link: "/" },
    { id: 6, titulo: "Comunidad Confiable", desc: "Perfiles verificados para tu tranquilidad total. Nuestro equipo se asegura de tener los perfiles mas legitimos.", img: "https://cdn-icons-png.flaticon.com/512/10074/10074046.png", link: "/" },
    { id: 7, titulo: "Soporte Continuo", desc: "Estamos contigo en cada kilómetro del camino. Contactanos con el botón de ayuda.", img: "https://static.vecteezy.com/system/resources/previews/004/607/842/non_2x/online-help-desk-concept-call-center-female-assistant-with-pc-and-headset-offering-virtual-round-the-clock-personal-technical-support-business-customer-service-and-advice-for-web-problem-solving-vector.jpg", link: "/" },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f3f1', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <div style={{ background: '#124c83', width: '100%', zIndex: 100 }}>
        <Navbar />
      </div>

      {/* SECCIÓN HERO */}
      <div style={{ position: 'relative', width: '100%', padding: '2rem 0', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${ImagenFondoPaisaje})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 10 }}>
            <Image 
            src={ImagenHomebase} 
            alt="HomeBase Header" 
            fluid 
            style={{ maxWidth: '800px', width: '100%', height: 'auto', display: 'inline-block' }}
            />
        </div>
      </div>

      {/* TEXTOS DEL HERO */}
      <section className="pb-5 w-100" style={{position: 'relative', zIndex: 10}}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8} className="mx-auto">
              <div style={{ background: 'transparent', padding: '1rem 2rem' }}>
                <h1 className="display-4 fw-bold text-dark mb-4">Conectamos personas. Optimizamos trayectos.</h1>
                <p className="lead text-dark mb-4">MOVIFLEX es una solución integral de movilidad diseñada para ofrecer eficiencia, control y seguridad en cada viaje.</p>
                <Button style={{background: '#000000', border: 'none', padding: '10px 30px'}} as={Link} to="/register">Comenzar Ahora</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN ¿CÓMO FUNCIONA? */}
      <Container style={{ background: 'transparent' }} className="p-4 mb-5">
        <Row className="text-center mb-4">
          <Col>
            <h2 className="mb-3 text-dark fw-bold">¿Cómo Funciona?</h2>
            <p className="text-muted">Tres pasos simples para comenzar (y mucho más)</p>
          </Col>
        </Row>

        <Carousel interval={4000} indicators={true} className="px-md-5" variant="dark">
          {slidesFunciona.map((item) => (
            <Carousel.Item key={item.id}>
              <Row className="align-items-center p-4">
                <Col md={6} className="text-center">
                  <Link to={item.link}>
                    <Image 
                      src={item.img} 
                      fluid 
                      rounded 
                      className="shadow-sm" 
                      style={{ cursor: 'pointer', transition: 'transform .3s', maxHeight: '300px' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </Link>
                </Col>
                <Col md={6} className="text-dark mt-3 mt-md-0">
                  <h3 className="display-6 fw-bold">{item.id}. {item.titulo}</h3>
                  <p className="lead">{item.desc}</p>
                </Col>
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>

        <Row className="mt-5 pt-5 border-top border-secondary-subtle">
          <Col className="text-center">
            <Image src={imagenAbajo} fluid rounded style={{ maxHeight: '500px', width: 'auto' }}/>
            <p className="display-6 fw-bold text-dark mt-3">Únete a nuestra comunidad de viajeros confiables</p>
          </Col>
        </Row>
      </Container>

      {/* SECCIÓN PLANES */}
      <section className="py-5 w-100">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="mb-3 text-dark fw-bold">Planes para Todos</h2>
              <p className="text-dark">Elige el plan que mejor se adapte a ti</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={4} className="mb-4">
              <Card className="h-100 shadow border-0" style={{ background: '#000000', color: '#ffffff' }}>
                <Card.Body className="text-center p-4">
                  <Card.Title className="mb-3 fw-bold">Pasajero</Card.Title>
                  <div className="display-4 fw-bold mb-4">Gratis</div>
                  <hr style={{ borderColor: '#ffffff' }} />
                  <div className="text-start">
                    <div className="mb-2">✓ Buscar rutas</div>
                    <div className="mb-2">✓ Reservar asiento</div>
                    <div className="mb-2">✓ Calificar conductores</div>
                    <div>✓ Historial de viajes</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 shadow border-0" style={{ background: '#000000', color: '#ffffff' }}>
                <Card.Body className="text-center p-4">
                  <Card.Title className="mb-3 fw-bold">Conductor Premium</Card.Title>
                  <div className="display-4 fw-bold mb-4" style={{ fontSize: '2.5rem' }}>COP 10.000<small>/mes</small></div>
                  <Button variant="light" className="w-100 mb-4 fw-bold">Elegir Plan</Button>
                  <hr style={{ borderColor: '#ffffff' }} />
                  <div className="text-start">
                    <div className="mb-2">✓ Crear rutas</div>
                    <div className="mb-2">✓ Aceptar pasajeros</div>
                    <div className="mb-2">✓ Estadísticas de viajes</div>
                    <div>✓ Prioridad en soporte</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN EQUIPO CREATIVO */}
      <div style={{ 
        width: '100%', 
        backgroundImage: `url(${imagencontacto})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        padding: '80px 0',
        position: 'relative'
      }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold text-black shadow-sm">Equipo MoviFlex</h2>
              <p className="text-black">Conoce a los autores detrás de esta iniciativa</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            {autores.map((autor) => (
              <Col key={autor.id} xs={6} md={4} lg={2} className="text-center mb-4">
                <div className="p-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '15px', backdropFilter: 'blur(5px)' }}>
                  <Image 
                    src={autor.img} 
                    roundedCircle 
                    fluid 
                    className="mb-3 border border-3 border-white shadow"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                  <h6 className="text-white fw-bold mb-1">{autor.nombre}</h6>
                  <p className="text-white-50 small mb-0">{autor.rol}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* FOOTER */}
      <section className="py-5 bg-dark text-white w-100 text-center">
        <Container>
          <h2 className="mb-4">¿Listo para Ahorrar en Tus Viajes?</h2>
          <Button as={Link} to="/register" variant="light" className="me-3">Registrarse Ahora</Button>
          <Button variant="outline-light">Contactar Soporte</Button>
        </Container>
      </section>

      <footer className="py-5 bg-dark text-white w-100 border-top border-secondary">
        <Container className="text-center">
          <p>Conectando viajeros de forma segura y económica.</p>
          <p>© 2025 MoviFlexx.</p>
        </Container>
      </footer>
    </div>
  );
}

export default HomeBase;