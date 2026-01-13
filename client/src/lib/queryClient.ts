import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from '@/lib/firebase';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to get Firebase auth token
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (auth.currentUser) {
    try {
      // Get the actual Firebase ID token
      const idToken = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${idToken}`;
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
  }

  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  // Check if data is FormData (for file uploads)
  const isFormData = data instanceof FormData;

  // Don't set Content-Type for FormData - browser will set it with boundary
  const headers = {
    ...(!isFormData && data ? { "Content-Type": "application/json" } : {}),
    ...authHeaders,
  };

  const res = await fetch(url, {
    method,
    headers,
    // Don't stringify FormData - send it as-is
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      let url = queryKey[0] as string;

      // Handle query parameters from the second element
      if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
        const params = new URLSearchParams();
        const queryParams = queryKey[1] as Record<string, any>;

        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const authHeaders = await getAuthHeaders();
      const res = await fetch(url, {
        credentials: "include",
        headers: authHeaders,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1, // Retry once on failure
      retryDelay: 1000, // 1 second delay between retries
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
