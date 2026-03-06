import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#44A194',
      contrastText: '#fff',
    },
    secondary: {
      main: '#537D96',
    },
    error: {
      main: '#EC8F8D',
    },
    background: {
      default: '#F4F0E4',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
