#!/usr/bin/env node

/**
 * 정기적 하드 삭제 스크립트
 * 1년 이상 된 삭제된 상품과 상품 테이블을 완전 삭제합니다.
 * 
 * 사용법:
 * node scripts/cleanup-deleted-data.js [--dry-run] [--days=365]
 * 
 * 옵션:
 * --dry-run: 실제 삭제하지 않고 로그만 출력
 * --days: 삭제 기준 일수 (기본값: 365일)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 명령행 인수 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const daysArg = args.find(arg => arg.startsWith('--days='));
const days = daysArg ? parseInt(daysArg.split('=')[1]) : 365;

console.log(`🧹 삭제된 데이터 정리 시작 (${isDryRun ? 'DRY RUN' : '실제 실행'})`);
console.log(`📅 삭제 기준: ${days}일 이상 된 데이터`);
console.log('');

async function cleanupDeletedData() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString();

    console.log(`⏰ 기준 날짜: ${cutoffDateStr}`);

    // 1. 삭제된 상품 조회
    const { data: deletedProducts, error: productsError } = await supabase
      .from('products')
      .select('id, created_at, deleted_at, deletion_reason')
      .or('is_active.eq.false,deleted_at.not.is.null')
      .lt('deleted_at', cutoffDateStr);

    if (productsError) {
      throw new Error(`삭제된 상품 조회 실패: ${productsError.message}`);
    }

    // 2. 삭제된 상품 테이블 조회
    const { data: deletedTables, error: tablesError } = await supabase
      .from('product_tables')
      .select('id, created_at, deleted_at, deletion_reason')
      .or('is_active.eq.false,deleted_at.not.is.null')
      .lt('deleted_at', cutoffDateStr);

    if (tablesError) {
      throw new Error(`삭제된 상품 테이블 조회 실패: ${tablesError.message}`);
    }

    console.log(`📦 삭제 대상 상품: ${deletedProducts?.length || 0}개`);
    console.log(`📋 삭제 대상 상품 테이블: ${deletedTables?.length || 0}개`);

    if (isDryRun) {
      console.log('\n🔍 DRY RUN 모드 - 실제 삭제하지 않습니다.');
      
      if (deletedProducts?.length > 0) {
        console.log('\n삭제될 상품들:');
        deletedProducts.forEach((product, index) => {
          console.log(`  ${index + 1}. ID: ${product.id}, 삭제일: ${product.deleted_at}, 사유: ${product.deletion_reason}`);
        });
      }

      if (deletedTables?.length > 0) {
        console.log('\n삭제될 상품 테이블들:');
        deletedTables.forEach((table, index) => {
          console.log(`  ${index + 1}. ID: ${table.id}, 삭제일: ${table.deleted_at}, 사유: ${table.deletion_reason}`);
        });
      }

      return;
    }

    // 3. 실제 삭제 실행
    let deletedProductsCount = 0;
    let deletedTablesCount = 0;

    // 상품 삭제
    if (deletedProducts?.length > 0) {
      const productIds = deletedProducts.map(p => p.id);
      const { error: deleteProductsError } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

      if (deleteProductsError) {
        throw new Error(`상품 삭제 실패: ${deleteProductsError.message}`);
      }

      deletedProductsCount = productIds.length;
      console.log(`✅ ${deletedProductsCount}개의 상품이 완전 삭제되었습니다.`);
    }

    // 상품 테이블 삭제
    if (deletedTables?.length > 0) {
      const tableIds = deletedTables.map(t => t.id);
      const { error: deleteTablesError } = await supabase
        .from('product_tables')
        .delete()
        .in('id', tableIds);

      if (deleteTablesError) {
        throw new Error(`상품 테이블 삭제 실패: ${deleteTablesError.message}`);
      }

      deletedTablesCount = tableIds.length;
      console.log(`✅ ${deletedTablesCount}개의 상품 테이블이 완전 삭제되었습니다.`);
    }

    // 4. 정리 작업 로그 기록
    const { error: logError } = await supabase
      .from('system_logs')
      .insert({
        action: 'cleanup_old_deleted_data',
        details: `Cleaned up ${deletedProductsCount} products and ${deletedTablesCount} product tables older than ${days} days`,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.warn(`⚠️ 로그 기록 실패: ${logError.message}`);
    }

    console.log('\n🎉 정리 작업이 완료되었습니다!');
    console.log(`📊 총 삭제된 항목: ${deletedProductsCount + deletedTablesCount}개`);

  } catch (error) {
    console.error('❌ 정리 작업 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
cleanupDeletedData();
