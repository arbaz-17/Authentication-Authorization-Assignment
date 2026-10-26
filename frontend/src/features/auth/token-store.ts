let accessToken: string | null = null;
let authEpoch = 0;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAuthEpoch(): number {
  return authEpoch;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
  authEpoch += 1;
}