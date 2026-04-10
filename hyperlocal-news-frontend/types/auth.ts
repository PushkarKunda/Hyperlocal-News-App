export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  user: import('./user').User | null;
  token: string | null;
}

export interface LoginRequest {
  phone: string;
  countryCode: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  otpSent: boolean;
  expiresIn: number; // OTP expiry in seconds
}

export interface VerifyOTPRequest {
  phone: string;
  countryCode: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  user: import('./user').User;
  isNewUser: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}