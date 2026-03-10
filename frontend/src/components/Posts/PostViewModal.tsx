import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  TextField,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close,
  FavoriteBorder,
  Favorite,
  Send,
  MoreVert,
  DeleteOutline,
  EditOutlined,
  Check,
} from '@mui/icons-material';
import type { Post } from '../../types/post.types';
import type { Comment } from '../../types/comment.types';
import { commentsApi } from '../../api/comments.api';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../hooks/useAuth';

interface PostViewModalProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  isLiked: boolean;
  handleLike: () => void;
  likesCount: number;
  onCommentCountChange?: (delta: number) => void;
  onCommentsLoaded?: (count: number) => void;
}

export const PostViewModal = ({
  open,
  onClose,
  post,
  isLiked,
  handleLike,
  likesCount,
  onCommentCountChange,
  onCommentsLoaded,
}: PostViewModalProps) => {
  const { user } = useAuth();
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (!open || !post) return;

    const fetchComments = async () => {
      setLoadingComments(true);

      try {
        const apiComments = await commentsApi.getByPostId(post.id);

        const uniqueSenderIds = [...new Set(apiComments.map((comment) => comment.senderId))];
        const userMap: Record<string, string> = {};

        await Promise.all(
          uniqueSenderIds.map(async (id) => {
            try {
              const user = await usersApi.getById(id);
              userMap[id] = user.username;
            } catch {
              userMap[id] = id;
            }
          }),
        );

        setComments(
          apiComments.map((comment) => ({
            id: comment._id,
            senderId: comment.senderId,
            username: userMap[comment.senderId] ?? comment.senderId,
            text: comment.content,
          })),
        );

        onCommentsLoaded?.(apiComments.length);
      } finally {
        setLoadingComments(false);
      }
    };

    void fetchComments();
  }, [onCommentsLoaded, open, post, post?.id]);

  const handleInternalClose = () => {
    setCommentInput('');
    setEditingText('');
    setEditingCommentId(null);
    setAnchorEl(null);
    setSelectedComment(null);
    setComments([]);
    onClose();
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || commentInput.length > 200 || !post || !user) return;

    try {
      const newApiComment = await commentsApi.create(post.id, commentInput.trim());
      const newEntry: Comment = {
        id: newApiComment._id,
        senderId: newApiComment.senderId,
        username: user.username,
        text: newApiComment.content,
      };

      setComments((prev) => [newEntry, ...prev]);
      setCommentInput('');
      onCommentCountChange?.(1);
    } catch {
      // handle error silently
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const startEditing = () => {
    if (selectedComment) {
      setEditingCommentId(selectedComment.id);
      setEditingText(selectedComment.text);
    }

    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim() || editingText.length > 200 || !editingCommentId) return;

    try {
      await commentsApi.update(editingCommentId, editingText.trim());

      setComments((prev) =>
        prev.map((comment) => (comment.id === editingCommentId ? { ...comment, text: editingText.trim() } : comment)),
      );
      setEditingCommentId(null);
      setEditingText('');
    } catch {
      // handle error silently
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      await commentsApi.delete(selectedComment.id);

      setComments((prev) => prev.filter((comment) => comment.id !== selectedComment.id));
      onCommentCountChange?.(-1);
    } catch {
      // handle error silently
    }

    handleMenuClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      void handleAddComment();
    }
  };

  if (!post) return null;

  return (
    <Dialog
      open={open}
      onClose={handleInternalClose}
      maxWidth='lg'
      disableRestoreFocus
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(0.5vh)', bgcolor: 'rgba(0,0,0,0.2)' } },
        paper: {
          sx: {
            borderRadius: '4vh',
            width: '130vh',
            height: '85vh',
            maxWidth: '95vw',
            bgcolor: '#FDFCF0',
            backgroundImage: 'none',
            boxShadow: '0 2vh 6vh rgba(0,0,0,0.1)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <IconButton
        onClick={handleInternalClose}
        sx={{ position: 'absolute', top: '1.5vh', right: '1.5vh', zIndex: 10, color: '#537D96' }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
        <Box
          sx={{
            flex: 1.2,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e0e0d0',
            height: '100%',
            overflowY: 'auto',
            bgcolor: '#FDFCF0',
          }}
        >
          <Box sx={{ p: '2.5vh', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#44A194', width: '4.5vh', height: '4.5vh' }}>{post.username[0]}</Avatar>
            <Typography fontWeight={800} color='#537D96' fontSize='2.5vh'>
              {post.username}
            </Typography>
          </Box>
          <Box
            sx={{ width: '100%', bgcolor: '#FDFCF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img src={post.postImage} alt='Post' style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ m: '2vh' }}>
            <Typography sx={{ fontSize: '1.9vh', lineHeight: 1.6, color: '#333', wordBreak: 'break-word' }}>
              <Box component='span' sx={{ fontWeight: 800, mr: 1 }}>
                {post.username}
              </Box>
              {post.caption}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 0.8, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FDFCF0' }}>
          <Box sx={{ p: '2.3vh', borderBottom: '1px solid #e0e0d0' }}>
            <Typography fontWeight={800} color='#537D96'>
              Comments
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: '2.5vh' }}>
            {comments.map((c) => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: '2vh', alignItems: 'flex-start' }}>
                <Avatar sx={{ width: '3.5vh', height: '3.5vh', fontSize: '1.4vh' }}>{c.username[0]}</Avatar>

                <Box sx={{ flex: 1 }}>
                  {editingCommentId === c.id ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          variant='standard'
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          slotProps={{ htmlInput: { maxLength: 200 } }}
                          autoFocus
                        />
                        <IconButton size='small' onClick={() => void handleSaveEdit()} sx={{ color: '#44A194' }}>
                          <Check fontSize='small' />
                        </IconButton>
                        <IconButton size='small' onClick={() => setEditingCommentId(null)}>
                          <Close fontSize='small' />
                        </IconButton>
                      </Box>
                      <Typography variant='caption' sx={{ alignSelf: 'flex-end', color: 'gray', fontSize: '1.2vh' }}>
                        {editingText.length}/200
                      </Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '2vh', wordBreak: 'break-word', lineHeight: 1.4 }}>
                      <strong>{c.username}</strong> {c.text}
                    </Typography>
                  )}
                </Box>

                {c.senderId === user?.id && editingCommentId !== c.id && (
                  <IconButton size='small' onClick={(e) => handleMenuOpen(e, c)}>
                    <MoreVert fontSize='small' />
                  </IconButton>
                )}
              </Box>
            ))}
            <Box sx={{ py: '1vh', display: 'flex', justifyContent: 'center' }}>
              {loadingComments && <CircularProgress size='2vh' sx={{ color: '#44A194' }} />}
            </Box>
          </Box>

          <Box sx={{ p: '2vh', borderTop: '1px solid #e0e0d0', bgcolor: '#FDFCF0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <IconButton onClick={handleLike} sx={{ p: 0, color: isLiked ? '#EC8F8D' : '#537D96' }}>
                {isLiked ? <Favorite sx={{ fontSize: '3.5vh' }} /> : <FavoriteBorder sx={{ fontSize: '3.5vh' }} />}
              </IconButton>
              <Typography fontWeight={800} sx={{ fontSize: '2vh' }}>
                {likesCount.toLocaleString()} likes
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size='small'
                placeholder='Add a comment...'
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                sx={{ '& .MuiInputBase-root': { borderRadius: '2vh', bgcolor: 'white' } }}
              />
              <IconButton
                disabled={!commentInput.trim() || commentInput.length > 200}
                onClick={() => void handleAddComment()}
                sx={{ color: '#44A194' }}
              >
                <Send />
              </IconButton>
            </Box>
            <Typography
              variant='caption'
              sx={{ alignSelf: 'flex-end', mr: 1, color: 'gray', display: 'block', textAlign: 'right', mt: 0.5 }}
            >
              {commentInput.length}/200
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{ paper: { sx: { borderRadius: '1.5vh' } } }}
      >
        <MenuItem onClick={startEditing}>
          <ListItemIcon>
            <EditOutlined fontSize='small' />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void handleDeleteComment()} sx={{ color: '#EC8F8D' }}>
          <ListItemIcon>
            <DeleteOutline fontSize='small' sx={{ color: '#EC8F8D' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Dialog>
  );
};
