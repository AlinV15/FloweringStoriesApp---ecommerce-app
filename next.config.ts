import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ========== OPTIMIZARE IMAGINI ==========
  images: {
    // Domeniile tale existente + îmbunătățiri
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],

    // AVIF primul - cel mai eficient format
    formats: ['image/avif', 'image/webp'],

    // Dimensiuni responsive optimizate pentru dispozitive reale
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache pentru performanță
    minimumCacheTTL: 31536000, // 1 an (în secunde)

    // Calitate optimizată
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ========== OPTIMIZARE COMPILER ==========
  compiler: {
    // Elimină console.log-uri doar în producție
    removeConsole: process.env.NODE_ENV === 'production',

    // Optimizare pentru React
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid$']
    } : false,
  },

  // ========== OPTIMIZARE GENERALE ==========
  // Compresia automată pentru toate răspunsurile
  compress: true,

  // PoweredBy header îndepărtat pentru securitate
  poweredByHeader: false,

  // Redirectare automată trailing slash
  trailingSlash: false,

  // ========== EXPERIMENTAL FEATURES ==========
  experimental: {
    // Paralelizare pentru build-uri mai rapide
    cpus: Math.max(1, (require('os').cpus()?.length ?? 1) - 1),

    // Optimizări pentru build mai rapid
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },

  // ========== HEADERS PENTRU CACHE ==========
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets agresiv - Next.js static files
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache pentru favicon
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache imagini din public folder
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ========== REDIRECTS PENTRU SEO ==========
  async redirects() {
    return [
      // Exemplu: redirect www la non-www (decomentează dacă ai nevoie)
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.example.com' }],
      //   destination: 'https://example.com/:path*',
      //   permanent: true,
      // },
    ];
  },

  // ========== REWRITE RULES ==========
  async rewrites() {
    return [
      // Exemplu pentru API proxy (decomentează dacă ai nevoie)
      // {
      //   source: '/api/proxy/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "alinviorelciobanu",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});

// ========== CONFIGURARE PACKAGE.JSON ==========
/*
Adaugă aceste scripturi în package.json:

{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "start": "next start",
    "lint": "next lint",
    "check-size": "npx next build --debug"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.0.0"
  }
}

Pentru analiza bundle-ului, creează: next.config.analyze.js
-------------------------------------------------------
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // configurația ta aici
})
*/