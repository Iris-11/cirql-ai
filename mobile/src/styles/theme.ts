/**
 * CIRQL Design System: Theme Tokens
 * 
 * Centralized constants for branding and design elements that 
 * cannot be easily handled by Tailwind (e.g., Lucide icon colors, 
 * React Navigation screen options).
 */

export const THEME = {
  colors: {
    primary: '#1F6F54',      // Heritage Green
    primary_muted: '#1F6F544D',
    background: '#faf9f6',   // Linen White
    cream: '#f5f2e9',        // Warm Cream
    'secondary-fixed': '#b1f0ce', // Sustainability Mint
    secondary_fixed: '#b1f0ce', 
    white: '#ffffff',
    black: '#000000',
    error: '#B00020',
  },
  spacing: {
    tabBarHeight: 68,
    tabBarHeightIos: 88,
  },
  animation: {
    standard_delay: 1500,
  }
};

export const COLORS = THEME.colors;
