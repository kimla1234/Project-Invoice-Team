/** @type {import("next").NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    domains: ["encrypted-tbn0.gstatic.com"],
    remotePatterns: [
       { protocol: "https", hostname: "ozmobiles.com.au", pathname: "/**" },
      { protocol: "https", hostname: "macfinder.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "storage.iserp.cloud", pathname: "/**" },
      { protocol: "https", hostname: "kaas.hpcloud.hp.com", pathname: "/**" },
      { protocol: "https", hostname: "i5.walmartimages.com", pathname: "/**" },
      { protocol: "https", hostname: "gearstudiokh.com", pathname: "/**" },
      { protocol: "https", hostname: "t4.ftcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/media/**',
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/**",
      },
    ],
  }
};

export default nextConfig;
