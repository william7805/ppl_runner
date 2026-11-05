import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  experimental: {
    serverActions: {
      // Les server actions refusent par défaut les envois de plus de 1 Mo.
      // On aligne la limite sur celle de l'action d'import (4 Mo),
      // qui reste sous la limite des fonctions Vercel (environ 4,5 Mo).
      bodySizeLimit: '4mb',
    },
  },
}

export default nextConfig
