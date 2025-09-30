#!/usr/bin/env bash
set -euo pipefail

# Requirements:
# - SUPABASE_ACCESS_TOKEN: Supabase Dashboard > Account > Access Tokens 에서 발급
# - SUPABASE_PROJECT_REF: Dashboard > Settings > General > Project reference (예: abcdefghijklmnop)

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" || -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "[ERROR] SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF 환경변수를 설정하세요." >&2
  exit 1
fi

echo "[INFO] Supabase CLI 로그인(비대화형)"
supabase login --token "$SUPABASE_ACCESS_TOKEN"

echo "[INFO] Supabase 프로젝트 링크: $SUPABASE_PROJECT_REF"
if ! supabase link --project-ref "$SUPABASE_PROJECT_REF"; then
  echo "[WARN] 이미 링크되어 있거나 일시적 오류일 수 있습니다. 계속 진행합니다."
fi

echo "[INFO] 원격 DB에 migrations 적용 (supabase db push)"
supabase db push

echo "[SUCCESS] 마이그레이션 완료"

# 참고: 운영 환경에서 시드는 권장되지 않습니다. 필요 시 아래 주석을 해제 후 사용하세요.
# echo "[INFO] 시드 적용"
# supabase db reset --use-migra=false --db-url "$(supabase db show-connection-string)" --seed

echo "[DONE] Supabase 프로덕션 동기화 완료"


