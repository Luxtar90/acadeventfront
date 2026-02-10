/** @type {import('next').NextConfig} */
const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://acadeventfrontfinal.vercel.app";
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const apiBaseUrl = normalizedBaseUrl.startsWith("http")
  ? normalizedBaseUrl
  : `https://${normalizedBaseUrl}`;

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
