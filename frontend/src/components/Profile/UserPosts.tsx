import { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CloudUpload, Close, HistoryEdu as NoPostsIcon, EditOutlined, DeleteOutline } from '@mui/icons-material';
import { PostCard } from '../../components/Posts/PostCard';
import type { Post } from '../../types/post.types';
import { postSchema } from '../../utils/validations';
import { postsApi } from '../../api/posts.api';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

const RENDERED_POSTS_COUNT_CHUNK_SIZE = 15;

export const UserPosts = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editCaption, setEditCaption] = useState('');
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ caption?: string; postImage?: string }>({});
  const [renderedPostsCount, setRenderedPostsCount] = useState(RENDERED_POSTS_COUNT_CHUNK_SIZE);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMyPosts = async () => {
      setLoading(true);

      try {
        const apiPosts = await postsApi.getBySender(user.id);

        const mapped: Post[] = apiPosts.map((post) => ({
          id: post._id,
          senderId: post.senderId,
          username: user.username,
          userImage: user.photoUrl,
          postImage: post.photoUrl ?? '',
          caption: post.content,
          likedBy: post.likes,
          commentsCount: 0,
        }));
        setMyPosts(mapped.reverse());
        setRenderedPostsCount(RENDERED_POSTS_COUNT_CHUNK_SIZE);
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    void fetchMyPosts();
  }, [user, location.key]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderedPostsCount((currentRenderedPostsCount) =>
            Math.min(currentRenderedPostsCount + RENDERED_POSTS_COUNT_CHUNK_SIZE, myPosts.length),
          );
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [myPosts.length]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, post: Post) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
    setEditCaption(post.caption);
    setEditPreview(post.postImage);
    setEditFile(null);
    setFormErrors({});
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const result = postSchema.shape.postImage.safeParse(file);

    if (!result.success) {
      setFormErrors((prev) => ({
        ...prev,
        postImage: result.error.issues[0]?.message || 'Invalid image',
      }));
      return;
    }

    setEditFile(file);
    setFormErrors((prev) => ({ ...prev, postImage: undefined }));
    const reader = new FileReader();
    reader.onload = (event) => setEditPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleEditSave = async () => {
    if (!selectedPost) return;

    const captionResult = postSchema.shape.caption.safeParse(editCaption);

    if (!captionResult.success) {
      setFormErrors((prev) => ({
        ...prev,
        caption: captionResult.error.issues[0]?.message || 'Invalid caption',
      }));
      return;
    }

    if (!editPreview) {
      setFormErrors((prev) => ({ ...prev, postImage: 'An image is required' }));
      return;
    }

    try {
      const updated = await postsApi.update(selectedPost.id, {
        content: editCaption,
        photo: editFile ?? undefined,
      });

      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id ? { ...p, caption: updated.content, postImage: updated.photoUrl ?? p.postImage } : p,
        ),
      );
      setIsEditOpen(false);
      handleMenuClose();
    } catch {
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;

    try {
      await postsApi.delete(selectedPost.id);

      setMyPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
      setIsDeleteOpen(false);
      handleMenuClose();
    } catch {
    }
  };

  const visiblePosts = myPosts.slice(0, renderedPostsCount);
  const hasPostsLeftToRender = renderedPostsCount < myPosts.length;

  return (
    <Box sx={{ py: '2vh' }}>
      <Typography variant='h4' sx={{ fontWeight: 900, color: '#537D96', mb: '3vh', fontSize: '4vh' }}>
        My Posts
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress sx={{ color: '#44A194' }} size={56} />
        </Box>
      ) : initialLoadDone && myPosts.length === 0 ? (
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
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: '3vh',
          }}
        >
          {visiblePosts.map((post) => (
            <Box key={post.id} sx={{ position: 'relative' }}>
              <PostCard {...post} />
              <IconButton
                onClick={(e) => handleMenuOpen(e, post)}
                sx={{
                  position: 'absolute',
                  top: '1.5vh',
                  right: '1.5vh',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  zIndex: 2,
                  '&:hover': { bgcolor: 'white' },
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))}

          {hasPostsLeftToRender && (
            <Box
              ref={observerTarget}
              sx={{
                gridColumn: '1 / -1',
                height: '20px',
                margin: '20px 0',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress sx={{ color: '#44A194' }} size={42} />
            </Box>
          )}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{ paper: { sx: { borderRadius: '1.5vh' } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            setIsEditOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditOutlined fontSize='small' />
          </ListItemIcon>
          <ListItemText>Edit Post</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsDeleteOpen(true);
            handleMenuClose();
          }}
          sx={{ color: '#EC8F8D' }}
        >
          <ListItemIcon>
            <DeleteOutline fontSize='small' sx={{ color: '#EC8F8D' }} />
          </ListItemIcon>
          <ListItemText>Delete Post</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        fullWidth
        maxWidth='md'
        slotProps={{
          paper: {
            sx: {
              borderRadius: '5vh',
              bgcolor: '#FDFCF0',
              backgroundImage: 'none',
              p: '2vh',
              boxShadow: '0 2vh 6vh rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#537D96', textAlign: 'center', fontSize: '3.5vh', pb: 1 }}>
          Edit Post
        </DialogTitle>

        <Box sx={{ px: '1vh', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              width: '100%',
              height: '32vh',
              bgcolor: '#fcfcfc',
              borderRadius: '3vh',
              border: formErrors.postImage ? '0.3vh dashed #EC8F8D' : '0.3vh dashed #44A194',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {editPreview ? (
              <>
                <img src={editPreview} alt='Preview' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <IconButton
                  onClick={() => {
                    setEditPreview(null);
                    setEditFile(null);
                    setFormErrors((p) => ({ ...p, postImage: undefined }));
                  }}
                  sx={{
                    position: 'absolute',
                    top: '2vh',
                    right: '2vh',
                    bgcolor: 'rgba(236, 143, 141, 0.9)',
                    color: 'white',
                  }}
                >
                  <Close sx={{ fontSize: '2.5vh' }} />
                </IconButton>
              </>
            ) : (
              <label
                htmlFor='edit-image-upload'
                style={{
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <input accept='image/*' id='edit-image-upload' type='file' hidden onChange={handleImageChange} />
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUpload
                    sx={{
                      fontSize: '10vh',
                      color: formErrors.postImage ? '#EC8F8D' : '#44A194',
                      mb: '1vh',
                      opacity: 0.8,
                    }}
                  />
                  <Typography sx={{ fontSize: '2.5vh', fontWeight: 700, color: '#537D96' }}>Upload Image</Typography>
                </Box>
              </label>
            )}
          </Box>

          {formErrors.postImage && (
            <Typography color='error' sx={{ textAlign: 'center', fontWeight: 700, mt: -0.5, fontSize: '2vh' }}>
              {formErrors.postImage}
            </Typography>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label='Caption'
            value={editCaption}
            onChange={(e) => {
              setEditCaption(e.target.value);
              setFormErrors((prev) => ({ ...prev, caption: undefined }));
            }}
            error={!!formErrors.caption}
            helperText={formErrors.caption || `${editCaption.length}/500`}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '3vh', bgcolor: 'white' },
              '& .MuiFormHelperText-root': { fontWeight: 700, textAlign: 'right' },
            }}
          />
        </Box>

        <DialogActions sx={{ justifyContent: 'space-between', px: 4 }}>
          <Button
            onClick={() => setIsEditOpen(false)}
            sx={{ color: 'gray', px: 3, py: 1, borderRadius: '2vh', fontWeight: 800, fontSize: '2.5vh' }}
          >
            CANCEL
          </Button>
          <Button
            onClick={() => void handleEditSave()}
            variant='contained'
            sx={{ bgcolor: '#44A194', px: 3, py: 1, borderRadius: '2vh', fontWeight: 800, fontSize: '2.5vh' }}
          >
            UPDATE
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '4vh', p: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#537D96' }}>Delete Post?</DialogTitle>
        <Box sx={{ px: 3 }}>
          <Typography>Are you sure you want to delete this post?</Typography>
        </Box>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsDeleteOpen(false)} sx={{ color: 'gray', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDelete()}
            variant='contained'
            color='error'
            sx={{ borderRadius: '1.5vh', fontWeight: 800 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
