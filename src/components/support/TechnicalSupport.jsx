import React, { useState } from 'react';
import './TechnicalSupport.css';

const TechnicalSupport = () => {
  const [activeTab, setActiveTab] = useState('new-ticket');
  const [tickets, setTickets] = useState([
    {
      id: 'TK-001',
      subject: 'Problema con reserva de viaje',
      status: 'abierto',
      priority: 'alta',
      createdAt: '2024-02-01',
      lastUpdate: '2024-02-01'
    },
    {
      id: 'TK-002',
      subject: 'Error en pago',
      status: 'en progreso',
      priority: 'media',
      createdAt: '2024-01-28',
      lastUpdate: '2024-02-01'
    },
    {
      id: 'TK-003',
      subject: 'Consulta sobre documentación',
      status: 'resuelto',
      priority: 'baja',
      createdAt: '2024-01-25',
      lastUpdate: '2024-01-30'
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'media',
    description: ''
  });

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    const ticket = {
      id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: newTicket.subject,
      status: 'abierto',
      priority: newTicket.priority,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: '', category: '', priority: 'media', description: '' });
    alert('Ticket creado exitosamente. Nos contactaremos pronto.');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#dc3545';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return '#007bff';
      case 'en progreso': return '#ffc107';
      case 'resuelto': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="technical-support">
      <div className="support-header">
        <h2>🛠️ Soporte Técnico</h2>
        <div className="support-stats">
          <div className="stat">
            <span className="number">{tickets.length}</span>
            <span className="label">Total Tickets</span>
          </div>
          <div className="stat">
            <span className="number">{tickets.filter(t => t.status === 'abierto').length}</span>
            <span className="label">Abiertos</span>
          </div>
        </div>
      </div>

      <div className="support-tabs">
        <button 
          className={`tab ${activeTab === 'new-ticket' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-ticket')}
        >
          Nuevo Ticket
        </button>
        <button 
          className={`tab ${activeTab === 'my-tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-tickets')}
        >
          Mis Tickets ({tickets.length})
        </button>
        <button 
          className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contacto Directo
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'new-ticket' && (
          <form onSubmit={handleSubmitTicket} className="ticket-form">
            <h3>Crear Nuevo Ticket de Soporte</h3>
            
            <div className="form-group">
              <label>Asunto *</label>
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                placeholder="Describe brevemente el problema"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="reservas">Reservas y Pagos</option>
                  <option value="technical">Problemas Técnicos</option>
                  <option value="documents">Documentación</option>
                  <option value="billing">Facturación</option>
                  <option value="other">Otros</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prioridad *</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  required
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción Detallada *</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Describe el problema en detalle..."
                rows="6"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Enviar Ticket
            </button>
          </form>
        )}

        {activeTab === 'my-tickets' && (
          <div className="tickets-list">
            <h3>Historial de Tickets</h3>
            {tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <span className="ticket-id">{ticket.id}</span>
                  <div className="ticket-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
                
                <h4 className="ticket-subject">{ticket.subject}</h4>
                
                <div className="ticket-dates">
                  <span>Creado: {ticket.createdAt}</span>
                  <span>Última actualización: {ticket.lastUpdate}</span>
                </div>
                
                <button className="view-ticket-btn">
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="contact-direct">
            <h3>📞 Contacto Directo</h3>
            <div className="contact-methods">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h4>Teléfono</h4>
                <p>+1 (555) 123-4567</p>
                <p>Lun-Vie: 9:00 - 18:00</p>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">💬</div>
                <h4>Chat en Vivo</h4>
                <p>Disponible 24/7</p>
                <button className="chat-now-btn">Iniciar Chat</button>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">✉️</div>
                <h4>Email</h4>
                <p>soporte@viajesapp.com</p>
                <p>Respuesta en 24h</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalSupport;