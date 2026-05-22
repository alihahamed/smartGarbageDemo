import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['192.168.0.103'],
  }),
};

export default nextConfig;
