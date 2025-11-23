import axios, { AxiosInstance } from 'axios';
import { VerificationResult } from '../types/signature.types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // In development, use relative URLs to go through Vite proxy
    // In production, use full URL from env variable
    const isDev = import.meta.env.DEV;
    let baseURL = '';
    
    if (isDev) {
      // Use relative URL in dev to leverage Vite proxy
      baseURL = '';
    } else {
      // In production, use full URL from env
      baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    }
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if needed
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async verifySignature(
    message: string,
    signature: string,
    expectedSigner: string
  ): Promise<VerificationResult> {
    const response = await this.api.post('/api/auth/verify-signature', {
      message,
      signature,
      expectedSigner,
    });
    return response.data.data;
  }

  async createSession(
    message: string,
    signature: string,
    walletAddress: string
  ): Promise<any> {
    const response = await this.api.post('/api/auth/session', {
      message,
      signature,
      walletAddress,
    });
    return response.data.data;
  }

  async getSession(): Promise<any> {
    const response = await this.api.get('/api/auth/session');
    return response.data.data;
  }

  async destroySession(): Promise<void> {
    await this.api.delete('/api/auth/session');
  }
}

export default new ApiService();