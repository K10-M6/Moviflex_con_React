import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Carousel } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import imagen from '../pages/Imagenes/Viajes.jpeg';
import { useState, useEffect } from 'react';

const BackgroundSlider = ({ images = [], interval = 3500, overlayColor = 'rgba(18,76,131,0.35)' }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) return;
    const t = setInterval(() => {
      setTimeout(() => { setIndex(i => (i + 1) % images.length); }, 1000);
    }, interval);
    return () => clearInterval(t);
  }, [images, interval]);

  return (
    <div aria-hidden="true">
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {images.map((src, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === index ? 1 : 0, transition: 'opacity 1s cubic-bezier(.4,0,.2,1)',
            filter: 'grayscale(10%) contrast(95%) brightness(95%)', zIndex: i === index ? 1 : 0,
          }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: overlayColor, pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

function HomeBase() {
  const backgroundImages = [
    'https://turismo.encolombia.com/wp-content/uploads/2018/11/Consejos-Para-Viajar-Carro.png',
    'https://www.maquimas.pe/wp-content/uploads/2024/01/1.jpg',
    'https://cdn.buttercms.com/NYZzPM4kTIyVmfDwT3RK'
  ];

  const slidesFunciona = [
    { id: 1, titulo: "Regístrate Como Conductor", desc: "¡Registrate como conductor desde la web! Es necesario para poder ingresar tus datos con presicion y no tener inconvenientes. Todo con seguridad y pasiencia", img: "https://static.vecteezy.com/system/resources/previews/003/287/978/non_2x/man-using-laptop-on-the-table-searching-browsing-social-media-free-photo.jpg", link: "/register" },
    { id: 2, titulo: "Regístrate Como Viajero", desc: "¡Crea tu cuenta desde nuesta app! El registro web es exclusivo para conductores, pero puedes iniciar session una vez que te registres", img: "https://via.placeholder.com/400x250", link: "/" },
    { id: 3, titulo: "Busca o Crea Rutas", desc: "Busca rutas disponibles o crea tu propia ruta fija. para mayor flexibilidad, comparte las rutas con las personas que van a tu mismo destino y mira el rendimiento", img: "https://play-lh.googleusercontent.com/bD-ogD73DdAPn6xTmPd0w3l9O4pqpOj7VL9JBr81lvqieE1DnX3-U8q0YQbSEzFZWQ", link: "/" },
    { id: 4, titulo: "Viaja Seguro", desc: "Disfruta de viajes compartidos seguros y económicos. Donde tu seguridad es muy importante para nosotros, estamos listos con botones de emergencias o gestos para que puedas viajar con seguridad", img: "https://www.estaentumundo.com/wp-content/imagenes/2021/04/telefonos_emergencias-777x476.jpg", link: "/" },
    { id: 5, titulo: "Ahorra en Gastos", desc: "Comparte costos de combustible y peajes fácilmente.", img: "https://www.ruta67.com/wp-content/uploads/2019/03/BuenAhorrador_940x480.jpg", link: "/" },
    { id: 6, titulo: "Comunidad Confiable", desc: "Perfiles verificados para tu tranquilidad total. Nuestro equipo se asegura de tener los perfiles mas legitimos para que no hayan inconvenientes con los pasajeros y conductores. ¡Viaja seguro!", img: "https://cdn-icons-png.flaticon.com/512/10074/10074046.png", link: "/" },
    { id: 7, titulo: "Soporte Continuo", desc: "Estamos contigo en cada kilómetro del camino. Contactanos con el botón de ayuda. Te estaremos atentiendo por cada problema o inconveniente que tengas.", img: "https://static.vecteezy.com/system/resources/previews/004/607/842/non_2x/online-help-desk-concept-call-center-female-assistant-with-pc-and-headset-offering-virtual-round-the-clock-personal-technical-support-business-customer-service-and-advice-for-web-problem-solving-vector.jpg", link: "/" },
  ];

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <BackgroundSlider images={backgroundImages} />
      
      <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div style={{ background: '#124c83', width: '100%', position: 'relative', zIndex: 10 }}>
          <Navbar />
        </div>

        {/* SECCIÓN HERO */}
        <section className="py-5 w-100">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8} className="mx-auto">
                <div style={{ background: '#7ca8d19c', padding: '3rem', borderRadius: '15px' }} className="shadow-lg">
                  <h1 className="display-4 fw-bold text-white mb-4">Conectamos personas. Optimizamos trayectos.</h1>
                  <p className="lead text-white mb-4">MOVIFLEX es una solución integral de movilidad diseñada para ofrecer eficiencia, control y seguridad en cada viaje.</p>
                  <Button style={{background: '#000000', border: 'none'}} as={Link} to="/register">Comenzar Ahora</Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* SECCIÓN ¿CÓMO FUNCIONA? */}
        <Container style={{background: '#124c8367', minHeight: 'auto'}} className="p-4 rounded shadow mb-5">
          <Row className="text-center mb-4">
            <Col>
              <h2 className="mb-3 text-white">¿Cómo Funciona?</h2>
              <p className="text-white-50">Tres pasos simples para comenzar (y mucho más)</p>
            </Col>
          </Row>

          <Carousel interval={4000} indicators={true} className="px-md-5">
            {slidesFunciona.map((item) => (
              <Carousel.Item key={item.id}>
                <Row className="align-items-center p-4">
                  <Col md={6} className="text-center">
                    <Link to={item.link}>
                      <Image 
                        src={item.img} 
                        fluid 
                        rounded 
                        className="shadow hover-zoom" 
                        style={{ cursor: 'pointer', transition: 'transform .3s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </Link>
                  </Col>
                  <Col md={6} className="text-white mt-3 mt-md-0">
                    <h3 className="display-6 fw-bold">{item.id}. {item.titulo}</h3>
                    <p className="lead">{item.desc}</p>
                    <small className="text-white-50">Haz clic en la imagen para más información</small>
                  </Col>
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>

          <Row className="mt-5 border-top pt-5">
            <Col className="text-center">
              <Image src={imagen} fluid rounded className="shadow" style={{ maxHeight: '400px', width: 'auto' }}/>
              <p className="display-6 fw-bold text-white mt-3">Únete a nuestra comunidad de viajeros confiables</p>
            </Col>
          </Row>
        </Container>

        {/* SECCIÓN PLANES - ACTUALIZADA A NEGRO Y BLANCO */}
        <section className="py-5 w-100">
          <Container>
            <Row className="text-center mb-4">
              <Col>
                <h2 className="mb-3 text-white">Planes para Todos</h2>
                <p className="text-white">Elige el plan que mejor se adapte a ti</p>
              </Col>
            </Row>
            <Row className="justify-content-center">
              {/* Tarjeta Pasajero */}
              <Col lg={4} className="mb-4">
                <Card className="h-100 shadow border-white" style={{ background: '#000000', color: '#ffffff', border: '1px solid #ffffff' }}>
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
              {/* Tarjeta Conductor Premium */}
              <Col lg={4} className="mb-4">
                <Card className="h-100 shadow border-white" style={{ background: '#000000', color: '#ffffff', border: '1px solid #ffffff' }}>
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

        {/* FOOTER Y SECCIÓN FINAL */}
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
    </div>
  );
}

export default HomeBase;