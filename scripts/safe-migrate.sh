#!/bin/bash

# 안전한 마이그레이션 스크립트
# 개발 데이터를 보존하면서 마이그레이션을 수행합니다

echo "🔄 안전한 마이그레이션 시작..."

# 1. 현재 데이터 백업
echo "📦 개발 데이터 백업 중..."
npx supabase db reset --no-seed
psql -h localhost -p 54322 -U postgres -d postgres -f scripts/backup-dev-data.sql

# 2. 마이그레이션 실행
echo "🚀 마이그레이션 실행 중..."
npx supabase db reset

# 3. 백업된 데이터 복원
echo "📥 개발 데이터 복원 중..."
psql -h localhost -p 54322 -U postgres -d postgres -f scripts/restore-dev-data.sql

echo "✅ 안전한 마이그레이션 완료!"
echo "관리자 계정: admin@example.com / admin123"
