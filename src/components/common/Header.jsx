import React from 'react';

const Header = ({ title, subtitle, showBackButton, onBackClick }) => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px 20px',
      marginBottom: '30px'
    }}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        {showBackButton && (
          <button 
            onClick={onBackClick}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            ← Volver
          </button>
        )}
        <h1 style={{margin: '0', fontSize: '2.5rem'}}>{title}</h1>
        {subtitle && <p style={{margin: '10px 0 0 0', opacity: '0.9'}}>{subtitle}</p>}
      </div>
    </header>
  );
};

export default Header;