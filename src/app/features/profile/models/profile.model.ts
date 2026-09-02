export interface ProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  twoFactorEnabled: boolean;
}

export interface UpdateProfileCommand {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupDto {
  secretKey: string;
  authenticatorUri: string;
}

export interface EnableTwoFactorCommand {
  code: string;
}