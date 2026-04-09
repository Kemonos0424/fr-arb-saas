/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Only enable API proxy in local development
    // In production (Vercel), NEXT_PUBLIC_API_URL points directly to the backend
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
