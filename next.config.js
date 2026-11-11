const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');
/** @type {import('next').NextConfig} */
const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL && new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.1.59'],

  async redirects() {
    return [
      {
        source: '/webmail',
        destination: 'https://dino.hostinglabs.net:2096/',
        permanent: false,
      },
    ];
  },

  images: {
    remotePatterns: [
      ...(storageOrigin
        ? [{ protocol: storageOrigin.protocol.slice(0, -1), hostname: storageOrigin.hostname, port: storageOrigin.port, pathname: '/storage/v1/object/public/**' }]
        : []),
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
    ],
  },

  // i18n se gestiona por next-intl, no es necesario aquí
};

module.exports = withNextIntl(nextConfig);