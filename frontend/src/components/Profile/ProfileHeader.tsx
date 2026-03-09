import { Box, Avatar, Typography, Button, Paper } from '@mui/material';
import { Edit } from '@mui/icons-material';

interface ProfileHeaderProps {
  username: string;
  email: string;
  avatarUrl?: string;
  onEdit: () => void;
}

export const ProfileHeader = ({ username, email, avatarUrl, onEdit }: ProfileHeaderProps) => {
  return (
    <Paper sx={{ p: 4, borderRadius: 2, bgcolor: 'white', mb: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      <Avatar
        src={avatarUrl}
        sx={{
          width: { xs: 60, sm: 80, md: 100 },
          height: { xs: 60, sm: 80, md: 100 },
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h4' fontWeight='800' sx={{ color: '#44A194' }}>
          {username}
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          {email}
        </Typography>
      </Box>

      <Button
        variant='outlined'
        startIcon={<Edit />}
        onClick={onEdit}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: '#44A194', color: '#44A194' }}
      >
        Edit Profile
      </Button>
    </Paper>
  );
};
