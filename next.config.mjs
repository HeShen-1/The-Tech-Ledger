/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // content/digest 需要打进 serverless bundle：reports 页面与快照 API 在运行时读取
    outputFileTracingIncludes: {
      "/reports/**": ["./content/digest/**"],
      "/api/reports/**": ["./content/digest/**"],
    },
  },
  headers: () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
