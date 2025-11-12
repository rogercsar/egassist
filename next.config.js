/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removendo experimental.serverActions - já habilitado por padrão no Next 16
  experimental: {},
  // Define raiz do Turbopack para evitar warnings de múltiplos lockfiles
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig