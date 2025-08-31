import React from 'react';

export const Test: React.FC = () => {
  return (
    <div style={{ padding: '20px', color: 'black', background: 'white' }}>
      <h1>CryptoSense Dashboard Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};