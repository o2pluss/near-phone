/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dev-anon-key',
  },
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
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net https://oapi.map.naver.com https://nrbe.map.naver.net https://nrbe.pstatic.net http://oapi.map.naver.com http://nrbe.map.naver.net; img-src 'self' data: https: http: blob:; connect-src 'self' https: http:; font-src 'self'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
