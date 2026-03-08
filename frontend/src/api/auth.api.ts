import api from './axios';
import type { LoginPayload, RegisterPayload, User } from '../types/auth.types';

interface AuthResponse extends User {
  _id?: string;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);

    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', payload.username);
    formData.append('email', payload.email);
    formData.append('password', payload.password);

    if (payload.profileImage) {
      formData.append('photo', payload.profileImage);
    }

    await api.post<AuthResponse>('/auth/register', formData);

    return authApi.login({ username: payload.username, password: payload.password });
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${refreshToken}` } });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');

    return data;
  },
};
