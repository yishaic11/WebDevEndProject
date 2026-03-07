import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const OAuthCallbackPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const _id = params.get('_id');
    const username = params.get('username');
    const email = params.get('email') ?? undefined;
    const photoUrl = params.get('photoUrl') ?? undefined;

    if (accessToken && refreshToken && _id && username) {
      login({ id: _id, username, email, photoUrl }, accessToken, refreshToken);

      void navigate('/home', { replace: true });
    } else {
      void navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [login, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress size={48} />
      <Typography sx={{ mt: 2 }}>Signing you in…</Typography>
    </Box>
  );
};
