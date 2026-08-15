import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

const darkPalette = (server) => ({
  mode: 'dark',
  background: {
    default: '#080B12',
    paper: 'rgba(12,18,32,0.88)',
  },
  text: {
    primary: '#E6EBF8',
    secondary: '#A2B2D2',
  },
  divider: 'rgba(255,255,255,0.12)',
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || '#5D9BFF',
    light: '#8BB8FF',
    dark: '#2C70DD',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || '#6EE7FF',
    contrastText: '#0F172A',
  },
  neutral: {
    main: grey[400],
  },
  geometry: {
    main: '#64C8FF',
  },
  alwaysDark: {
    main: '#0A0F1E',
  },
});

const lightPalette = (server) => ({
  mode: 'light',
  background: {
    default: '#EEF2FA',
    paper: 'rgba(255,255,255,0.85)',
  },
  text: {
    primary: '#0D1526',
    secondary: '#4A5A7A',
  },
  divider: 'rgba(0,0,0,0.10)',
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || '#2C6FE0',
    light: '#5D9BFF',
    dark: '#1A4FAD',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || '#0EA5C9',
    contrastText: '#FFFFFF',
  },
  neutral: {
    main: grey[600],
  },
  geometry: {
    main: '#0EA5C9',
  },
  alwaysDark: {
    main: '#0A0F1E',
  },
});

export default (server, darkMode) => (darkMode ? darkPalette(server) : lightPalette(server));
