import React, { useState, useRef, useEffect } from 'react';
import './InternalChat.css';

const InternalChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Ana García',
      text: 'Hola equipo, ¿alguien tiene actualizaciones sobre el proyecto de viajes a Barcelona?',
      timestamp: '2024-02-10 09:30',
      isEncrypted: true
    },
    {
      id: 2,
      user: 'Carlos López',
      text: 'Sí, acabo de terminar la integración con la API de mapas. Está lista para testing.',
      timestamp: '2024-02-10 09:32',
      isEncrypted: true
    },
    {
      id: 3,
      user: 'Tú',
      text: 'Excelente! Yo estoy trabajando en el módulo de reservas. Espero terminarlo hoy.',
      timestamp: '2024-02-10 09:35',
      isEncrypted: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [activeUsers] = useState([
    { id: 1, name: 'Ana García', role: 'Project Manager', status: 'online' },
    { id: 2, name: 'Carlos López', role: 'Backend Developer', status: 'online' },
    { id: 3, name: 'María Torres', role: 'Designer', status: 'away' },
    { id: 4, name: 'Pedro Sánchez', role: 'QA Tester', status: 'offline' }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'Tú',
        text: newMessage,
        timestamp: new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isEncrypted: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#28a745';
      case 'away': return '#ffc107';
      case 'offline': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="internal-chat">
      <div className="chat-header">
        <h2>🔒 Chat Interno Cifrado</h2>
        <div className="encryption-status">
          <span className="encryption-badge">🔐 Cifrado de Extremo a Extremo</span>
          <span className="security-info">Todas las mensajes están protegidos</span>
        </div>
      </div>

      <div className="chat-container">
        {/* Lista de usuarios */}
        <div className="users-sidebar">
          <h3>Miembros del Equipo</h3>
          <div className="users-list">
            {activeUsers.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">
                  <span className="user-initial">{user.name.charAt(0)}</span>
                  <span 
                    className="user-status"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  ></span>
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="messages-area">
          <div className="messages-container">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.user === 'Tú' ? 'own-message' : 'other-message'}`}
              >
                <div className="message-header">
                  <span className="message-user">{message.user}</span>
                  <span className="message-time">{message.timestamp}</span>
                  {message.isEncrypted && (
                    <span className="encryption-indicator">🔒</span>
                  )}
                </div>
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <form onSubmit={handleSendMessage} className="message-input-form">
            <div className="input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje seguro..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                <span className="send-icon">➤</span>
              </button>
            </div>
            <div className="security-notice">
              <small>🔒 Este mensaje será cifrado antes de enviarse</small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternalChat;