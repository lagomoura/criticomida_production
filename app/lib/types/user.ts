export type UserRole = 'admin' | 'critic' | 'user';

export type Gender = 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  handle: string | null;
  bio: string | null;
  location: string | null;
  role: UserRole;
  gender: Gender | null;
  /** ISO date string (YYYY-MM-DD). El backend solo expone `age_range`
   *  derivado al owner; la fecha exacta es para el dueño del perfil. */
  birth_date: string | null;
  created_at: string;
  updated_at: string;
  /** Si el user ya confirmó el link enviado al registro (migración 028).
   *  El frontend usa este flag para mostrar/ocultar el banner. */
  email_verified?: boolean;
}

export interface UpdateProfileRequest {
  display_name?: string;
  handle?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  gender?: Gender | null;
  birth_date?: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
