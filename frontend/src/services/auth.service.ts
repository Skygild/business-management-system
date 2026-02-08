import { apiClient } from '@/lib/api-client';

import type { AuthResponse, LoginCredentials, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/profile');
    return data;
  },
};
