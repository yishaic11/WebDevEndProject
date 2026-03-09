import type { ApiPost, UpdatePostPayload } from '../types/post.types';
import api from './axios';

export const postsApi = {
  getAll: async (): Promise<ApiPost[]> => {
    const { data } = await api.get<ApiPost[]>('/posts/all');

    return data;
  },

  getBySender: async (senderId: string): Promise<ApiPost[]> => {
    const { data } = await api.get<ApiPost[]>(`/posts?sender=${senderId}`);

    return data;
  },

  getById: async (id: string): Promise<ApiPost> => {
    const { data } = await api.get<ApiPost>(`/posts/${id}`);

    return data;
  },

  update: async (id: string, payload: UpdatePostPayload): Promise<ApiPost> => {
    const formData = new FormData();
    const { content, photo } = payload;

    if (content) formData.append('content', content);
    if (photo) formData.append('photo', photo);

    const { data } = await api.put<ApiPost>(`/posts/${id}`, formData);

    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  toggleLike: async (postId: string): Promise<void> => {
    await api.patch('/posts/like', { postId });
  },
};
