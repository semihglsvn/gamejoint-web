import { API_BASE_URL } from "./config";

export interface LoginResponse {
  token?: string;
  jwtToken?: string;
  email?: string;
  isNewUser?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  dob: string; 
  cfTurnstileResponse: string;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message || data.error || `Request failed (Error ${res.status})`;
  } catch {
    return `Request failed (Error ${res.status})`;
  }
}

// ==========================================
// SESSION & LOGOUT (HttpOnly Cookies)
// ==========================================

export async function getMe() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function logoutBackend() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

// ==========================================
// CORE AUTH
// ==========================================

export async function loginUser(usernameOrEmail: string, pass: string, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken 
    },
    credentials: "include", 
    body: JSON.stringify({
      usernameOrEmail,
      password: pass,
      cfTurnstileResponse: turnstileToken
    }),
  });

  if (!res.ok) {
    const errorMsg = await parseError(res);
    if (errorMsg.toLowerCase().includes("not verified")) {
      throw new Error("UNVERIFIED");
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<LoginResponse>;
}

export async function registerUser(data: RegisterRequest, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken 
    },
    credentials: "include",
    body: JSON.stringify({
      ...data,
      cfTurnstileResponse: turnstileToken
    }),
  });

  if (!res.ok) {
    const errorMsg = await parseError(res);
    throw new Error(errorMsg);
  }
  return res.json();
}

// ==========================================
// OAUTH
// ==========================================

export async function oauthLogin(provider: string, token: string, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/oauth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken
    },
    credentials: "include",
    body: JSON.stringify({
      provider,
      providerToken: token,
      cfTurnstileResponse: turnstileToken
    }),
  });

  if (!res.ok) {
    const errorMsg = await parseError(res);
    throw new Error(errorMsg);
  }
  return res.json() as Promise<LoginResponse>;
}

export async function completeOAuthRegistration(
  provider: string, 
  providerToken: string, 
  username: string, 
  dob: string, 
  turnstileToken: string
) {
  const res = await fetch(`${API_BASE_URL}/auth/oauth/complete`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken
    },
    credentials: "include",
    body: JSON.stringify({
      provider,
      providerToken,
      username,
      dob,
      cfTurnstileResponse: turnstileToken
    }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ==========================================
// VERIFICATION
// ==========================================

export async function verifyAccount(email: string, otp: string, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken 
    },
    credentials: "include",
    body: JSON.stringify({ identifier: email, otp }), 
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.text(); 
}

export async function resendVerification(email: string, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/verify/resend`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken
    },
    credentials: "include",
    body: JSON.stringify({ identifier: email }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.text();
}

export async function requestPasswordReset(email: string, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.text();
}

export async function executePasswordReset(email: string, otp: string, newPassword: string, turnstileToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/password/reset`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Turnstile-Token": turnstileToken
    },
    credentials: "include",
    body: JSON.stringify({ email, otp, newPassword }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}