-- 개발용 데이터 복원 스크립트
-- 마이그레이션 후에 실행하여 백업된 데이터를 복원합니다

-- 프로필 데이터 복원 (관리자 계정)
INSERT INTO public.profiles 
SELECT * FROM dev_backup_profiles 
ON CONFLICT (user_id) DO NOTHING;

-- 매장 데이터 복원
INSERT INTO public.stores 
SELECT * FROM dev_backup_stores 
ON CONFLICT (id) DO NOTHING;

-- 상품 데이터 복원
INSERT INTO public.products 
SELECT * FROM dev_backup_products 
ON CONFLICT (id) DO NOTHING;

-- 예약 데이터 복원
INSERT INTO public.reservations 
SELECT * FROM dev_backup_reservations 
ON CONFLICT (id) DO NOTHING;

-- 백업 테이블 정리
DROP TABLE IF EXISTS dev_backup_profiles;
DROP TABLE IF EXISTS dev_backup_stores;
DROP TABLE IF EXISTS dev_backup_products;
DROP TABLE IF EXISTS dev_backup_reservations;
