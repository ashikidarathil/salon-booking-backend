export interface LoginDto {
  identifier: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'STYLIST';
}
