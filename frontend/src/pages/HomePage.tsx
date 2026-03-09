import { useState, useEffect } from 'react';
import { Box, CircularProgress, Fab, Zoom } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { PostCard } from '../components/Posts/PostCard';
import type { Post } from '../types/post.types';
import logo from '../assets/logo.png';
import { postsApi } from '../api/posts.api';
import { usersApi } from '../api/users.api';
import { useLocation } from 'react-router-dom';

export const HomePage = () => {
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      try {
        const apiPosts = await postsApi.getAll();

        const uniqueSenderIds = [...new Set(apiPosts.map((p) => p.senderId))];
        const userMap: Record<string, { username: string; photoUrl?: string }> = {};

        await Promise.all(
          uniqueSenderIds.map(async (id) => {
            try {
              const u = await usersApi.getById(id);
              userMap[id] = { username: u.username, photoUrl: u.photoUrl };
            } catch {
              userMap[id] = { username: id };
            }
          }),
        );

        const mapped: Post[] = apiPosts.map((p) => ({
          id: p._id,
          senderId: p.senderId,
          username: userMap[p.senderId]?.username ?? p.senderId,
          userImage: userMap[p.senderId]?.photoUrl,
          postImage: p.photoUrl ?? '',
          caption: p.content,
          likedBy: p.likes,
          commentsCount: 0,
        }));

        setPosts(mapped);
      } finally {
        setLoading(false);
      }
    };

    void fetchPosts();
  }, [location.key]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box
        component='img'
        src={logo}
        alt='Logo'
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '20vh',
          objectFit: 'contain',
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress sx={{ color: '#44A194' }} size={56} />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: '3vh',
            width: '100%',
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </Box>
      )}

      <Zoom in={showScrollTop}>
        <Fab
          onClick={scrollToTop}
          size='medium'
          sx={{
            position: 'fixed',
            bottom: '4vh',
            right: '4vh',
            bgcolor: '#44A194',
            color: 'white',
            '&:hover': { bgcolor: '#388e83' },
            boxShadow: '0 0.5vh 2vh rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
          aria-label='scroll back to top'
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>
    </Box>
  );
};
