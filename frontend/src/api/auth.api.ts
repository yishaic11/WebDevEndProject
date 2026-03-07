import type { LoginPayload, RegisterPayload } from '../types/auth.types';

export const authApi = {
  // eslint-disable-next-line @typescript-eslint/require-await
  login: async (data: LoginPayload): Promise<void> => {
    // TODO: Implement once backend is ready.
    console.log('authApi.login not imeplemented yet with ', data);
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  register: async (data: RegisterPayload): Promise<void> => {
    // TODO: Implement once backend is ready.
    console.log('authApi.register not implemented yet with ', data);
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  logout: async (): Promise<void> => {
    // TODO: Implement once backend is ready.
    console.log('authApi.logout not implemented yet');
  },
};
