import React, { useState } from 'react';
import './notifications.css';

const ConversationTracker = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      title: 'Planificación Viaje Barcelona',
      participants: ['Ana García', 'Carlos López', 'Tú'],
      lastMessage: '¿Qué tal si coordinamos para el próximo viernes?',
      lastActivity: '2024-02-10 10:30',
      unread: 2,
      status: 'active'
    },
    {
      id: 2,
      title: 'Reunión Cliente Viajes Corp',
      participants: ['María Torres', 'Tú'],
      lastMessage: 'El cliente aprobó el presupuesto',
      lastActivity: '2024-02-09 16:45',
      unread: 0,
      status: 'active'
    },
    {
      id: 3,
      title: 'Problemas Integración API',
      participants: ['Equipo Desarrollo', 'Tú'],
      lastMessage: 'Issue resuelto en la versión 2.1',
      lastActivity: '2024-02-08 14:20',
      unread: 0,
      status: 'resolved'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'unread') return conv.unread > 0;
    return conv.status === filter;
  });

  const markAsRead = (conversationId) => {
    setConversations(conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unread: 0 } : conv
    ));
  };

  return (
    <div className="conversation-tracker">
      <div className="tracker-header">
        <h2>💬 Seguimiento de Conversaciones</h2>
        <div className="conversation-stats">
          <span className="stat">
            {conversations.length} conversaciones
          </span>
          <span className="stat">
            {conversations.reduce((sum, conv) => sum + conv.unread, 0)} sin leer
          </span>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button 
          className={`tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Sin Leer
        </button>
        <button 
          className={`tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Activas
        </button>
        <button 
          className={`tab ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resueltas
        </button>
      </div>

      <div className="conversations-list">
        {filteredConversations.map(conversation => (
          <div key={conversation.id} className="conversation-card">
            <div className="conversation-header">
              <h4 className="conversation-title">{conversation.title}</h4>
              <div className="conversation-meta">
                <span className="activity-time">{conversation.lastActivity}</span>
                {conversation.unread > 0 && (
                  <span className="unread-badge">{conversation.unread}</span>
                )}
              </div>
            </div>

            <div className="participants">
              <strong>Participantes: </strong>
              {conversation.participants.join(', ')}
            </div>

            <div className="last-message">
              {conversation.lastMessage}
            </div>

            <div className="conversation-actions">
              <button 
                className="action-btn primary"
                onClick={() => markAsRead(conversation.id)}
              >
                {conversation.unread > 0 ? 'Marcar como leído' : 'Abrir conversación'}
              </button>
              <span className={`status ${conversation.status}`}>
                {conversation.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationTracker;