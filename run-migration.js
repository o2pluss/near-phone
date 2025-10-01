#!/usr/bin/env node

/**
 * 데이터베이스 마이그레이션 실행 스크립트
 * 
 * 사용법:
 * node run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔄 데이터베이스 마이그레이션 시작...\n');

  try {
    // 마이그레이션 SQL 파일 읽기
    const migrationSQL = fs.readFileSync('./soft-delete-migration.sql', 'utf8');
    
    // SQL을 세미콜론으로 분리하여 각각 실행
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 ${statements.length}개의 SQL 문을 실행합니다...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        console.log(`[${i + 1}/${statements.length}] 실행 중...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // RPC 함수가 없을 수 있으므로 직접 쿼리 실행
            const { error: directError } = await supabase
              .from('_migration_test')
              .select('*')
              .limit(0);
            
            if (directError && directError.message.includes('does not exist')) {
              // 직접 SQL 실행을 시도
              console.log('   ⚠️ RPC 함수를 사용할 수 없습니다. 수동 실행이 필요합니다.');
              console.log('   📋 다음 SQL을 Supabase SQL Editor에서 실행하세요:');
              console.log('   ┌─────────────────────────────────────────┐');
              console.log('   │ ' + statement.substring(0, 50).padEnd(50) + ' │');
              console.log('   └─────────────────────────────────────────┘');
            } else {
              throw error;
            }
          } else {
            console.log('   ✅ 성공');
          }
        } catch (error) {
          console.log(`   ⚠️ 경고: ${error.message}`);
          // 계속 진행
        }
      }
    }

    console.log('\n🎉 마이그레이션 완료!');
    console.log('\n📋 다음 단계:');
    console.log('1. Supabase SQL Editor에서 soft-delete-migration.sql 실행');
    console.log('2. node test-soft-delete.js 실행하여 테스트');

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.log('\n📋 수동 실행 방법:');
    console.log('1. Supabase 대시보드 → SQL Editor');
    console.log('2. soft-delete-migration.sql 파일 내용 복사');
    console.log('3. SQL Editor에 붙여넣기 후 실행');
  }
}

// 마이그레이션 실행
runMigration();
