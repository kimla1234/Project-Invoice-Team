/** @type {import("next").NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: 'standalone',
  // --- ADD THIS SECTION ---
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://34.158.60.52:16800/api/v1/:path*',
      },
    ];
  },
  images: {
    domains: ["encrypted-tbn0.gstatic.com" , "34.158.60.52:16800"],
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
      {
        protocol: 'http',
        hostname: '34.158.60.52',
        port: '16800',
        pathname: '/media/**',
      },
    ],
  }
  
};

export default nextConfig;
