import type { ApiComment } from '../types/comment.types';
import api from './axios';

export const commentsApi = {
  getByPostId: async (postId: string): Promise<ApiComment[]> => {
    const { data } = await api.get<ApiComment[]>(`/comments/post/${postId}`);

    return data;
  },

  create: async (postId: string, content: string): Promise<ApiComment> => {
    const { data } = await api.post<ApiComment>('/comments', { postId, content });

    return data;
  },

  update: async (id: string, content: string): Promise<ApiComment> => {
    const { data } = await api.put<ApiComment>(`/comments/${id}`, { content });

    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};
