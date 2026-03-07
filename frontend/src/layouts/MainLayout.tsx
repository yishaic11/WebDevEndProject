import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, type SvgIconProps } from '@mui/material';
import { Home, AccountCircle, AddBox, ExitToApp } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import React, { cloneElement } from 'react';
import logo from '../assets/logo-icon.png';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await authApi.logout();

    logout();

    void navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/home' },
    { text: 'Create', icon: <AddBox />, path: '/create' },
    { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F0E4' }}>
      <Box
        sx={{
          width: '260px',
          bgcolor: 'white',
          borderRight: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <Box
          component='img'
          src={logo}
          alt='Logo'
          sx={{
            height: '20vh',
            maxWidth: '20vh',
            objectFit: 'contain',
          }}
          onClick={() => void navigate('/home')}
        />
        <List sx={{ px: 2, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => void navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  '&.Mui-selected': { bgcolor: '#44A194', color: 'white' },
                  '&.Mui-selected .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'rgba(68, 161, 148, 0.1)' },
                }}
              >
                <ListItemIcon sx={{ color: '#537D96', minWidth: 40 }}>
                  {cloneElement(item.icon as React.ReactElement<SvgIconProps>, { sx: { fontSize: 24 } })}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '3vh' } } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, mb: 2 }}>
          <ListItemButton onClick={() => void handleLogout()} sx={{ borderRadius: 3 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ExitToApp sx={{ color: '#EC8F8D' }} />
            </ListItemIcon>
            <ListItemText primary='Logout' slotProps={{ primary: { sx: { fontWeight: 600, color: '#EC8F8D' } } }} />
          </ListItemButton>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          ml: '20vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: '4vh',
          bgcolor: '#F4F0E4',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '160vh' }}>{children}</Box>
      </Box>
    </Box>
  );
};
