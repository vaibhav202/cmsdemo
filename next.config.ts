import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.205.238.197", "127.0.0.1", "192.168.1.*", "local-origin.dev", "*.local-origin.dev"],
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  turbopack: {
    root: __dirname,
  },
}

export default withNextIntl(nextConfig)
