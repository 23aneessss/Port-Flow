import type { AgentConfig } from './config.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface LoginResponse {
  token: string;
}

/**
 * API Client for making HTTP requests to the backend
 */
export class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(config: AgentConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.authToken = config.authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Login to the backend and get a JWT token
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>('/auth/login', { email, password });
    
    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const statusCode = response.status;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        return {
          success: false,
          error: (errorData.message as string) || (errorData.error as string) || `HTTP ${statusCode}`,
          statusCode,
        };
      }

      const data = await response.json().catch(() => null);
      return {
        success: true,
        data: data as T,
        statusCode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 0,
      };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}
