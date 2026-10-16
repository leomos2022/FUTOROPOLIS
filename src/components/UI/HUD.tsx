import React from 'react';

const HUD: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      <h2 style={{ margin: 0, fontSize: '20px' }}>🌆 FUTURÓPOLIS</h2>
      <p style={{ margin: '5px 0', fontSize: '12px' }}>Ciudad Inteligente IoT</p>
    </div>
  );
};

export default HUD;
