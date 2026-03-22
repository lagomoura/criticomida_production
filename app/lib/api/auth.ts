import { fetchApi, clearSessionCookies } from './client';
import { User, TokenResponse, RegisterRequest } from '../types';

export async function register(data: RegisterRequest): Promise<User> {
  return fetchApi<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  return fetchApi<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function logout(): Promise<void> {
  await clearSessionCookies();
}

export async function refreshToken(): Promise<TokenResponse> {
  return fetchApi<TokenResponse>('/api/auth/refresh', {
    method: 'POST',
    body: '{}',
    skipAuth: true,
  });
}

export async function getCurrentUser(): Promise<User> {
  return fetchApi<User>('/api/auth/me');
}
