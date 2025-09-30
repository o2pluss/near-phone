# 네이버 지도 API 연동 가이드

## 📋 개요

이 프로젝트에 네이버 지도 API가 성공적으로 연동되었습니다. 지도보기 페이지에서 실제 네이버 지도를 사용하여 매장 위치를 표시하고 주소 검색 기능을 제공합니다.

## 🚀 주요 기능

### 1. **지도 표시**
- 실제 네이버 지도 API를 사용한 정확한 지도 표시
- 매장 위치에 커스텀 마커 표시
- 지도 컨트롤 (줌, 지도 유형 변경 등)

### 2. **매장 마커**
- 데이터베이스의 실제 매장 데이터를 기반으로 마커 표시
- 마커 클릭 시 매장 정보 표시
- 커스텀 아이콘 사용

### 3. **주소 검색**
- Geocoder를 활용한 주소 검색 기능
- 검색 결과를 지도에 반영
- 현재 위치 찾기 기능

## ⚙️ 설정 방법

### 1. **API 키 발급**
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. 개발자 센터에서 애플리케이션 등록
3. Maps API 선택하여 클라이언트 ID 발급

### 2. **환경 변수 설정**
`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id_here
```

### 3. **Next.js 설정**
`next.config.ts`에 CSP 헤더가 이미 설정되어 있습니다:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://oapi.map.naver.com;",
        },
      ],
    },
  ];
}
```

## 📁 생성된 파일들

### 1. **컴포넌트**
- `src/components/NaverMap.tsx` - 기본 네이버 지도 컴포넌트
- `src/components/NaverMapWithSearch.tsx` - 주소 검색 기능이 포함된 지도 컴포넌트
- `src/components/StoreMapView.tsx` - 기존 컴포넌트를 네이버 지도로 교체

### 2. **타입 정의**
- `src/types/naver-maps.d.ts` - 네이버 지도 API 타입 정의

## 🔧 사용법

### 기본 지도 사용
```tsx
import NaverMap from '@/components/NaverMap';

const stores = [
  {
    id: '1',
    name: '매장명',
    address: '주소',
    latitude: 37.5665,
    longitude: 126.9780,
    phone: '02-1234-5678',
    rating: 4.5,
    reviewCount: 100
  }
];

<NaverMap
  stores={stores}
  onStoreSelect={(store) => console.log(store)}
  center={{ lat: 37.5665, lng: 126.9780 }}
  zoom={10}
  className="w-full h-96"
/>
```

### 주소 검색 기능이 포함된 지도 사용
```tsx
import NaverMapWithSearch from '@/components/NaverMapWithSearch';

<NaverMapWithSearch
  stores={stores}
  onStoreSelect={(store) => console.log(store)}
  center={{ lat: 37.5665, lng: 126.9780 }}
  zoom={10}
  className="w-full h-96"
  showSearch={true}
/>
```

## 🎯 주요 기능 설명

### 매장 마커 표시
- 데이터베이스에서 `latitude`, `longitude`가 있는 활성 매장만 표시
- 커스텀 SVG 아이콘 사용
- 마커 클릭 시 매장 정보 표시

### 주소 검색
- 네이버 Geocoder API 사용
- 검색 결과 목록 표시
- 첫 번째 결과로 지도 중심 이동

### 현재 위치
- HTML5 Geolocation API 사용
- 사용자 현재 위치로 지도 중심 이동

## 🔍 참고 문서

- [네이버 지도 API v3 공식 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [시작하기 가이드](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html)
- [마커 표시 가이드](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Marker.html)
- [Geocoder 사용법](https://navermaps.github.io/maps.js.ncp/docs/tutorial-Geocoder-Geocoding.html)

## ⚠️ 주의사항

1. **API 키 보안**: 클라이언트 ID는 공개되어도 되지만, 서버에서 사용하는 시크릿 키는 절대 노출하지 마세요.

2. **도메인 설정**: 네이버 클라우드 플랫폼에서 사용할 도메인을 정확히 설정해야 합니다.

3. **사용량 제한**: API 사용량 제한을 확인하고 필요시 유료 플랜을 고려하세요.

4. **에러 처리**: 네트워크 오류나 API 오류에 대한 적절한 에러 처리가 구현되어 있습니다.

## 🚀 다음 단계

1. 실제 매장 데이터의 좌표 정보 확인 및 업데이트
2. 거리 계산 로직 구현
3. 매장별 상세 정보 (가격, 조건 등) 연동
4. 지도 성능 최적화 (마커 클러스터링 등)
