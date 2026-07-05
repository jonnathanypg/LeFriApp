export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  googleId?: string;
  language: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
} 