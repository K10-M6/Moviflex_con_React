import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import Mapa from '../Map';
import Navbar from '../components/Navbar';
import imagen from '../pages/Imagenes/Viajes.jpeg';

function HomeBase() {
  return (
    <div style={{
        background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
        minHeight: '100vh',
        minWidth: '100vw'}}>
      <Navbar/>
      <section className="py-5" >
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold">
                <span className="text-dark">Viaja</span>{' '}
                <span 
                  style={{background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >Compartido
                </span>
                <span style={{background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}>Con</span>{' '}
                <span className="text-dark">Confianza</span>
              </h1>
              <p className="my-4">
                La plataforma comunitaria donde conductores comparten rutas fijas 
                y pasajeros encuentran viajes seguros y económicos.
              </p>
              <div className="mt-4">
                <Button style={{background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)'}}
                 as={Link} to="/register" className="me-3">
                  Comenzar Ahora
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <Card>
                <Card.Body style={{minHeight: "50hv", minWidth: "50vw"}}>
                  <Mapa/>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container style={{background: 'linear-gradient(20deg, #00a2ffff, #00dfccff)',
          minHeight: '100vh',
          minWidth: '100vw'
        }} className="p-4 rounded shadow">
          <Row className="text-center mb-4">
            <Col>
              <h2 className="mb-3">¿Cómo Funciona?</h2>
              <p className="text-muted">Tres pasos simples para comenzar</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center p-4">
                  <div className="display-4 fw-bold text-dark mb-3">1</div>
                  <Card.Title className="mb-3">Registrate</Card.Title>
                  <Card.Text>Crea tu cuenta como pasajero o conductor en segundos</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center p-4">
                  <div className="display-4 fw-bold text-dark mb-3">2</div>
                  <Card.Title className="mb-3">Busca o Crea</Card.Title>
                  <Card.Text>Busca rutas disponibles o crea tu propia ruta fija</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center p-4">
                  <div className="display-4 fw-bold text-dark mb-3">3</div>
                  <Card.Title className="mb-3">Viaja Seguro</Card.Title>
                  <Card.Text>Disfruta de viajes compartidos seguros y económicos</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col className="text-center">
              <Image src={imagen} fluid rounded className="shadow"style={{ maxHeight: '800px', width: '1200px' }}/>
              <p className="display-6 fw-bold text-white">Únete a nuestra comunidad de viajeros confiables</p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="mb-3">Planes para Todos</h2>
              <p className="text-muted">Elige el plan que mejor se adapte a ti</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={4} className="mb-4">
              <Card className="h-100 shadow border-3">
                <Card.Body className="text-center p-4">
                  <Card.Title className="mb-3">Pasajero</Card.Title>
                  <div className="display-4 fw-bold mb-4">Gratis</div>
                  <div className="text-start">
                    <div className="mb-2">
                      Buscar rutas
                    </div>
                    <div className="mb-2">
                      Reservar asiento
                    </div>
                    <div className="mb-2">
                      Calificar conductores
                    </div>
                    <div>
                      Historial de viajes
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 shadow border-3">
                <Card.Body className="text-center p-4">
                  <Card.Title className="mb-3">Conductor Premium</Card.Title>
                  <div className="display-4 fw-bold mb-4">$4.99/mes</div>
                  <Button variant="outline-dark" className="w-100 mb-4">
                    Elegir Plan
                  </Button>
                  <div className="text-start">
                    <div className="mb-2">
                      Crear rutas
                    </div>
                    <div className="mb-2">
                      Aceptar pasajeros
                    </div>
                    <div className="mb-2">
                      Estadísticas de viajes
                    </div>
                    <div className="mb-2">
                      Prioridad en soporte
                    </div>
                    <div>
                      Sin comisión extra
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-dark text-white">
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

      <footer className="py-5 bg-dark text-white">
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
  );
}

export default HomeBase;