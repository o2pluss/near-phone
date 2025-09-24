# Near Phone

스마트폰 매장 찾기 서비스 - 가까운 매장에서 최적의 가격으로 스마트폰을 구매하세요.

## 🚀 주요 기능

- **매장 검색**: 위치 기반 매장 검색 및 지도 표시
- **상품 비교**: 다양한 매장의 상품 가격 및 조건 비교
- **필터링**: 통신사, 용량, 가격대, 가입유형 등 다양한 필터
- **예약 시스템**: 매장 방문 예약 및 관리
- **리뷰 시스템**: 매장 리뷰 및 평점 확인

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: Zustand, React Query
- **Maps**: Kakao Map API
- **Forms**: React Hook Form, Zod

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 🌐 환경 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 사용법

1. **매장 검색**: 메인 화면에서 원하는 스마트폰 모델을 선택
2. **필터 적용**: 통신사, 용량, 가격대 등 필터 설정
3. **매장 비교**: 목록 또는 지도에서 매장 정보 확인
4. **예약하기**: 원하는 매장에서 방문 예약

## 🗄 데이터베이스

Supabase를 사용하여 다음 테이블들을 관리합니다:

- `users`: 사용자 정보
- `stores`: 매장 정보
- `products`: 상품 정보
- `store_products`: 매장별 상품 가격 및 조건
- `reservations`: 예약 정보
- `reviews`: 리뷰 정보
- `favorites`: 즐겨찾기 매장

## 📄 API 문서

API 문서는 `docs/api.md`와 `openapi.yaml`에서 확인할 수 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.