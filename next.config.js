/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose environment variables to the Edge runtime (proxy.ts)
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Optional: enable strict mode, future features, etc.
  reactStrictMode: true,
  // Keep other defaults
};
module.exports = nextConfig;
