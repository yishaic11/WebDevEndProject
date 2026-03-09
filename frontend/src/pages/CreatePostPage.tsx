import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  type AlertColor,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Close, AutoAwesome } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type CreatePostInput } from '../utils/validations';
import { useImageUpload } from '../hooks/useImageUpload';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Common/Toast';
import { postsApi } from '../api/posts.api';
import { aiApi } from '../api/ai.api';

export const CreatePostPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as AlertColor });

  const {
    setValue,
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
  });

  const navigate = useNavigate();
  const captionValue = watch('caption', '');
  const postImageValue = watch('postImage');
  const { preview, handleImageChange, removeImage } = useImageUpload(setValue, 'postImage');

  const nextStep = async () => {
    const isImageValid = await trigger('postImage');
    if (isImageValid && step === 1) setStep(2);
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
  };

  const handleGenerateDescription = async () => {
    if (!postImageValue) return;

    setAiLoading(true);

    try {
      const description = await aiApi.generateDescription(postImageValue);

      setValue('caption', description, { shouldValidate: true });
      setToast({ open: true, message: 'Caption generated!', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to generate caption. Try again.', severity: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data: CreatePostInput) => {
    try {
      setLoading(true);

      await postsApi.create({ content: data.caption, photo: data.postImage });
      setToast({ open: true, message: 'Post shared successfully!', severity: 'success' });
      setTimeout(() => void navigate('/home'), 1000);
    } catch {
      setToast({ open: true, message: 'Failed to create post. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant='h4' fontWeight='800' sx={{ color: '#44A194', mb: '3vh' }}>
        Create New Post
      </Typography>

      <Paper
        sx={{
          p: '5vh',
          borderRadius: '5vh',
          bgcolor: 'white',
          boxShadow: '0 1vh 4vh rgba(0,0,0,0.04)',
          width: '100%',
          minHeight: '75vh',
        }}
      >
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          {step === 1 && (
            <Box>
              <Typography
                variant='h4'
                sx={{
                  fontSize: 'clamp(1.5rem, 5vh, 3.5rem)',
                  fontWeight: 900,
                  color: '#537D96',
                  mb: '3vh',
                }}
              >
                Step 1: Upload Photo
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  height: '45vh',
                  bgcolor: '#fcfcfc',
                  borderRadius: '3vh',
                  border: errors.postImage ? '0.3vh dashed #EC8F8D' : '0.3vh dashed #44A194',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {preview ? (
                  <>
                    <img src={preview} alt='Preview' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <IconButton
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: '2vh',
                        right: '2vh',
                        bgcolor: 'rgba(236, 143, 141, 0.9)',
                        color: 'white',
                        '&:hover': { bgcolor: '#EC8F8D', transform: 'scale(1.1)' },
                      }}
                    >
                      <Close sx={{ fontSize: '2.5vh' }} />
                    </IconButton>
                  </>
                ) : (
                  <label
                    htmlFor='post-image-upload'
                    style={{
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <input accept='image/*' id='post-image-upload' type='file' hidden onChange={handleImageChange} />
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUpload
                        sx={{
                          width: { xs: 20, sm: 60, md: 100 },
                          height: { xs: 20, sm: 60, md: 100 },
                          color: '#44A194',
                          mb: '1.5vh',
                          opacity: 0.8,
                        }}
                      />
                      <Typography
                        sx={{ fontSize: { xs: '1vh', sm: '2vh', md: '3vh' }, fontWeight: 700, color: '#537D96' }}
                      >
                        Click to upload photo
                      </Typography>
                    </Box>
                  </label>
                )}
              </Box>

              {errors.postImage && (
                <Typography color='error' sx={{ mt: 2, mb: -1, textAlign: 'center', fontWeight: 700 }}>
                  {errors.postImage.message}
                </Typography>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  onClick={() => void nextStep()}
                  disabled={!preview || !!errors.postImage}
                  sx={{
                    bgcolor: '#44A194',
                    px: '6vh',
                    py: '1.4vh',
                    borderRadius: '2vh',
                    textTransform: 'none',
                    fontWeight: 800,
                    '&:hover': { bgcolor: '#388e83' },
                    '&:disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#9e9e9e',
                    },
                  }}
                >
                  Next Step
                </Button>
              </Box>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography
                variant='h4'
                sx={{
                  fontSize: 'clamp(1.5rem, 5vh, 3.5rem)',
                  fontWeight: 900,
                  color: '#537D96',
                  mb: '3vh',
                }}
              >
                Step 2: Add Caption
              </Typography>

              <Box
                sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}
              >
                <Box
                  sx={{
                    width: { xs: '100%', md: '35vh' },
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '35vh',
                      borderRadius: '4vh',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={preview!}
                      alt='Preview'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        border: '0.3vh dashed #44A194',
                        borderRadius: '4vh',
                      }}
                    />
                  </Box>

                  <Button
                    variant='outlined'
                    onClick={() => void handleGenerateDescription()}
                    disabled={aiLoading || !postImageValue}
                    startIcon={aiLoading ? <CircularProgress size='1.8vh' /> : <AutoAwesome />}
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '2vh',
                      py: '1.2vh',
                      fontSize: '2.2vh',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: '#44A194',
                      color: '#44A194',
                      '&:hover': { bgcolor: 'rgba(68,161,148,0.08)', borderColor: '#388e83' },
                    }}
                  >
                    {aiLoading ? 'Generating…' : 'Generate Caption with AI'}
                  </Button>
                </Box>

                <Box sx={{ flexGrow: 1, width: '100%' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    placeholder='Write something interesting...'
                    {...register('caption')}
                    helperText={errors.caption ? errors.caption.message : `${captionValue.length}/500`}
                    slotProps={{
                      htmlInput: { maxLength: 500 },
                      formHelperText: {
                        sx: { textAlign: 'right', fontWeight: 700, color: 'gray' },
                      },
                    }}
                    error={!!errors.caption}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '3vh', bgcolor: '#fcfcfc' },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 1, mb: -1, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={prevStep}
                  sx={{
                    color: '#537D96',
                    fontWeight: 700,
                    px: '6vh',
                    py: '1.4vh',
                    borderRadius: '2vh',
                  }}
                >
                  Back
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={loading || !!errors.caption}
                  sx={{
                    bgcolor: '#44A194',
                    px: '6vh',
                    py: '1.4vh',
                    borderRadius: '2vh',
                    textTransform: 'none',
                    fontWeight: 800,
                    boxShadow: '0 1vh 2vh rgba(68, 161, 148, 0.3)',
                    '&:hover': { bgcolor: '#388e83' },
                  }}
                >
                  {loading ? <CircularProgress size='3vh' color='inherit' /> : 'Share Post'}
                </Button>
              </Box>
            </Box>
          )}
        </form>
      </Paper>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
};
