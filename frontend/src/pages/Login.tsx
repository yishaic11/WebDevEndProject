import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { loginSchema, type LoginInput } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';
import { GoogleAuthButton } from '../components/Auth/GoogleAuthButton';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const oauthError = searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) return <Navigate to='/home' replace />;

  const onSubmit = async (data: LoginInput): Promise<void> => {
    setErrorMsg(null);

    try {
      await authApi.login(data);

      // TODO: Implement after backend user & auth implementation
    } catch {
      setErrorMsg('Invalid username or password.');
    }
  };

  return (
    <AuthLayout>
      <Paper sx={{ borderRadius: '5vh', overflow: 'hidden', boxShadow: '0 2vh 10vh rgba(0,0,0,0.1)' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          divider={<Divider orientation='vertical' flexItem sx={{ my: 2 }} />}
        >
          <Box sx={{ p: '4vh', flex: 1.2 }}>
            <Typography variant='h4' fontWeight='900' color='#44A194'>
              Sign In
            </Typography>
            {oauthError && (
              <Alert severity='error' sx={{ mb: 2 }}>
                Google login failed.
              </Alert>
            )}
            {errorMsg && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Box component='form' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
              <TextField
                fullWidth
                label='Username'
                margin='normal'
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
              <TextField
                fullWidth
                label='Password'
                type={showPassword ? 'text' : 'password'}
                margin='normal'
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button
                  fullWidth
                  type='submit'
                  variant='contained'
                  disabled={isSubmitting}
                  sx={{
                    mt: 1,
                    p: '1.2vh',
                    borderRadius: '2vh',
                    width: 'inherit',
                    bgcolor: '#44A194',
                    '&:hover': { bgcolor: '#388e83' },
                  }}
                >
                  {isSubmitting ? (
                    <Typography sx={{ marginX: 2, fontWeight: 800 }}>Signing in...</Typography>
                  ) : (
                    <Typography sx={{ marginX: 2, fontWeight: 800 }}>Sign In</Typography>
                  )}
                </Button>
              </Box>

              <Typography variant='body2' sx={{ mt: 2, textAlign: 'center' }}>
                New here?{' '}
                <Link component={RouterLink} to='/signup' sx={{ color: '#44A194', fontWeight: 700 }}>
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 0.8, bgcolor: 'rgba(68, 161, 148, 0.03)' }}>
            <GoogleAuthButton />
          </Box>
        </Stack>
      </Paper>
    </AuthLayout>
  );
};
