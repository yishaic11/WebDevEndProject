import { useState, useEffect } from 'react';
import { Paper, Box, Typography, Avatar, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, ChatBubbleOutline } from '@mui/icons-material';
import { postsApi } from '../../api/posts.api';
import { useAuth } from '../../hooks/useAuth';
import { PostViewModal } from './PostViewModal';
import { commentsApi } from '../../api/comments.api';

interface PostProps {
  id: string;
  senderId: string;
  username: string;
  userImage?: string;
  postImage: string;
  caption: string;
  likedBy: string[];
  commentsCount: number;
}

export const PostCard = (props: PostProps) => {
  const { id, username, userImage, postImage, caption, likedBy, commentsCount: initialCommentsCount } = props;
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(() => (user?.id ? likedBy.includes(user.id) : false));
  const [likes, setLikes] = useState(likedBy.length);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const comments = await commentsApi.getByPostId(id);

        setCommentsCount(comments.length);
      } catch {
        // handle error silently
      }
    };

    void fetchCount();
  }, [id]);

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      await postsApi.toggleLike(id);
    } catch {
      setIsLiked(wasLiked);
      setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const isLongCaption = caption.length > 40;
  const displayCaption = isLongCaption ? `${caption.substring(0, 40)}...` : caption;

  return (
    <>
      <Paper
        sx={{
          borderRadius: '4vh',
          overflow: 'hidden',
          bgcolor: 'white',
          mb: '4vh',
          boxShadow: '0 1vh 3vh rgba(0,0,0,0.03)',
          width: '100%',
        }}
      >
        <Box sx={{ p: '2vh', display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
          <Avatar
            src={userImage}
            sx={{ width: '5vh', height: '5vh', bgcolor: '#44A194' }}
            slotProps={{
              img: {
                referrerPolicy: 'no-referrer',
              },
            }}
          >
            {username[0]}
          </Avatar>
          <Typography fontWeight={800} sx={{ fontSize: '1.8vh', color: '#537D96' }}>
            {username}
          </Typography>
        </Box>

        <Box
          onClick={() => setIsModalOpen(true)}
          sx={{ width: '100%', height: '50vh', overflow: 'hidden', cursor: 'pointer' }}
        >
          <img src={postImage} alt='Post' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>

        <Box sx={{ px: '2vh', pt: '1.5vh', display: 'flex', alignItems: 'center', gap: '1vh' }}>
          <IconButton onClick={() => void handleLike()} sx={{ color: isLiked ? '#EC8F8D' : '#537D96' }}>
            {isLiked ? <Favorite sx={{ fontSize: '3vh' }} /> : <FavoriteBorder sx={{ fontSize: '3vh' }} />}
          </IconButton>
          <IconButton onClick={() => setIsModalOpen(true)} sx={{ color: '#537D96' }}>
            <ChatBubbleOutline sx={{ fontSize: '2.8vh' }} />
          </IconButton>
        </Box>

        <Box sx={{ px: '3vh', pb: '3vh' }}>
          <Typography fontWeight={800} sx={{ fontSize: '1.6vh', mb: '0.5vh' }}>
            {likes.toLocaleString()} likes
          </Typography>
          <Typography sx={{ fontSize: '1.7vh', lineHeight: 1.5 }}>
            <Box component='span' sx={{ fontWeight: 800, mr: 1 }}>
              {username}
            </Box>
            {displayCaption}
          </Typography>

          <Typography
            onClick={() => setIsModalOpen(true)}
            sx={{ color: 'gray', fontSize: '1.5vh', mt: '1vh', cursor: 'pointer', '&:hover': { color: '#44A194' } }}
          >
            View all {commentsCount} comments
          </Typography>
        </Box>
      </Paper>
      <PostViewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={props}
        isLiked={isLiked}
        handleLike={() => void handleLike()}
        likesCount={likes}
        onCommentsLoaded={(count) => setCommentsCount(count)}
        onCommentCountChange={(delta) => setCommentsCount((prev) => prev + delta)}
      />
    </>
  );
};
