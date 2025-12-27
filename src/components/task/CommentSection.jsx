import React, { useState } from 'react';
import './CommentSection.css';

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      text: 'Iniciando desarrollo del componente...',
      author: 'Desarrollador',
      date: '2024-02-10 09:00',
      type: 'system'
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'Usuario Actual',
        date: new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: 'user'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h4>💬 Comentarios ({comments.length})</h4>
        <span className="task-reference">Tarea: {taskId}</span>
      </div>
      
      <div className="comment-input-container">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu comentario... (Enter para enviar)"
          rows="3"
          className="comment-textarea"
        />
        <button 
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="add-comment-btn"
        >
          Enviar
        </button>
      </div>
      
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className={`comment ${comment.type}`}>
            <div className="comment-header">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-date">{comment.date}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
            {comment.type === 'system' && (
              <span className="system-badge">Sistema</span>
            )}
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="no-comments">
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;