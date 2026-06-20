/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep native/CJS server libs out of the bundler so they run in the Node runtime.
  serverExternalPackages: ['pdf-parse', 'pg', 'mammoth'],
};

export default nextConfig;
