// src/components/tasks/TaskList.jsx
import React from 'react';

const TaskList = ({ tasks, onTaskClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Por hacer': return '#ff6b6b';
      case 'En progreso': return '#4ecdc4';
      case 'Completado': return '#1a936f';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Por hacer': return '⏳';
      case 'En progreso': return '🔄';
      case 'Completado': return '✅';
      default: return '📝';
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '25px',
        marginTop: '20px'
      }}>
        {tasks.map(task => (
          <div 
            key={task.id}
            className="glass-card"
            style={{
              padding: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => onTaskClick(task.component)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            }}
          >
            {/* Header de la tarjeta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '15px',
                padding: '12px',
                color: 'white',
                minWidth: '70px',
                textAlign: 'center'
              }}>
                {task.icon}
              </div>
              <div style={{flex: 1}}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <h3 style={{
                    margin: '0',
                    color: '#2c3e50',
                    fontSize: '1.4rem',
                    fontWeight: '700'
                  }}>
                    {task.type}
                  </h3>
                  <span 
                    style={{
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: getStatusColor(task.status)
                    }}
                  >
                    {getStatusIcon(task.status)} {task.status}
                  </span>
                </div>
                <span style={{
                  color: '#667eea',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'rgba(102, 126, 234, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  {task.id}
                </span>
              </div>
            </div>
            
            {/* Descripción */}
            <p style={{
              color: '#7f8c8d',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '25px'
            }}>
              {task.summary}
            </p>
            
            {/* Botón de acción */}
            <button 
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '14px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              {task.status === 'Completado' ? '✅ Ver Módulo' : '👁️ Ver Componente'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;