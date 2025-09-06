// Utility functions for color manipulation

export const convertHslToHsla = (hslColor, opacity = 1) => {
  if (!hslColor || typeof hslColor !== 'string') {
    return `hsla(0, 0%, 0%, ${opacity})`;
  }
  
  // Check if it's already hsla
  if (hslColor.includes('hsla')) {
    return hslColor;
  }
  
  // Convert hsl to hsla
  if (hslColor.includes('hsl(')) {
    return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
  }
  
  // Fallback for other formats
  return `hsla(0, 0%, 0%, ${opacity})`;
};

export const generateUniqueId = () => {
  return `id-${Math.random().toString(36).substr(2, 9)}`;
};

export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Basic HTML entity encoding
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};