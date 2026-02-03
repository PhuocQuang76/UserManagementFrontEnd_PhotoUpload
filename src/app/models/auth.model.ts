// Login Request - sent to backend
export interface LoginRequest {
  email: string;
  password: string;
}

// Register Request - sent to backend
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Login Response - received from backend
export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

// Stored User - saved in localStorage
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}