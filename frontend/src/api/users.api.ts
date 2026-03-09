import api from './axios';
import type { UserResponseDto } from '../types/auth.types';

export const usersApi = {
  update: async (id: string, payload: { username?: string; photo?: File }): Promise<UserResponseDto> => {
    const formData = new FormData();

    if (payload.username) formData.append('username', payload.username);
    if (payload.photo) formData.append('photo', payload.photo);

    const { data } = await api.put<UserResponseDto>(`/users/${id}`, formData);

    return data;
  },
};
