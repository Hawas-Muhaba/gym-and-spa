import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { jwtDecode } from 'jwt-decode';
import { DecodedUser } from '../models/auth.model';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: DecodedUser | null;
}

function decodeUserToken(token: string): DecodedUser | null {
  try {
    const decoded: any = jwtDecode(token);
    return {
      userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? decoded.sub,
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? decoded.email,
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? decoded.role,
    };
  } catch {
    return null;
  }
}

function getInitialAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, user: null };
  }
  const accessToken = sessionStorage.getItem('gym_access_token');
  const refreshToken = sessionStorage.getItem('gym_refresh_token');
  if (accessToken && refreshToken) {
    const user = decodeUserToken(accessToken);
    if (user) {
      return { accessToken, refreshToken, user };
    }
  }
  return { accessToken: null, refreshToken: null, user: null };
}

const initialState: AuthState = getInitialAuthState();

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setSession(accessToken: string, refreshToken: string, user: DecodedUser) {
      patchState(store, { accessToken, refreshToken, user });
      sessionStorage.setItem('gym_access_token', accessToken);
      sessionStorage.setItem('gym_refresh_token', refreshToken);
    },
    loadFromStorage() {
      if (typeof window === 'undefined') return;
      const accessToken = sessionStorage.getItem('gym_access_token');
      const refreshToken = sessionStorage.getItem('gym_refresh_token');
      if (accessToken && refreshToken) {
        const user = decodeUserToken(accessToken);
        if (user) {
          patchState(store, { accessToken, refreshToken, user });
        }
      }
    },
    logout() {
      patchState(store, { accessToken: null, refreshToken: null, user: null });
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gym_access_token');
        sessionStorage.removeItem('gym_refresh_token');
      }
    }
  }))
);

export type AuthStoreType = Omit<typeof AuthStore, 'setSession' | 'loadFromStorage' | 'logout'> & {
  accessToken: () => string | null;
  refreshToken: () => string | null;
  user: () => DecodedUser | null;
};