export interface SignUpParams {
  countryCode: string;
  countryName: string;
  phoneNumber: string;
  email: string;
  password?: string;
  username: string;
  birthday?: Date;
  gender?: string;
  profileImagePath?: string; // local file path before upload
}

export interface LoginParams {
  identifier: string; // phone number or username or email
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
