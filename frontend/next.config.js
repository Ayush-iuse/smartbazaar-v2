/** @type {import('next').NextConfig} */
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WS_URL',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_ENVIRONMENT'
];

const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.warn(`\x1b[33m[WARNING] Missing frontend environment variables on startup: ${missing.join(', ')}\x1b[0m`);
} else {
  console.log(`\x1b[32m[INFO] All required frontend environment variables are set: ${requiredEnvVars.join(', ')}\x1b[0m`);
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '127.0.0.1', 'res.cloudinary.com'],
  },

  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
