import { nodeApi } from '../api';

// Node.js Backend Configuration for app/api routes
const NODEJS_API_BASE_URL = process.env.NEXT_PUBLIC_NODEJS_API_URL || 'http://localhost:3001';

export const apiConfig = {
  baseURL: NODEJS_API_BASE_URL,
  endpoints: {
    atsAnalysis: '/api/ats-analysis',
    coverLetterGeneration: '/api/cover-letter-generation',
    export: '/api/export',
    exportDocx: '/api/export-docx',
    optimizeCv: '/api/optimize-cv',
    parseResume: '/api/parse-resume',
  },
};

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