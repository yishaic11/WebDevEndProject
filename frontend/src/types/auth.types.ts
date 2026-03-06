export interface User {
  id: string;
  username: string;
  email?: string;
  photoUrl?: string;
}

export interface UserResponseDto {
  _id: string;
  username: string;
  email: string;
  photoUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  profileImage?: File;
}
