export type Role = 'admin' | 'editor' | 'autor' | 'revisor';

export interface UserRole {
  user_id: string;
  role: Role;
}
