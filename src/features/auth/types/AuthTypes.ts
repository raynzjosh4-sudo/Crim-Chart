export interface SignUpParams {
  countryCode: string;
  countryName: string;
  phoneNumber: string;
  email: string;
  password?: string;
  username: string;
  birthday?: Date;
  gender?: string;
  profileImagePath?: string;
  musicCategory?: string;
}

export interface LoginParams {
  identifier: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
