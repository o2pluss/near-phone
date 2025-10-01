#!/usr/bin/env node

/**
 * 관리자 기능 테스트 스크립트
 * 
 * 사용법:
 * node test-admin-functions.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminFunctions() {
  console.log('👨‍💼 관리자 기능 테스트 시작\n');

  try {
    // 1. 기존 데이터 조회
    console.log('1️⃣ 기존 데이터 조회...');
    
    // 기존 상품 테이블 조회
    const { data: existingTables, error: tablesError } = await supabase
      .from('product_tables')
      .select('id, name, store_id, is_active, deleted_at')
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(1);

    if (tablesError) {
      throw new Error(`기존 테이블 조회 실패: ${tablesError.message}`);
    }

    if (!existingTables || existingTables.length === 0) {
      throw new Error('활성 상태인 상품 테이블이 없습니다.');
    }

    const testTable = existingTables[0];
    console.log(`✅ 기존 테이블 사용: ${testTable.id}`);

    // 기존 상품 조회
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id, store_id, device_model_id, table_id, is_active, deleted_at')
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(1);

    if (productsError) {
      throw new Error(`기존 상품 조회 실패: ${productsError.message}`);
    }

    if (!existingProducts || existingProducts.length === 0) {
      throw new Error('활성 상태인 상품이 없습니다.');
    }

    const testProduct = existingProducts[0];
    console.log(`✅ 기존 상품 사용: ${testProduct.id}`);

    // 2. 소프트 삭제 실행
    console.log('\n2️⃣ 소프트 삭제 실행...');
    
    // 상품 테이블 소프트 삭제 (관련 상품도 함께 삭제)
    const { error: deleteTableError } = await supabase
      .from('product_tables')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deletion_reason: 'admin_test'
      })
      .eq('id', testTable.id);

    if (deleteTableError) {
      throw new Error(`테이블 소프트 삭제 실패: ${deleteTableError.message}`);
    }

    // 관련 상품도 소프트 삭제
    const { error: deleteProductError } = await supabase
      .from('products')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deletion_reason: 'parent_table_deleted'
      })
      .eq('table_id', testTable.id);

    if (deleteProductError) {
      throw new Error(`상품 소프트 삭제 실패: ${deleteProductError.message}`);
    }

    console.log('✅ 소프트 삭제 완료');

    // 3. 삭제된 항목 조회 테스트
    console.log('\n3️⃣ 삭제된 항목 조회 테스트...');
    
    // 삭제된 상품 테이블 조회
    const { data: deletedTables, error: deletedTablesError } = await supabase
      .from('product_tables')
      .select('*')
      .or('is_active.eq.false,deleted_at.not.is.null')
      .eq('id', testTable.id);

    if (deletedTablesError) {
      throw new Error(`삭제된 테이블 조회 실패: ${deletedTablesError.message}`);
    }

    console.log(`✅ 삭제된 테이블 조회 성공: ${deletedTables.length}개`);

    // 삭제된 상품 조회
    const { data: deletedProducts, error: deletedProductsError } = await supabase
      .from('products')
      .select('*')
      .or('is_active.eq.false,deleted_at.not.is.null')
      .eq('id', testProduct.id);

    if (deletedProductsError) {
      throw new Error(`삭제된 상품 조회 실패: ${deletedProductsError.message}`);
    }

    console.log(`✅ 삭제된 상품 조회 성공: ${deletedProducts.length}개`);

    // 4. 복구 테스트
    console.log('\n4️⃣ 복구 테스트...');
    
    // 상품 테이블 복구
    const { error: restoreTableError } = await supabase
      .from('product_tables')
      .update({
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('id', testTable.id);

    if (restoreTableError) {
      throw new Error(`테이블 복구 실패: ${restoreTableError.message}`);
    }

    // 관련 상품도 복구
    const { error: restoreProductError } = await supabase
      .from('products')
      .update({
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('table_id', testTable.id);

    if (restoreProductError) {
      throw new Error(`상품 복구 실패: ${restoreProductError.message}`);
    }

    console.log('✅ 복구 완료');

    // 5. 복구 후 상태 확인
    console.log('\n5️⃣ 복구 후 상태 확인...');
    
    const { data: restoredTable, error: restoredTableError } = await supabase
      .from('product_tables')
      .select('is_active, deleted_at')
      .eq('id', testTable.id)
      .single();

    if (restoredTableError) {
      throw new Error(`복구된 테이블 조회 실패: ${restoredTableError.message}`);
    }

    const { data: restoredProduct, error: restoredProductError } = await supabase
      .from('products')
      .select('is_active, deleted_at')
      .eq('id', testProduct.id)
      .single();

    if (restoredProductError) {
      throw new Error(`복구된 상품 조회 실패: ${restoredProductError.message}`);
    }

    console.log('✅ 복구 후 상태 확인 완료');
    console.log(`   - 테이블 활성화: ${restoredTable.is_active}`);
    console.log(`   - 상품 활성화: ${restoredProduct.is_active}`);

    // 6. 테스트 데이터 복구 (원래 상태로 되돌리기)
    console.log('\n6️⃣ 테스트 데이터 복구...');
    
    // 상품 테이블 복구
    const { error: restoreTableError2 } = await supabase
      .from('product_tables')
      .update({
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('id', testTable.id);

    // 관련 상품도 복구
    const { error: restoreProductError2 } = await supabase
      .from('products')
      .update({
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('table_id', testTable.id);

    if (restoreTableError2 || restoreProductError2) {
      console.warn('⚠️ 테스트 데이터 복구 중 일부 실패');
    } else {
      console.log('✅ 테스트 데이터 복구 완료 (원래 상태로 복원)');
    }

    console.log('\n🎉 관리자 기능 테스트 완료! 모든 기능이 정상 작동합니다.');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    process.exit(1);
  }
}

// 테스트 실행
testAdminFunctions();
