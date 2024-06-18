// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Your Next.js configuration options here
    // For example:
    // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    //   // Perform customizations to webpack config
    //   return config;
    // },
  
    // Add Babel presets configuration
    babel: {
      presets: ['next/babel']
    }
  };
  
  export default nextConfig;
  