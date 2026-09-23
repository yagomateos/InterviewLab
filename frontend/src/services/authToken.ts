// Shared token storage — split out of api.ts so both api.ts and
// mockData.ts (the offline fallback) can read/write the same token without
// creating a circular import between them.
const TOKEN_KEY = "interviewlab_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage unavailable — the session just won't survive a reload.
  }
}
