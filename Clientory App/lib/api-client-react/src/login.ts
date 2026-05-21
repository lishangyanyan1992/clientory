import { customFetch } from "./custom-fetch";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  emailToken: string;
  userId?: string | null;
}

export const login = async (
  loginBody: LoginBody,
  options?: RequestInit,
): Promise<LoginResponse> => {
  return customFetch<LoginResponse>("/api/auth/login", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(loginBody),
  });
};
