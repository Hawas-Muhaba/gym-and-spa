export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest{
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: 'Client' | 'Staff' | 'Manager';
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
}

export interface AuthResponse {
    token: TokenResult;
}

export interface DecodedUser{
    userId: string;
    email: string;
    role: 'Client' | 'Staff' | 'Manager';
}

