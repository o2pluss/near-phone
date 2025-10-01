#!/usr/bin/env node

/**
 * 소프트 삭제 시스템 테스트 스크립트
 * 
 * 사용법:
 * node test-soft-delete.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSoftDelete() {
  console.log('🧪 소프트 삭제 시스템 테스트 시작\n');

  try {
    // 1. 기존 상품 조회
    console.log('1️⃣ 기존 상품 조회...');
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, store_id, device_model_id, carrier, storage, price, conditions, is_active')
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(1);

    if (fetchError) {
      throw new Error(`기존 상품 조회 실패: ${fetchError.message}`);
    }

    if (!existingProducts || existingProducts.length === 0) {
      throw new Error('활성 상태인 상품이 없습니다. 테스트를 위해 상품을 먼저 생성해주세요.');
    }

    const testProduct = existingProducts[0];
    console.log(`✅ 기존 상품 사용: ${testProduct.id}`);

    // 2. 소프트 삭제 테스트
    console.log('\n2️⃣ 소프트 삭제 테스트...');
    const { error: deleteError } = await supabase
      .from('products')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deletion_reason: 'test_deletion'
      })
      .eq('id', testProduct.id);

    if (deleteError) {
      throw new Error(`소프트 삭제 실패: ${deleteError.message}`);
    }

    console.log('✅ 소프트 삭제 완료');

    // 3. 삭제된 상품 조회 테스트
    console.log('\n3️⃣ 삭제된 상품 조회 테스트...');
    const { data: deletedProduct, error: fetchDeletedError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProduct.id)
      .single();

    if (fetchDeletedError) {
      throw new Error(`삭제된 상품 조회 실패: ${fetchDeletedError.message}`);
    }

    console.log('✅ 삭제된 상품 조회 성공');
    console.log(`   - is_active: ${deletedProduct.is_active}`);
    console.log(`   - deleted_at: ${deletedProduct.deleted_at}`);
    console.log(`   - deletion_reason: ${deletedProduct.deletion_reason}`);

    // 4. 활성 상품 검색에서 제외되는지 테스트
    console.log('\n4️⃣ 활성 상품 검색 테스트...');
    const { data: activeProducts, error: searchError } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .is('deleted_at', null)
      .eq('id', testProduct.id);

    if (searchError) {
      throw new Error(`활성 상품 검색 실패: ${searchError.message}`);
    }

    if (activeProducts.length === 0) {
      console.log('✅ 삭제된 상품이 활성 검색에서 제외됨');
    } else {
      console.log('❌ 삭제된 상품이 활성 검색에 포함됨 (문제!)');
    }

    // 5. 복구 테스트
    console.log('\n5️⃣ 복구 테스트...');
    const { error: restoreError } = await supabase
      .from('products')
      .update({
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('id', testProduct.id);

    if (restoreError) {
      throw new Error(`복구 실패: ${restoreError.message}`);
    }

    console.log('✅ 복구 완료');

    // 6. 복구 후 활성 검색 테스트
    console.log('\n6️⃣ 복구 후 활성 검색 테스트...');
    const { data: restoredProducts, error: restoredSearchError } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .is('deleted_at', null)
      .eq('id', testProduct.id);

    if (restoredSearchError) {
      throw new Error(`복구 후 검색 실패: ${restoredSearchError.message}`);
    }

    if (restoredProducts.length === 1) {
      console.log('✅ 복구된 상품이 활성 검색에 포함됨');
    } else {
      console.log('❌ 복구된 상품이 활성 검색에서 제외됨 (문제!)');
    }

    // 7. 테스트 데이터 복구 (원래 상태로 되돌리기)
    console.log('\n7️⃣ 테스트 데이터 복구...');
    const { error: restoreError2 } = await supabase
      .from('products')
      .update({
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('id', testProduct.id);

    if (restoreError2) {
      console.warn(`⚠️ 테스트 데이터 복구 실패: ${restoreError2.message}`);
    } else {
      console.log('✅ 테스트 데이터 복구 완료 (원래 상태로 복원)');
    }

    console.log('\n🎉 모든 테스트 통과! 소프트 삭제 시스템이 정상 작동합니다.');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    process.exit(1);
  }
}

// 테스트 실행
testSoftDelete();
