import { fetchApi, clearSessionCookies } from './client';
import { User, TokenResponse, RegisterRequest, HandleAvailability } from '../types';

export async function register(data: RegisterRequest): Promise<User> {
  return fetchApi<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export async function checkHandleAvailable(
  handle: string,
): Promise<HandleAvailability> {
  const params = new URLSearchParams({ handle });
  return fetchApi<HandleAvailability>(
    `/api/users/handle-available?${params.toString()}`,
    { skipAuth: true },
  );
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

export async function resendVerificationEmail(): Promise<void> {
  await fetchApi<void>('/api/auth/resend-verification', {
    method: 'POST',
  });
}

export async function verifyEmail(token: string): Promise<User> {
  return fetchApi<User>(`/api/auth/verify-email/${encodeURIComponent(token)}`, {
    method: 'POST',
    skipAuth: true,
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await fetchApi<void>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<User> {
  return fetchApi<User>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
    skipAuth: true,
  });
}
