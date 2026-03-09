import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileSchema, type EditProfileInput } from '../../utils/validations';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ImageUpload } from '../Common/ImageUpload';

interface Props {
  open: boolean;
  onClose: () => void;
  currentUsername: string;
  currentImage: string;
  onSave: (data: { username: string; file?: File; previewUrl?: string }) => void | Promise<void>;
}

export const EditProfileModal = ({ open, onClose, currentUsername, currentImage, onSave }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    values: { username: currentUsername },
  });
  const { preview, setPreview, handleImageChange, removeImage } = useImageUpload(setValue, 'profileImage');

  const handleClose = () => {
    setPreview(null);
    reset();
    onClose();
  };

  const onSubmit = (data: EditProfileInput) => {
    void onSave({
      username: data.username,
      file: data.profileImage,
      previewUrl: preview || undefined,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
      <DialogTitle sx={{ fontWeight: 800, color: '#537D96' }}>Edit Profile</DialogTitle>

      <Box component='form' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <ImageUpload
              preview={preview}
              defaultImage={currentImage}
              onImageChange={handleImageChange}
              onRemove={removeImage}
              error={errors.profileImage?.message}
            />

            <TextField
              fullWidth
              label='Username'
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              margin='normal'
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} sx={{ color: '#537D96', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            sx={{ bgcolor: '#44A194' }}
            disabled={!!errors.username || !!errors.profileImage}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
