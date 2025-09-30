import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 외부 스크립트 허용 (카카오 SDK, 네이버 지도 API)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net https://oapi.map.naver.com https://nrbe.map.naver.net http://oapi.map.naver.com http://nrbe.map.naver.net; img-src 'self' data: https: http:; connect-src 'self' https: http:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
