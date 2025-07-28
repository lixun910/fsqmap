import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@openassistant/places': path.resolve(
        '/Users/xun/github/openassistant/packages/tools/places/src'
      ),
    };
    return config;
  },
};

export default nextConfig;
