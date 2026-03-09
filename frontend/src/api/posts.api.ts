import type { ApiPost, CreatePostPayload } from '../types/post.types';
import api from './axios';

export const postsApi = {
  create: async (payload: CreatePostPayload): Promise<ApiPost> => {
    const formData = new FormData();
    const { content, photo } = payload;

    formData.append('content', content);
    formData.append('photo', photo);

    const { data } = await api.post<ApiPost>('/posts', formData);

    return data;
  },
};
