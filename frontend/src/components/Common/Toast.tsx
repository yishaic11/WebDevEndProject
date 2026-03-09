import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

export const Toast = ({ open, message, severity = 'success', onClose }: ToastProps) => {
  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;

    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant='filled'
        sx={{
          width: '100%',
          bgcolor: severity === 'success' ? '#44A194' : '#EC8F8D',
          color: 'white',
          fontWeight: 600,
          fontSize: '2.5vh',
          borderRadius: 2,
          boxShadow: '0vh 0.8vh 2.4vh rgba(0,0,0,0.12)',
          '& .MuiAlert-icon': { color: 'white' },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
