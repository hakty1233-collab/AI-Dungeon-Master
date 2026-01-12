// frontend/src/styles/theme.js

/**
 * Unified Dark Fantasy Theme
 */

export const theme = {
  colors: {
    primary: '#ffd700',        // Gold
    secondary: '#d32f2f',      // Dark Red
    success: '#4CAF50',        // Green
    warning: '#ff9800',        // Orange
    danger: '#f44336',         // Red
    info: '#2196F3',           // Blue
    
    bg: {
      primary: '#0a0a0a',      // Almost black
      secondary: '#1a1a1a',    // Dark grey
      tertiary: '#2a2a2a',     // Medium grey
      hover: '#333333',        // Hover state
    },
    
    text: {
      primary: '#eee',         // Light grey
      secondary: '#aaa',       // Medium grey
      tertiary: '#888',        // Dark grey
      disabled: '#666',        // Very dark grey
    },
    
    border: {
      default: '#444',
      active: '#ffd700',
      danger: '#d32f2f',
    }
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.3)',
    md: '0 4px 16px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.5)',
    glow: '0 0 20px rgba(255,215,0,0.4)',
    glowRed: '0 0 20px rgba(211,47,47,0.4)',
  },
  
  borderRadius: {
    sm: '5px',
    md: '8px',
    lg: '12px',
    xl: '15px',
  },
  
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '20px',
    xl: '30px',
  }
};

// Button styles
export const buttonStyles = {
  base: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  
  primary: {
    backgroundColor: theme.colors.primary,
    color: '#000',
    boxShadow: theme.shadows.glow,
  },
  
  secondary: {
    backgroundColor: theme.colors.secondary,
    color: 'white',
    boxShadow: theme.shadows.glowRed,
  },
  
  success: {
    backgroundColor: theme.colors.success,
    color: 'white',
  },
  
  danger: {
    backgroundColor: theme.colors.danger,
    color: 'white',
  },
  
  info: {
    backgroundColor: theme.colors.info,
    color: 'white',
  },
  
  ghost: {
    backgroundColor: theme.colors.bg.tertiary,
    color: theme.colors.text.primary,
    border: `2px solid ${theme.colors.border.default}`,
  },
  
  disabled: {
    backgroundColor: theme.colors.bg.tertiary,
    color: theme.colors.text.disabled,
    cursor: 'not-allowed',
    opacity: 0.5,
    boxShadow: 'none',
  }
};

// Card styles
export const cardStyles = {
  base: {
    backgroundColor: theme.colors.bg.secondary,
    border: `2px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  
  elevated: {
    backgroundColor: theme.colors.bg.secondary,
    border: `2px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.md,
  },
  
  active: {
    backgroundColor: theme.colors.bg.secondary,
    border: `3px solid ${theme.colors.border.active}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.glow,
  }
};

// Input styles
export const inputStyles = {
  base: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: theme.colors.bg.tertiary,
    color: theme.colors.text.primary,
    border: `2px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  
  focus: {
    borderColor: theme.colors.primary,
  }
};

// Helper to merge styles
export function mergeStyles(...styles) {
  return Object.assign({}, ...styles);
}