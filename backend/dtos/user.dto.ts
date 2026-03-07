export type UpdateUserDto = {
  username?: string;
  photoUrl?: string;
};

export type UserResponseDto = {
  _id: string;
  username: string;
  email: string;
  photoUrl?: string;
};
