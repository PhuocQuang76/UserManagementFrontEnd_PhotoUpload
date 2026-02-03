export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  role?: string;
}