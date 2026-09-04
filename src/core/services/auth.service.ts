import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, TokenResult } from '../models/auth.model';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { DecodedUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient); // modern Angular DI style — inject() instead of constructor params
  private baseUrl = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<{ userId: string }> {
    return this.http.post<{ userId: string }>(`${this.baseUrl}/register`, request);
  }

  refresh(accessToken: string, refreshToken: string): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${this.baseUrl}/refresh`, { accessToken, refreshToken });
  }
  decodeToken(token: string): DecodedUser {
  const decoded: any = jwtDecode(token);
  return {
    userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? decoded.sub,
    email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? decoded.email,
    role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? decoded.role,
  };
}
}