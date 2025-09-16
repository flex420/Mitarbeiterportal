/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  reactStrictMode: true,
  compress: true,
  i18n: {
    locales: ["de"],
    defaultLocale: "de"
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "geolocation=()" },
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'"
        }
      ]
    }
  ]
};

export default nextConfig;
