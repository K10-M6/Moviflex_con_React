import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import imagen from '../pages/Imagenes/Viajes.jpeg';
import { useState, useEffect } from 'react';

const BackgroundSlider = ({ images = [], interval = 3500, overlayColor = 'rgba(18,76,131,0.35)' }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const t = setInterval(() => {
      setTimeout(() => {
        setIndex(i => (i + 1) % images.length);
      }, 1000);
    }, interval);
    return () => {
      clearInterval(t);
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
              opacity: i === index ? 1 : 0,
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

function HomeBase() {
  const backgroundImages = [
    'https://turismo.encolombia.com/wp-content/uploads/2018/11/Consejos-Para-Viajar-Carro.png',
    'https://www.maquimas.pe/wp-content/uploads/2024/01/1.jpg',
    'https://cdn.buttercms.com/NYZzPM4kTIyVmfDwT3RK'
  ];
  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <BackgroundSlider images={backgroundImages} interval={3500} overlayColor={'rgba(18,76,131,0.35)'} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>

      <div style={{ background: '#124c83', width: '100%', position: 'relative', zIndex: 10 }}>
      <Navbar />
      </div>
      <section className="py-5 w-100">
      <Container>
      <Row className="align-items-center justify-content-center text-center">
      <Col lg={8} className="mb-4 mb-lg-0 mx-auto">
      <h1 className="display-4 fw-bold text-white mb-4">
      Conectamos personas. Optimizamos trayectos.
      </h1>
      <p className="my-4 lead text-white">
      MOVIFLEX es una solución integral de movilidad diseñada para ofrecer eficiencia, control y seguridad en cada viaje.
      </p>
      <div className="mt-4">
      <Button style={{background: '#000000', border: 'none'}} variant="primary"
       as={Link} to="/register" className="me-3">
      Comenzar Ahora
      </Button>
      </div>
      </Col>

      </Row>
      </Container>
      </section>

      <Container style={{background: '#124c8367',
      minHeight: '100vh'
      }} className="p-4 rounded shadow">
      <Row className="text-center mb-4 text-white">
        <Col>
        <h2 className="mb-3">¿Cómo Funciona?</h2>
        <p className="text-center text-white">Tres pasos simples para comenzar</p>
        </Col>
      </Row>
      <Row>
      <Col md={4} className="mb-4">
      <Card className="h-100">
      <Card.Body className="text-center p-4" style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      }}>
      <div className="display-4 fw-bold text-white mb-3">1</div>
      <Card.Title className="mb-3 text-white">Registrate</Card.Title>
      <Card.Text className="text-white">Crea tu cuenta como pasajero o conductor en segundos</Card.Text>
      </Card.Body>
      </Card>
      </Col>
      <Col md={4} className="mb-4">
      <Card className="h-100">
      <Card.Body className="text-center p-4" style={{
        background: 'linear-gradient(135deg, #93fbd3 0%, #50aa79 100%)'
      }}>
      <div className="display-4 fw-bold text-white mb-3">2</div>
      <Card.Title className="mb-3 text-white">Busca o Crea</Card.Title>
      <Card.Text className="text-white">Busca rutas disponibles o crea tu propia ruta fija</Card.Text>
      </Card.Body>
      </Card>
      </Col>
      <Col md={4} className="mb-4" >
      <Card className="h-100">
      <Card.Body className="text-center p-4" style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #9457f5 100%)'
      }}>
      <div className="display-4 fw-bold text-white mb-3">3</div>
      <Card.Title className="mb-3 text-white ">Viaja Seguro</Card.Title>
      <Card.Text className="text-white">Disfruta de viajes compartidos seguros y económicos</Card.Text>
      </Card.Body>
      </Card>
      </Col>
      </Row>
      <Row className="mt-5">
      <Col className="text-center">
      <Image src={imagen} fluid rounded className="shadow" style={{ maxHeight: '100hv', maxWidth: '100wv' }}/>
      <p className="display-6 fw-bold text-white">Únete a nuestra comunidad de viajeros confiables</p>
      </Col>
      </Row>
      </Container>
    

      <section className="py-5 w-100">
      <Container>
      <Row className="text-center mb-4">
      <Col>
      <h2 className="mb-3 text-white">Planes para Todos</h2>
      <p className="mb-4text-muted text-white">Elige el plan que mejor se adapte a ti</p>
      </Col>
      </Row>
      <Row className="justify-content-center">
      <Col lg={4} className="mb-4">
      <Card className="h-100 shadow">
      <Card.Body className="text-center p-4" style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      }}>
      <Card.Title className="mb-3 text-white">Pasajero</Card.Title>
      <div className="display-4 fw-bold mb-4 text-white">Gratis</div>
      <div className="text-start">
      <div className="mb-2 text-white">Buscar rutas</div>
      <div className="mb-2 text-white">Reservar asiento</div>
      <div className="mb-2 text-white">Calificar conductores</div>
      <div className="text-white">Historial de viajes</div>
      </div>
      </Card.Body>
      </Card>
      </Col>
      <Col lg={4} className="mb-4">
      <Card className="h-100 shadow">
      <Card.Body className="text-center p-4" style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #9457f5 100%)'
      }}>
      <Card.Title className="mb-3 text-white">Conductor Premium</Card.Title>
      <div className="display-4 fw-bold mb-4 text-white">$4.99/mes</div>
      <Button variant="outline-dark" className="w-100 mb-4">
      Elegir Plan
      </Button>
      <div className="text-start">
      <div className="mb-2 text-white">Crear rutas</div>
      <div className="mb-2 text-white">Aceptar pasajeros</div>
      <div className="mb-2 text-white">Estadísticas de viajes</div>
      <div className="mb-2 text-white">Prioridad en soporte</div>
      <div className="text-white">Sin comisión extra</div>
      </div>
      </Card.Body>
      </Card>
      </Col>
      </Row>
      </Container>
      </section>

      <section className="py-5 bg-dark text-white w-100">
      <Container className="text-center">
      <h2 className="mb-4">¿Listo para Ahorrar en Tus Viajes?</h2>
      <p className="mb-4">Únete a miles de viajeros que ya confían en MoviFlexx</p>
      <Button as={Link} to="/register" variant="light" className="me-3">
      Registrarse Ahora
      </Button>
      <Button variant="outline-light">
      Contactar Soporte
      </Button>
      </Container>
      </section>

      <footer className="py-5 bg-dark text-white w-100">
      <Container>
      <Row>
      <Col className="text-center">
      <p>Conectando viajeros de forma segura y económica.</p>
      <p>&copy; 2025 MoviFlexx.</p>
      </Col>
      </Row>
      </Container>
      </footer>
      </div>
    </div>
    );
}

export default HomeBase;