// frontend/src/components/PatreonButton.jsx
import React from 'react';

export default function PatreonButton({ position = 'fixed' }) {
  const patreonUrl = "https://www.patreon.com/hakty933"; // ← Replace with your Patreon URL

  const fixedStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    backgroundColor: '#FF424D',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '25px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(255, 66, 77, 0.4)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none'
  };

  const inlineStyle = {
    backgroundColor: '#FF424D',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(255, 66, 77, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none'
  };

  const hoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(255, 66, 77, 0.5)'
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <a
      href={patreonUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...(position === 'fixed' ? fixedStyle : inlineStyle),
        ...(isHovered ? hoverStyle : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Patreon Logo SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 569 546"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="362.589996" cy="204.589996" r="204.589996" fill="white"/>
        <rect width="100" height="545.799988" fill="white"/>
      </svg>
      Support on Patreon
    </a>
  );
}