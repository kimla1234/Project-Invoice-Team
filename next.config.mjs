/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
       { protocol: "https", hostname: "ozmobiles.com.au", pathname: "/**" },
      { protocol: "https", hostname: "macfinder.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "storage.iserp.cloud", pathname: "/**" },
      { protocol: "https", hostname: "kaas.hpcloud.hp.com", pathname: "/**" },
      { protocol: "https", hostname: "i5.walmartimages.com", pathname: "/**" },
      { protocol: "https", hostname: "gearstudiokh.com", pathname: "/**" },
      { protocol: "https", hostname: "t4.ftcdn.net", pathname: "/**" },
    ],
  }
};

export default nextConfig;
