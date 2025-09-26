-- 개발용 데이터 백업 스크립트
-- 이 스크립트는 마이그레이션 전에 실행하여 중요한 데이터를 백업합니다

-- 사용자 데이터 백업 (auth.users는 직접 백업할 수 없으므로 profiles만 백업)
CREATE TABLE IF NOT EXISTS dev_backup_profiles AS 
SELECT * FROM public.profiles WHERE role = 'admin';

-- 매장 데이터 백업
CREATE TABLE IF NOT EXISTS dev_backup_stores AS 
SELECT * FROM public.stores;

-- 상품 데이터 백업
CREATE TABLE IF NOT EXISTS dev_backup_products AS 
SELECT * FROM public.products;

-- 예약 데이터 백업
CREATE TABLE IF NOT EXISTS dev_backup_reservations AS 
SELECT * FROM public.reservations;
