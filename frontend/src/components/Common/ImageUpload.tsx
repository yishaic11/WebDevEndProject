import { type ChangeEvent } from 'react';
import { Box, Avatar, IconButton, Badge } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <input
        accept='image/*'
        id='avatar-upload-input'
        type='file'
        style={{ display: 'none' }}
        onChange={onImageChange}
      />

      <Box sx={{ position: 'relative' }}>
        <label htmlFor='avatar-upload-input'>
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                color='primary'
                component='span'
                sx={{
                  bgcolor: 'white',
                  boxShadow: 2,
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <PhotoCamera sx={{ fontSize: 18 }} />
              </IconButton>
            }
          >
            <Avatar
              src={preview || defaultImage}
              sx={{
                width: 90,
                height: 90,
                cursor: 'pointer',
                boxShadow: '0vh 0.4vh 1vh rgba(0,0,0,0.1)',
              }}
            />
          </Badge>
        </label>

        {preview && (
          <IconButton
            size='small'
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            sx={{
              position: 'absolute',
              top: '11.5vh',
              right: '10.2vh',
              bgcolor: 'error.main',
              color: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: 'error.dark' },
              width: 30,
              height: 30,
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {error && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>{error}</Box>}
    </Box>
  );
};
