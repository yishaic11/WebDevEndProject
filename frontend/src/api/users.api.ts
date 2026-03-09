import api from './axios';
import type { UserResponseDto } from '../types/auth.types';

export const usersApi = {
  getById: async (id: string): Promise<UserResponseDto> => {
    const { data } = await api.get<UserResponseDto>(`/users/${id}`);

    return data;
  },

  update: async (id: string, payload: { username?: string; photo?: File }): Promise<UserResponseDto> => {
    const formData = new FormData();

    if (payload.username) formData.append('username', payload.username);
    if (payload.photo) formData.append('photo', payload.photo);

    const { data } = await api.put<UserResponseDto>(`/users/${id}`, formData);

    return data;
  },
};
