import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#f8f5f2',
      paper: '#fff',
    },
    primary: {
      main: '#2E7D32', // Consistent green
      contrastText: '#fff',
    },
    secondary: {
      main: '#8D6748', // Brown accent
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#C62828',
    },
    warning: {
      main: '#D9B382',
    },
    info: {
      main: '#1976d2',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#6D4C41',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Poppins, Roboto, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(46,125,50,0.08)', // custom shadow for cards/dialogs
    ...Array(23).fill('0px 2px 8px rgba(46,125,50,0.08)')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0px 2px 8px rgba(46,125,50,0.08)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 4px 16px rgba(46,125,50,0.16)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2E7D32',
          color: '#fff',
        },
        containedSecondary: {
          backgroundColor: '#8D6748',
          color: '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(46,125,50,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 8px rgba(46,125,50,0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 4px 24px rgba(46,125,50,0.16)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme; 