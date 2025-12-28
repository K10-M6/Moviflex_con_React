import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import NavbarAdmin from './NavAdmin';
import UsuariosImg from "../Imagenes/Usuarios.jpg";
import VehiculosImg from "../Imagenes/vehiculo.png";
import ConductoresImg from "../Imagenes/conductores.png"
import Viajes from "../Imagenes/viajes.png";
import Documentacion from "../Imagenes/Document.png";

function Dashboard() {
  const navigate = useNavigate();

  const handleUsersClick = () => {
    navigate('/admin/usuarios');
  };

  const handleDriversClick = () => {
    navigate('/admin/conductores');
  };

  const handleVehiclesClick = () => {
    navigate('/admin/vehiculos');
  };

  const handleTravelsClick = () => {
    navigate('/admin/viajes');
  };

  const handleDocumentsClick = () => {
    navigate('/admin/documentacion');
  }

  return (
    <div style={{
        background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
        minHeight: '100%',
        minWidth: '100%'}}>  
        <NavbarAdmin />
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center display-5 fw-bold mb-3">Panel de Administración</h1>
            <p className="text-center text-muted">Este es el contenido exclusivo para administradores</p>
          </Col>
        </Row>

        <Row className="g-4 justify-content-center" style={{cursor: 'pointer'}}>

          <Col lg={3} md={6} className="mb-4">
            <Card className="h-100 shadow-sm" onClick={handleUsersClick} style={{cursor: 'pointer'}}>
              <Card.Body className="text-center p-4">
                <img src={UsuariosImg} alt="Usuarios" className="img-fluid mb-3" style={{maxHeight: '100px'}} />
                <Card.Title className="mb-3">Usuarios Registrados</Card.Title>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="h-100 shadow-sm" onClick={handleDriversClick} style={{cursor: 'pointer'}}>
              <Card.Body className="text-center p-4">
                <img src={ConductoresImg} alt="Conductores" className="img-fluid mb-3" style={{maxHeight: '100px'}} />
                <Card.Title className="mb-3">Conductores Registrados</Card.Title>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="h-100 shadow-sm" onClick={handleVehiclesClick} style={{cursor: 'pointer'}}>
              <Card.Body className="text-center p-4">
                <img src={VehiculosImg} alt="Vehículos" className="img-fluid mb-3" style={{maxHeight: '100px'}} />
                <Card.Title className="mb-3">Vehículos Registrados</Card.Title>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="h-100 shadow-sm" onClick={handleTravelsClick} style={{cursor: 'pointer'}}>
              <Card.Body className="text-center p-4">
                <img src={Viajes} alt="Viajes" className="img-fluid mb-3" style={{maxHeight: '400px'}} />
                <Card.Title className="mb-3">Viajes Realizados</Card.Title>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="h-100 shadow-sm" onClick={handleDocumentsClick} style={{cursor: 'pointer'}}>
              <Card.Body className="text-center p-4">
                <img src={Documentacion} alt="Documentos" className="img-fluid mb-3" style={{maxHeight: '400px'}} />
                <Card.Title className="mb-3">Documentos</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;