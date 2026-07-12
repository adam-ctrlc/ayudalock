// Defaults to the deployed Vercel API so a phone on the Expo tunnel can reach it.
// Override with EXPO_PUBLIC_API_URL to point at a local/LAN server.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://ayudalock-api.vercel.app/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, query, signal } = options;

  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? "Something went wrong. Please try again.",
      data?.errors,
    );
  }

  return data as T;
}
