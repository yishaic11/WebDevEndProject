import { Box } from '@mui/material';
import logo from '../assets/logo-icon.png';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F4F0E4 0%, #DCE7E5 100%)',
      overflow: 'hidden',
      position: 'relative',
      p: 2,
    }}
  >
    <Box
      component='img'
      src={logo}
      alt='Logo'
      sx={{
        position: 'absolute',
        top: '1.5vh',
        left: '1.5vh',
        height: '18vh',
        maxWidth: '18vh',
      }}
    />

    <Box sx={{ width: '100%', maxWidth: '120vh', position: 'relative', zIndex: 1 }}>{children}</Box>
  </Box>
);
