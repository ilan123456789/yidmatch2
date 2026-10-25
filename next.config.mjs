
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/jwks-rsa/node_modules/jose/dist/**/*",
      "./node_modules/jose/dist/**/*",
    ],
  },
};

export default nextConfig;
