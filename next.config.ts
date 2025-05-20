import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['example.com', 'www.example.com', 'res.cloudinary.com'], // Adaugă domeniul imaginii externe
  },
};

export default nextConfig;
