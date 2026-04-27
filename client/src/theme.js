import { createTheme, alpha } from '@mui/material/styles';

const primary = {
  main: '#1e3a5f',      // deep navy
  light: '#3b5a85',
  dark: '#0f1f36',
  contrastText: '#ffffff',
};

const secondary = {
  main: '#c89b3c',      // warm classic gold/amber
  light: '#e0b85a',
  dark: '#9a7424',
  contrastText: '#1a1a1a',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary,
    secondary,
    background: {
      default: '#f6f4ef',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2238',
      secondary: '#5a6478',
    },
    divider: alpha('#1e3a5f', 0.08),
    success: { main: '#2e7d4f' },
    warning: { main: '#c77700' },
    error:   { main: '#b3261e' },
    info:    { main: '#3b5a85' },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, letterSpacing: '-0.015em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.005em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    subtitle1: { fontWeight: 500 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(${alpha(primary.main, 0.05)} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundAttachment: 'fixed',
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          background: alpha(primary.main, 0.25),
          borderRadius: 8,
        },
        '*::-webkit-scrollbar-thumb:hover': { background: alpha(primary.main, 0.45) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          paddingBlock: 9,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${primary.main} 0%, ${primary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${primary.dark} 0%, ${primary.main} 100%)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha(primary.main, 0.08)}`,
          boxShadow: '0 1px 2px rgba(15,31,54,0.04), 0 4px 12px rgba(15,31,54,0.04)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'transparent', elevation: 0 },
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(160%) blur(8px)',
          borderBottom: `1px solid ${alpha(primary.main, 0.08)}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true, size: 'medium' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12, borderRadius: 8, paddingInline: 10, paddingBlock: 6 },
      },
    },
  },
});

export default theme;
