import type { ApiPost, CreatePostPayload } from '../types/post.types';
import api from './axios';

export const postsApi = {
  create: async (payload: CreatePostPayload): Promise<ApiPost> => {
    const formData = new FormData();
    formData.append('content', payload.content);

    if (payload.photo) {
      formData.append('photo', payload.photo);
    }

    const { data } = await api.post<ApiPost>('/posts', formData);

    return data;
  },
};
