import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Typography, Paper, Box, Link, Alert, Stack, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { signupSchema, type SignupInput } from '../utils/validations';
import defaultProfileImg from '../assets/default-profile-image.png';
import { ImageUpload } from '../components/Common/ImageUpload';
import { useImageUpload } from '../hooks/useImageUpload';
import { authApi } from '../api/auth.api';
import { GoogleAuthButton } from '../components/Auth/GoogleAuthButton';

export const Signup = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const { preview, handleImageChange, removeImage } = useImageUpload(setValue, 'profileImage');

  const onSubmit = async (data: SignupInput): Promise<void> => {
    setErrorMsg(null);

    try {
      await authApi.register({ ...data });

      // TODO: Implement after backend user & auth implementation
    } catch {
      setErrorMsg('Username or email already taken.');
    }
  };

  return (
    <AuthLayout>
      <Paper
        sx={{
          borderRadius: '5vh',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '120vh',
          boxShadow: '0 2vh 10vh rgba(0,0,0,0.1)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          divider={<Divider orientation='vertical' flexItem sx={{ my: 2 }} />}
        >
          <Box sx={{ p: '4vh', flex: 1.2 }}>
            <Typography variant='h4' fontWeight='900' color='#44A194'>
              Sign Up
            </Typography>

            {errorMsg && (
              <Alert severity='error' sx={{ mb: 2, borderRadius: '2vh' }}>
                {errorMsg}
              </Alert>
            )}

            <Box component='form' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: '2vh' }}>
                <ImageUpload
                  preview={preview}
                  defaultImage={defaultProfileImg}
                  onImageChange={handleImageChange}
                  onRemove={removeImage}
                  error={errors.profileImage?.message}
                />
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label='Username'
                  {...register('username')}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
                <TextField
                  fullWidth
                  label='Email'
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <TextField
                  fullWidth
                  label='Password'
                  type='password'
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Stack>
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
                    mt: 2,
                    p: '1.2vh',
                    borderRadius: '2vh',
                    width: 'inherit',
                    bgcolor: '#44A194',
                    '&:hover': { bgcolor: '#388e83' },
                  }}
                >
                  {isSubmitting ? (
                    <Typography sx={{ marginX: 2, fontWeight: 800 }}>Creating...</Typography>
                  ) : (
                    <Typography sx={{ marginX: 2, fontWeight: 800 }}>Create Account</Typography>
                  )}
                </Button>
              </Box>

              <Typography variant='body2' sx={{ mt: 2, textAlign: 'center', color: '#537D96' }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to='/login'
                  sx={{ color: '#44A194', fontWeight: 800, textDecoration: 'none' }}
                >
                  Login
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
