/** @type {import('next').NextConfig} */
const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://acadeventfrontfinal-2vvt3hbx7-luxs-projects-7904e8a4.vercel.app"
).replace(
  /\/$/,
  ""
);

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
