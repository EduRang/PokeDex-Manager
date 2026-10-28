export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginInput {
  identifier: string; // Email or username
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
