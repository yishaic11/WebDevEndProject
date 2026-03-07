import { Button, Box } from '@mui/material';
import { API_URL } from '../../config/env';

export const GoogleAuthButton = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
      }}
    >
      <Button
        fullWidth
        variant='outlined'
        href={`${API_URL}/auth/google`}
        startIcon={
          <Box
            component='img'
            src='https://www.svgrepo.com/show/475656/google-color.svg'
            alt='Google'
            sx={{ width: 22, height: 22, mr: '2vh' }}
          />
        }
        sx={{
          borderRadius: '2vh',
          width: '100%',
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderWidth: 2,
          '&:hover': { borderWidth: 2 },
        }}
      >
        Continue with Google
      </Button>
    </Box>
  );
};
