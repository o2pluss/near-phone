# 카카오 로그인 설정 가이드

## 1. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속하여 로그인
2. "내 애플리케이션" 메뉴에서 새 애플리케이션 생성
3. 앱 이름과 사업자명 입력 후 저장

## 2. 플랫폼 설정

1. 생성된 애플리케이션의 "앱 설정" → "플랫폼" 메뉴
2. "Web 플랫폼 등록" 클릭
3. 사이트 도메인 입력:
   - 개발: `http://localhost:3000`
   - 운영: `https://yourdomain.com`

## 3. 카카오 로그인 활성화

1. "제품 설정" → "카카오 로그인" 메뉴
2. "카카오 로그인" 활성화
3. "Redirect URI" 설정:
   - 개발: `http://localhost:3000/auth/kakao/callback`
   - 운영: `https://yourdomain.com/auth/kakao/callback`

## 4. 동의 항목 설정

1. "카카오 로그인" → "동의항목" 메뉴
2. 다음 항목들을 필수 동의로 설정:
   - 프로필 정보(닉네임/프로필 사진)

## 5. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 카카오 로그인 설정
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key
```

카카오 앱 키는 "앱 설정" → "앱 키" 메뉴에서 확인할 수 있습니다.

## 6. 사용 가능한 데이터

현재 구현에서는 다음 데이터만 가져올 수 있습니다:
- 카카오 ID (고유 식별자)
- 닉네임 (사용자 이름)

이메일과 연락처는 별도 인증이 필요하므로 현재 구현에서는 제외되었습니다.

## 7. 테스트

1. 개발 서버 실행: `npm run dev`
2. 로그인 페이지 접속: `http://localhost:3000/auth/login`
3. "사용자" 탭에서 "카카오로 로그인" 버튼 클릭
4. 카카오 로그인 페이지로 리다이렉트
5. 로그인 및 동의 완료 후 콜백 페이지에서 처리
6. 로그인 성공 후 메인 페이지로 리다이렉트

## 8. SDK 버전

현재 사용 중인 카카오 JavaScript SDK 버전: **2.7.8** (최신)
