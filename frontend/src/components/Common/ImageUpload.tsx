import { type ChangeEvent } from 'react';
import { Box, Avatar, IconButton, Badge, Typography, Tooltip } from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';

interface ImageUploadProps {
  preview: string | null;
  defaultImage: string;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  error?: string;
}

export const ImageUpload = ({ preview, defaultImage, onImageChange, onRemove, error }: ImageUploadProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <input
        accept='image/*'
        id='avatar-upload-input'
        type='file'
        style={{ display: 'none' }}
        onChange={onImageChange}
      />

      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <label htmlFor='avatar-upload-input'>
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title='Change Photo' placement='top'>
                <IconButton
                  color='primary'
                  component='span'
                  sx={{
                    bgcolor: 'white',
                    boxShadow: 3,
                    width: 32,
                    height: 32,
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            }
          >
            <Avatar
              src={preview || defaultImage}
              sx={{
                width: 90,
                height: 90,
                cursor: 'pointer',
                boxShadow: (theme) => theme.shadows[2],
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.9 },
              }}
            />
          </Badge>
        </label>

        {preview && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              transform: 'translate(-10%, 10%)',
              zIndex: 2,
            }}
          >
            <Tooltip title='Remove Photo' placement='top'>
              <IconButton
                size='small'
                onClick={(e) => {
                  e.preventDefault();
                  onRemove();
                }}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  boxShadow: 3,
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: 'error.dark',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {error && (
        <Typography variant='caption' color='error' sx={{ fontWeight: 500, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
