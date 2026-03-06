export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
};

export type UpdateUserDto = {
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
};

export type UserResponseDto = {
  _id: string;
  username: string;
  email: string;
  photoUrl?: string;
};
