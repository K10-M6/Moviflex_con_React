import React, { useState } from 'react';
import './notifications.css';

const TicketNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'ticket_updated',
      title: 'Ticket TK-001 actualizado',
      message: 'El ticket "Problema con reserva" ha sido actualizado por el equipo de soporte',
      timestamp: '2024-02-10 11:30',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'ticket_assigned',
      title: 'Nuevo ticket asignado',
      message: 'Se te ha asignado el ticket TK-045: "Error en proceso de pago"',
      timestamp: '2024-02-10 10:15',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'ticket_resolved',
      title: 'Ticket resuelto',
      message: 'El ticket TK-003: "Consulta documentación" ha sido marcado como resuelto',
      timestamp: '2024-02-09 16:45',
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'deadline_approaching',
      title: 'Fecha límite próxima',
      message: 'El ticket TK-002 vence en 2 días. Por favor, revisa los avances',
      timestamp: '2024-02-09 14:20',
      read: true,
      priority: 'high'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundAlerts: false,
    workingHoursOnly: true,
    highPriorityOnly: false
  });

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const updateSetting = (settingKey, value) => {
    setSettings({ ...settings, [settingKey]: value });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ticket_updated': return '📝';
      case 'ticket_assigned': return '👤';
      case 'ticket_resolved': return '✅';
      case 'deadline_approaching': return '⏰';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="ticket-notifications">
      <div className="notifications-header">
        <h2>🔔 Notificaciones de Tickets</h2>
        <div className="notifications-actions">
          <span className="unread-count">{unreadCount} sin leer</span>
          <button className="mark-all-read" onClick={markAllAsRead}>
            Marcar todo como leído
          </button>
        </div>
      </div>

      <div className="notifications-container">
        <div className="notifications-list">
          <h3>Notificaciones Recientes</h3>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
                {getPriorityIcon(notification.priority)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <span className="notification-time">{notification.timestamp}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    className="action-btn"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Marcar leído
                  </button>
                )}
                <button 
                  className="action-btn delete"
                  onClick={() => deleteNotification(notification.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="notifications-settings">
          <h3>Configuración de Notificaciones</h3>
          <div className="settings-list">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                  />
                  <span className="setting-text">
                    {key === 'emailNotifications' && 'Notificaciones por Email'}
                    {key === 'pushNotifications' && 'Notificaciones Push'}
                    {key === 'soundAlerts' && 'Alertas de Sonido'}
                    {key === 'workingHoursOnly' && 'Solo en horario laboral'}
                    {key === 'highPriorityOnly' && 'Solo notificaciones importantes'}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="notification-preview">
            <h4>Vista Previa</h4>
            <div className="preview-item">
              <span className="preview-icon">🔔</span>
              <div className="preview-content">
                <p>Nueva notificación de ticket</p>
                <small>Así se verán tus notificaciones</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketNotifications;