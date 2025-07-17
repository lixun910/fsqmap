// API Configuration
export const API_CONFIG = {
  // Development - use computer's IP address for React Native
  development: {
    baseUrl: 'http://192.168.86.24:3000', // Your computer's IP address with correct port
  },
  // Production (update this when deploying)
  production: {
    baseUrl: 'https://your-backend-domain.com',
  },
};

// Get current environment
const getEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

// Export current config
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env as keyof typeof API_CONFIG];
};

// API endpoints
export const API_ENDPOINTS = {
  chat: '/api/chat',
} as const;
