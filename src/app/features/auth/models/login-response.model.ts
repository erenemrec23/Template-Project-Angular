export interface LoginResponseDto {
  token: string | null;
  refreshToken: string | null;
  refreshTokenExpires: string | null;
  userId: string;
  requiresTwoFactor: boolean;
}