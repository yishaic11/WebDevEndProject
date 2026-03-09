import { Box, Button, Typography } from '@mui/material';
import { HistoryEdu as NoPostsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const UserPosts = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: '2vh' }}>
      <Typography variant='h4' sx={{ fontWeight: 900, color: '#537D96', mb: '3vh' }}>
        My Posts
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: '10vh',
          textAlign: 'center',
        }}
      >
        <NoPostsIcon sx={{ fontSize: '15vh', color: '#537D96', mb: 2, opacity: 0.3 }} />
        <Typography variant='h5' sx={{ fontWeight: 800, color: '#537D96', mb: 1 }}>
          No posts yet
        </Typography>
        <Button
          variant='contained'
          onClick={() => void navigate('/create')}
          sx={{
            bgcolor: '#44A194',
            borderRadius: '2vh',
            px: 5,
            py: 1.2,
            fontWeight: 800,
            textTransform: 'none',
            boxShadow: '0 0.5vh 1.5vh rgba(68, 161, 148, 0.2)',
            '&:hover': { bgcolor: '#388e83' },
          }}
        >
          Create Your First Post
        </Button>
      </Box>
    </Box>
  );
};
