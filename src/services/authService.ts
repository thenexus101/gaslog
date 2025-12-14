export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  expiresAt?: number; // Timestamp when token expires
}

const STORAGE_KEY = 'gaslog_auth_user';
const SPREADSHEET_ID_KEY = 'gaslog_spreadsheet_id';

// Get spreadsheet ID key for a specific user
function getSpreadsheetIdKeyForUser(email: string): string {
  return `${SPREADSHEET_ID_KEY}_${email}`;
}

export function saveAuthUser(user: AuthUser): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    // Check if token is expired (tokens typically last 1 hour)
    if (user.expiresAt && Date.now() > user.expiresAt) {
      clearAuthUser();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function isTokenExpired(user: AuthUser | null): boolean {
  if (!user || !user.expiresAt) return false;
  return Date.now() > user.expiresAt;
}

export function clearAuthUser(): void {
  const user = getAuthUser();
  if (user) {
    // Clear user-specific spreadsheet ID from localStorage
    localStorage.removeItem(getSpreadsheetIdKeyForUser(user.email));
  }
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SPREADSHEET_ID_KEY);
}

export function saveSpreadsheetId(spreadsheetId: string, userEmail?: string): void {
  // Save to sessionStorage for current session
  sessionStorage.setItem(SPREADSHEET_ID_KEY, spreadsheetId);
  
  // Also save to localStorage keyed by user email for persistence across logins
  if (userEmail) {
    localStorage.setItem(getSpreadsheetIdKeyForUser(userEmail), spreadsheetId);
  } else {
    // Try to get email from current user
    const user = getAuthUser();
    if (user) {
      localStorage.setItem(getSpreadsheetIdKeyForUser(user.email), spreadsheetId);
    }
  }
}

export function getSpreadsheetId(userEmail?: string): string | null {
  // First try sessionStorage (current session)
  const sessionId = sessionStorage.getItem(SPREADSHEET_ID_KEY);
  if (sessionId) return sessionId;
  
  // Then try localStorage (persisted across logins)
  if (userEmail) {
    const persistedId = localStorage.getItem(getSpreadsheetIdKeyForUser(userEmail));
    if (persistedId) return persistedId;
  } else {
    // Try to get email from current user
    const user = getAuthUser();
    if (user) {
      const persistedId = localStorage.getItem(getSpreadsheetIdKeyForUser(user.email));
      if (persistedId) return persistedId;
    }
  }
  
  return null;
}

// This function is no longer used - authentication is handled directly in AuthContext
// Keeping for potential future use
export function extractUserFromResponse(
  response: { access_token: string; profileObj?: any }
): AuthUser | null {
  if ('access_token' in response && response.profileObj) {
    const profile = response.profileObj;
    return {
      email: profile.email,
      name: profile.name,
      picture: profile.imageUrl,
      accessToken: response.access_token,
    };
  }
  return null;
}

