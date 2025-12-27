import React, { useState } from 'react';
import CommentSection from './CommentSection';
import './TaskCard.css';

const TaskCard = ({ task, onTaskClick }) => {
  const [showComments, setShowComments] = useState(false);

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
    <div className="task-card">
      <div className="task-header">
        <div className="task-id-container">
          <span className="task-id">{task.id}</span>
          <span 
            className="task-status"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {getStatusIcon(task.status)} {task.status}
          </span>
        </div>
      </div>
      
      <h3 className="task-type">{task.icon} {task.type}</h3>
      <p className="task-summary">{task.summary}</p>
      
      <div className="task-actions">
        <button 
          className="view-component-btn"
          onClick={() => onTaskClick(task.component)}
        >
          👁️ Ver Componente
        </button>
        
        <button 
          className="comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {showComments ? 'Ocultar' : 'Añadir'} comentarios
        </button>
      </div>
      
      {showComments && <CommentSection taskId={task.id} />}
    </div>
  );
};

export default TaskCard;