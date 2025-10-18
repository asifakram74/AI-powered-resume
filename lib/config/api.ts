import axios from 'axios';

// Node.js Backend Configuration for app/api routes
const NODEJS_API_BASE_URL = process.env.NEXT_PUBLIC_NODEJS_API_URL || " https://backendserver.resumaic.com";

console.log("NODEJS_API_BASE_URL", NODEJS_API_BASE_URL);

export const apiConfig = {
  baseURL: NODEJS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  endpoints: {
    atsAnalysis: '/api/ats-analysis',
    coverLetterGeneration: '/api/cover-letter-generation',
    export: '/api/export',
    exportDocx: '/api/export-docx',
    optimizeCv: '/api/optimize-cv',
    parseResume: '/api/parse-resume',
  },
};

// Create axios instance with baseURL configured
export const nodeApi = axios.create({
  baseURL: NODEJS_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
nodeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      throw new Error('Cannot connect to the server. Please check if the backend is running.');
    }
    return Promise.reject(error);
  }
);

// Helper function to get full API URL for Node.js backend
export const getApiUrl = (endpoint: string): string => {
  return `${NODEJS_API_BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
export const getEndpointUrl = (endpointKey: keyof typeof apiConfig.endpoints): string => {
  return getApiUrl(apiConfig.endpoints[endpointKey]);
};

// Helper function to make API calls using nodeApi client
export const callNodeApi = {
  post: (endpoint: string, data?: any) => nodeApi.post(endpoint, data),
  get: (endpoint: string) => nodeApi.get(endpoint),
  put: (endpoint: string, data?: any) => nodeApi.put(endpoint, data),
  delete: (endpoint: string) => nodeApi.delete(endpoint),
};