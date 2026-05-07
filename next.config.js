/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/parisrp",
        destination: "https://lively-dusk-33d860.netlify.app/",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
