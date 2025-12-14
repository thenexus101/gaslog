import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import {
  AuthUser,
  saveAuthUser,
  getAuthUser,
  clearAuthUser,
  saveSpreadsheetId,
  getSpreadsheetId,
} from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const existingUser = getAuthUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setLoading(false);
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('OAuth response received');
        
        if (!response.access_token) {
          throw new Error('No access token received');
        }

        // Test the token by getting user profile first
        const profileResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error('Profile fetch failed:', errorText);
          throw new Error('Failed to fetch user profile. Token may be invalid.');
        }

        const profile = await profileResponse.json();
        console.log('User profile fetched:', profile.email);
        
        // Access tokens typically expire in 1 hour, set expiration to 55 minutes for safety
        const expiresAt = Date.now() + 55 * 60 * 1000;
        const authUser: AuthUser = {
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          accessToken: response.access_token,
          expiresAt,
        };

        saveAuthUser(authUser);
        setUser(authUser);

        // Try to restore spreadsheet ID from localStorage for this user
        const existingSpreadsheetId = getSpreadsheetId(profile.email);
        if (existingSpreadsheetId) {
          console.log('Found existing spreadsheet ID for user:', existingSpreadsheetId);
          // Save to sessionStorage for current session
          saveSpreadsheetId(existingSpreadsheetId, profile.email);
        } else {
          console.log('No existing spreadsheet found, will create when needed');
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to login: ${errorMessage}`);
      }
    },
    onError: (error) => {
      console.error('OAuth error:', error);
      alert('Login failed. Please check your Google OAuth configuration.');
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
  });

  const logout = () => {
    clearAuthUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Configuration Error</h2>
        <p>Please set VITE_GOOGLE_CLIENT_ID in your .env file</p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

