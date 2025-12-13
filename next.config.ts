import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config options here */

  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
    "/*": ["./node_modules/.prisma/client/**/*"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Set the file size limit to 5 megabytes
    },
    optimizePackageImports: ["PrismaClient", "Prisma"],
  },
};

export default nextConfig;
