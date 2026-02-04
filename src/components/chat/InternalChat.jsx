import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';

const UserChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Juan Pérez', text: 'Hola, ¿a qué hora pasas por mi ubicación?', timestamp: '10:30 AM', isSender: false },
    { id: 2, user: 'Tú', text: 'Estoy llegando en 5 minutos, ya casi llego', timestamp: '10:32 AM', isSender: true },
    { id: 3, user: 'Juan Pérez', text: 'Perfecto, te espero en la entrada principal', timestamp: '10:33 AM', isSender: false },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'Tú',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(20deg, #b425e0ff, #00dfccff, #ecececff)', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow border-0" style={{ height: '90vh' }}>
              <Card.Header className="py-3" style={{ 
                background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
                borderBottom: 'none'
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
                         style={{ width: '40px', height: '40px' }}>
                      JP
                    </div>
                    <div>
                      <Card.Title as="h5" className="text-white mb-0">Juan Pérez</Card.Title>
                      <small className="text-white-50">Conductor · Toyota Corolla</small>
                    </div>
                  </div>
                  <div>
                    <Badge bg="success" className="me-2">● En línea</Badge>
                    <Badge bg="light" text="dark">🔒</Badge>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="p-0 d-flex flex-column">
                <div className="flex-grow-1 p-3 overflow-auto" style={{ minHeight: '0' }}>
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`mb-3 ${message.isSender ? 'text-end' : ''}`}
                    >
                      <div 
                        className="d-inline-block p-3 rounded"
                        style={{
                          maxWidth: '80%', // COMO EN TU ORIGINAL
                          background: message.isSender 
                            ? 'linear-gradient(20deg, #6f42c1, #00a2ffff)' 
                            : '#f8f9fa',
                          border: message.isSender ? 'none' : '1px solid #dee2e6',
                          color: message.isSender ? 'white' : 'inherit',
                          // LAS 4 PROPIEDADES CLAVE DE TU ORIGINAL:
                          wordBreak: 'break-word',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '100%', // IMPORTANTE: dentro del inline-block
                        }}
                      >
                        {!message.isSender && (
                          <div className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                            {message.user}
                          </div>
                        )}
                        
                        {/* ¡ESTA ES LA CLAVE! - Usar un <p> tag como en tu original */}
                        <p className="mb-1" style={{ 
                          margin: 0,
                          wordBreak: 'break-word',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%',
                          overflow: 'hidden'
                        }}>
                          {message.text}
                        </p>
                        
                        <div className="text-end mt-2">
                          <small style={{ 
                            color: message.isSender ? 'rgba(255,255,255,0.7)' : '#6c757d',
                            fontSize: '0.75rem',
                            opacity: '0.8'
                          }}>
                            {message.timestamp}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-top p-3 bg-white">
                  <Form onSubmit={handleSendMessage}>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="border-end-0"
                      />
                      <Button 
                        type="submit"
                        style={{ 
                          background: 'linear-gradient(20deg, #6f42c1, #00a2ffff)',
                          border: 'none'
                        }}
                        className="px-4"
                      >
                        Enviar
                      </Button>
                    </div>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserChat;