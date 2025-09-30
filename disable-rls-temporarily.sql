-- 임시로 RLS 비활성화 (개발 환경에서만 사용)
-- 프로덕션 환경에서는 절대 사용하지 마세요!

-- favorites 테이블의 RLS 비활성화
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;

-- 확인용 쿼리
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'favorites';

-- 다시 활성화하려면:
-- ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;