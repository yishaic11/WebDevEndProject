export type AuthTokensDto = { accessToken: string; refreshToken: string };

export type RegisterDto = {
  username: string;
  email: string;
  password: string;
};

export type LoginDto = {
  username: string;
  password: string;
};
