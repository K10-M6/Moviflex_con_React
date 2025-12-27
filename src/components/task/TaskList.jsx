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
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '10px',
        fontSize: '2rem'
      }}>📋 Lista de Tareas Asignadas</h2>
      <p style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '30px',
        fontSize: '1.1rem'
      }}>Selecciona una tarea para ver su componente</p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {tasks.map(task => (
          <div 
            key={task.id}
            style={{
              border: '1px solid #e1e5e9',
              borderRadius: '12px',
              padding: '25px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => onTaskClick(task.component)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            {/* Línea superior de color */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #007bff, #0056b3)'
            }}></div>
            
            {/* Header de la tarjeta */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <span style={{
                fontWeight: 'bold',
                color: '#007bff',
                fontSize: '14px',
                background: '#f8f9fa',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                {task.id}
              </span>
              <span 
                style={{
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  backgroundColor: getStatusColor(task.status)
                }}
              >
                {getStatusIcon(task.status)} {task.status}
              </span>
            </div>
            
            {/* Contenido de la tarjeta */}
            <h3 style={{
              margin: '15px 0 10px 0',
              color: '#333',
              fontSize: '18px',
              lineHeight: '1.3'
            }}>
              {task.icon} {task.type}
            </h3>
            
            <p style={{
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.5',
              marginBottom: '20px',
              minHeight: '40px'
            }}>
              {task.summary}
            </p>
            
            <p style={{
              color: '#888',
              fontSize: '13px',
              fontStyle: 'italic',
              marginBottom: '20px'
            }}>
              {task.description}
            </p>
            
            <button 
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              👁️ Ver Componente
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;