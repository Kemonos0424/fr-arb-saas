/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In local dev, proxy /api to the FastAPI backend
    // In production (Vercel), NEXT_PUBLIC_API_URL points directly to the backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
