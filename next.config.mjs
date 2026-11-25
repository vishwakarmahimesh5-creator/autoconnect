/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.31.130"],

  cacheComponents: true,
  partialPrefetching: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;