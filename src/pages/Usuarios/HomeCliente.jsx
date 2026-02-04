import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Container,
  Navbar, Button, 
  Badge, Card, ListGroup, 
  Offcanvas, Dropdown, 
  Spinner, OverlayTrigger, Tooltip,
  Alert
} from "react-bootstrap";
import { 
  Bell, PersonCircle, 
  GeoAlt, Calendar, Clock,
  CurrencyDollar, CheckCircle,
  XCircle, ClockHistory,
  ChevronDown, X, Map,
  PlusCircle, ArrowRight,
  ChatDots, GeoAltFill,
  ChevronLeft,
  ChevronRight
} from "react-bootstrap-icons";
import Mapa from "/WorksSENA/Moviflexx with React/moviflexx/src/Map";

function HomeCliente() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  
  const API_BASE_URL = "https://backendmovi-production.up.railway.app/api";


  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const userResponse = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
    
        }
      });
      
      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.");
        }
        throw new Error(`Error ${userResponse.status}: ${userResponse.statusText}`);
      }
      
      const userData = await userResponse.json();
      setUserData(userData);
      
      const tripsResponse = await fetch(`${API_BASE_URL}/user/trips?limit=5`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!tripsResponse.ok) {
        throw new Error(`Error al cargar viajes: ${tripsResponse.statusText}`);
      }
      
      const tripsData = await tripsResponse.json();
      
      if (!Array.isArray(tripsData)) {
        throw new Error("La respuesta de viajes no es válida");
      }
      
      setTrips(tripsData);
      
  
      const notificationsResponse = await fetch(`${API_BASE_URL}/user/notifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!notificationsResponse.ok) {
        throw new Error(`Error al cargar notificaciones: ${notificationsResponse.statusText}`);
      }
      
      const notificationsData = await notificationsResponse.json();
      
      if (!Array.isArray(notificationsData)) {
        throw new Error("La respuesta de notificaciones no es válida");
      }
      
      setNotifications(notificationsData);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(error.message);
      
      setUserData({
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan@ejemplo.com",
      });
      
      setTrips([
        {
          id: 1,
          created_at: new Date().toISOString(),
          status: 'completed',
          start_address: "Calle Falsa 123",
          end_address: "Avenida Siempre Viva 456",
          final_fare: 15.50
        },
        {
          id: 2,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'in_progress',
          start_address: "Centro Comercial",
          end_address: "Aeropuerto",
          estimated_fare: 25.00
        }
      ]);
      
      setNotifications([
        {
          id: 1,
          type: 'trip',
          message: 'Tu viaje ha sido confirmado',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const rateTrip = async (tripId, rating, comment = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${tripId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"

        },
        body: JSON.stringify({
          rating: rating,
          comment: comment
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al calificar: ${response.statusText}`);
      }
      
      fetchUserData();
      
    } catch (error) {
      console.error("Error al calificar viaje:", error);
      setError("Error al calificar el viaje");
    }
  };
  const cancelTrip = async (tripId) => {
    if (!window.confirm("¿Estás seguro de cancelar este viaje?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${tripId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"

        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cancelar: ${response.statusText}`);
      }

      fetchUserData();
      
    } catch (error) {
      console.error("Error al cancelar viaje:", error);
      setError("Error al cancelar el viaje");
    }
  };


  const requestNewTrip = async (tripData) => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`${API_BASE_URL}/trips/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"

        },
        body: JSON.stringify(tripData)
      });
      
      if (!response.ok) {
        throw new Error(`Error al solicitar viaje: ${response.statusText}`);
      }
      
      const newTrip = await response.json();
      

      window.location.href = `/trip/${newTrip.id}`;
      
    } catch (error) {
      console.error("Error al solicitar viaje:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"

        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
      }
      
      const stats = await response.json();
      return stats;
      
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchUserData();
    
    const intervalId = setInterval(() => {
      fetchUserData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return 'Ahora';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'in_progress': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="text-success me-2" size={20} />;
      case 'cancelled': return <XCircle className="text-danger me-2" size={20} />;
      case 'in_progress': return <ClockHistory className="text-warning me-2" size={20} />;
      default: return <Clock className="text-secondary me-2" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'in_progress': return 'En curso';
      default: return 'Pendiente';
    }
  };

  const logout = () => {
    console.log("Cerrar sesión");
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 fs-5">Cargando tu información...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ paddingTop: '56px' }}>
      {error && (
        <Alert variant="danger" className="m-3" onClose={() => setError("")} dismissible>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      <Navbar bg="white" expand="lg" fixed="top" className="border-bottom shadow-sm py-2">
        <Container fluid className="px-3">
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
            <span style={{
              background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              MoviFlexx
            </span>
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-3">
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-sidebar">{sidebarCollapsed ? "Expandir panel" : "Colapsar panel"}</Tooltip>}
            >
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="rounded-circle"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </Button>
            </OverlayTrigger>

            <div className="position-relative">
              <Button 
                variant="outline-primary" 
                className="rounded-circle position-relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="light" 
                className="d-flex align-items-center gap-2 border-0 bg-transparent"
              >
                <img 
                  src={userData?.profile_picture || "https://"} 
                  alt="Perfil" 
                  className="rounded-circle border"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <div className="d-none d-md-block text-start">
                  <div className="small fw-bold">{userData?.first_name || "Usuario"}</div>
                  <div className="small text-muted">Cliente</div>
                </div>
                <ChevronDown size={14} />
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-lg border-0" style={{ minWidth: '250px' }}>
                <div className="px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src={userData?.profile_picture || "https://"} 
                      alt="Perfil" 
                      className="rounded-circle me-3"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{userData?.first_name} {userData?.last_name}</h6>
                      <small className="text-muted">{userData?.email}</small>
                    </div>
                  </div>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/profile" className="py-2">
                  <PersonCircle className="me-2" /> Mi Perfil
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/trips" className="py-2">
                  <GeoAlt className="me-2" /> Mis Viajes
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/favorites" className="py-2">
                  <Calendar className="me-2" /> Favoritos
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout} className="py-2 text-danger">
                  <X className="me-2" /> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>

      <Offcanvas
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="d-flex align-items-center gap-2">
            <Bell /> Notificaciones
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <Bell size={48} className="text-muted mb-3" />
              <p className="text-muted">No tienes notificaciones</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((notification) => (
                <ListGroup.Item 
                  key={notification.id} 
                  className="py-3 border-bottom"
                  onClick={() => markNotificationAsRead(notification.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex">
                    <div className="me-3">
                      {notification.type === 'trip' ? (
                        <GeoAlt className="text-primary" size={24} />
                      ) : notification.type === 'message' ? (
                        <ChatDots className="text-info" size={24} />
                      ) : (
                        <CurrencyDollar className="text-success" size={24} />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">{timeAgo(notification.created_at)}</small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <div className="flex-grow-1 position-relative">
        <div 
          className="position-absolute top-0 left-0 w-100 h-100"
          style={{ 
            zIndex: 1,
            backgroundColor: '#f8f9fa'
          }}
        >
          <div className="w-100 h-100">
            <Mapa />
          </div>
        </div>
        
        <div 
          className="position-absolute bottom-0 start-50 translate-middle-x mb-4" 
          style={{ 
            zIndex: 1000,
            width: 'auto'
          }}
        >
          <Button 
            as={Link}
            to="/request-trip"
            variant="primary" 
            size="lg"
            className="rounded-pill px-4 py-3 shadow-lg d-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
              border: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <PlusCircle size={24} />
            <span className="fw-bold">SOLICITAR VIAJE</span>
          </Button>
        </div>

        {!sidebarCollapsed && (
          <div 
            className="position-absolute end-0 top-0 h-100 shadow-lg"
            style={{ 
              width: '320px', 
              zIndex: 1000,
              backgroundColor: 'white',
              overflowY: 'auto',
              marginTop: '0'
            }}
          >
            <Card className="h-100 border-0 rounded-0">
              <Card.Header className="bg-white border-bottom py-3 sticky-top">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold d-flex align-items-center">
                    <Clock className="me-2" />
                    Viajes Recientes
                  </h5>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="primary" pill>
                      {trips.length}
                    </Badge>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      className="rounded-circle p-1"
                      onClick={() => setSidebarCollapsed(true)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="overflow-auto p-0">
                {trips.length === 0 ? (
                  <div className="text-center py-5">
                    <Map size={48} className="text-muted mb-3" />
                    <p className="text-muted">Aún no has realizado viajes</p>
                    <Button 
                      as={Link}
                      to="/request-trip"
                      variant="outline-primary"
                      size="sm"
                    >
                      Solicitar primer viaje
                    </Button>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {trips.map((trip) => (
                      <ListGroup.Item key={trip.id} className="border-bottom py-3 px-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            {getStatusIcon(trip.status)}
                            <small className="text-muted">
                              {formatDate(trip.created_at)}
                            </small>
                          </div>
                          <Badge bg={getStatusBadge(trip.status)} pill>
                            {getStatusText(trip.status)}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="bg-primary rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                              <GeoAltFill size={12} className="text-white" />
                            </div>
                            <small className="text-truncate">{trip.start_address}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="bg-success rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                              <GeoAltFill size={12} className="text-white" />
                            </div>
                            <small className="text-truncate">{trip.end_address}</small>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <CurrencyDollar className="text-success me-1" size={20} />
                            <h6 className="mb-0 fw-bold text-success">
                              ${trip.final_fare || trip.estimated_fare}
                            </h6>
                          </div>
                          <Button 
                            as={Link}
                            to={`/trip/${trip.id}`}
                            variant="outline-primary" 
                            size="sm"
                            className="d-flex align-items-center gap-1"
                          >
                            Detalles
                            <ArrowRight size={14} />
                          </Button>
                        </div>
        
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
              
              {trips.length > 0 && (
                <Card.Footer className="bg-white border-top py-3">
                  <Button 
                    as={Link}
                    to="/trips"
                    variant="outline-primary" 
                    className="w-100 d-flex justify-content-center align-items-center gap-2"
                  >
                    <GeoAlt />
                    Ver todos los viajes
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeCliente;