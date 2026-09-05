import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(dir, "../../"),
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [400, 640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [64, 128, 256, 384, 512],
  },
  experimental: {
    optimizePackageImports: ["motion", "@react-three/drei"],
  },
};

export default nextConfig;
