import { useState } from 'react';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { EditProfileModal } from '../components/Profile/EditProfileModal';
import defaultImg from '../assets/default-profile-image.png';
import { Toast } from '../components/Common/Toast';
import type { AlertColor } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { usersApi } from '../api/users.api';
import { UserPosts } from '../components/Profile/UserPosts';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as AlertColor });

  const handleSave = async (newData: { username: string; previewUrl?: string; file?: File }) => {
    if (!user) return;

    try {
      const updated = await usersApi.update(user.id, {
        username: newData.username,
        photo: newData.file,
      });

      updateUser({
        ...user,
        username: updated.username,
        photoUrl: updated.photoUrl,
      });

      setToast({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to update profile. Please try again.', severity: 'error' });
    }
  };

  return (
    <>
      <ProfileHeader
        username={user?.username ?? ''}
        email={user?.email ?? ''}
        avatarUrl={user?.photoUrl ?? defaultImg}
        onEdit={() => setOpen(true)}
      />

      <UserPosts />

      <EditProfileModal
        open={open}
        onClose={() => setOpen(false)}
        currentUsername={user?.username ?? ''}
        currentImage={user?.photoUrl ?? defaultImg}
        onSave={handleSave}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};
