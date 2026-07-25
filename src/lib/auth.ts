export type AuthUser = {
  id: string;
  email: string;
  name: string;
  company?: string | null;
  role: "CUSTOMER" | "ADMIN" | string;
  phone?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  industry?: string | null;
  employees?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  timezone?: string | null;
  language?: string | null;
  currency?: string | null;
  avatarUrl?: string | null;
  notifyOrderEmail?: boolean;
  notifySms?: boolean;
  notifyWeeklyDigest?: boolean;
  notifyMarketing?: boolean;
  passwordChangedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

const TOKEN_KEY = "printoe_access_token";
const USER_KEY = "printoe_user";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `printoe_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "printoe_auth=; path=/; max-age=0; SameSite=Lax";
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (typeof body.message === "string") return body.message;
    return body.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthSession();
    }
    throw new Error(await parseError(res));
  }

  return res.json() as Promise<T>;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLoginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signupRequest(payload: {
  name: string;
  email: string;
  password: string;
  company?: string;
}) {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe() {
  return apiFetch<{ success: boolean; data: AuthUser }>("/auth/me");
}

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  website?: string;
  industry?: string;
  employees?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  avatarUrl?: string;
  notifyOrderEmail?: boolean;
  notifySms?: boolean;
  notifyWeeklyDigest?: boolean;
  notifyMarketing?: boolean;
};

export async function updateProfileRequest(payload: UpdateProfilePayload) {
  return apiFetch<{ success: boolean; message?: string; data: AuthUser }>(
    "/users/me",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function changePasswordRequest(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiFetch<{ success: boolean; message?: string }>(
    "/users/me/change-password",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
