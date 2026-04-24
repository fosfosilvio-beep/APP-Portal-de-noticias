export type Role = 'admin' | 'editor' | 'autor' | 'revisor' | 'colunista';

export interface UserRole {
  user_id: string;
  role: Role;
}
