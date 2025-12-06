import React from 'react';

const SensorPanel: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      background: 'rgba(0,50,0,0.9)',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      zIndex: 1000,
      border: '2px solid #00ff00'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>📡 Sensores IoT Activos</h4>
      <div style={{ fontSize: '12px' }}>
        <div>🚦 Tráfico: ACTIVO</div>
        <div>🌡️ Temperatura: 22°C</div>
        <div>💡 Iluminación: 95%</div>
        <div>🗑️ Residuos: 45%</div>
      </div>
    </div>
  );
};

export default SensorPanel;
