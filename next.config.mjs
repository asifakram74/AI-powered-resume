import webpack from "next/dist/compiled/webpack/webpack.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',

  webpack: (config, { isServer }) => {

    config.ignoreWarnings = [
      { module: /node_modules[\\/]face-api.js/ },
      { module: /node_modules[\\/]@tensorflow/ },
      { message: /Can't resolve 'encoding'/ },
      { message: /Can't resolve 'fs'/ },
    ];

    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        fs: false,
        encoding: false,
        'node-fetch': false,
      };

      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        encoding: false,
      };

      // ⭐⭐ FIX: use `.default`
      config.plugins = [
        ...(config.plugins || []),
        new webpack.IgnorePlugin.default({ resourceRegExp: /^encoding$/ }),
      ];
    }

    return config;
  },
};

export default nextConfig;