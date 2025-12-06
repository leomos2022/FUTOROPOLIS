import React from 'react';

const EducationalPanel: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '300px',
      fontFamily: 'Arial',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>📚 Panel Educativo</h3>
      <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
        Click en los sensores verdes para conocer más sobre el Internet de las Cosas en ciudades inteligentes.
      </p>
    </div>
  );
};

export default EducationalPanel;
