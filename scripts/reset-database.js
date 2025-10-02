#!/usr/bin/env node

/**
 * 데이터베이스 리셋 스크립트
 * 모든 기존 데이터를 삭제하고 샘플 데이터를 삽입합니다.
 * 
 * 사용법:
 * node scripts/reset-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDatabase() {
  console.log('🔄 데이터베이스 리셋을 시작합니다...\n');

  try {
    // 1. 모든 데이터 삭제
    console.log('1️⃣ 기존 데이터 삭제 중...');
    
    const deleteOperations = [
      { table: 'reviews', name: '리뷰' },
      { table: 'reservations', name: '예약' },
      { table: 'favorites', name: '즐겨찾기' },
      { table: 'product_price_history', name: '상품 가격 이력' },
      { table: 'product_status_history', name: '상품 상태 이력' },
      { table: 'product_tables', name: '상품 테이블' },
      { table: 'store_products', name: '매장 상품' },
      { table: 'products', name: '상품' },
      { table: 'device_models', name: '단말기 모델' }
    ];

    for (const operation of deleteOperations) {
      try {
        const { error } = await supabase
          .from(operation.table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 레코드 삭제
        
        if (error) {
          console.log(`   ⚠️  ${operation.name} 삭제 중 오류 (테이블이 없을 수 있음): ${error.message}`);
        } else {
          console.log(`   ✅ ${operation.name} 삭제 완료`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${operation.name} 삭제 중 오류: ${err.message}`);
      }
    }

    console.log('\n2️⃣ 샘플 단말기 모델 데이터 삽입 중...');

    // 2. 샘플 단말기 모델 데이터 삽입
    const sampleDevices = [
      {
        manufacturer: 'SAMSUNG',
        device_name: 'Galaxy S24 Ultra',
        model_name: 'S24 Ultra',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['256GB', '512GB', '1TB'],
        image_url: 'https://images.samsung.com/kr/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-kv.jpg'
      },
      {
        manufacturer: 'SAMSUNG',
        device_name: 'Galaxy S24+',
        model_name: 'S24 Plus',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['128GB', '256GB', '512GB'],
        image_url: 'https://images.samsung.com/kr/smartphones/galaxy-s24-plus/images/galaxy-s24-plus-highlights-kv.jpg'
      },
      {
        manufacturer: 'SAMSUNG',
        device_name: 'Galaxy S24',
        model_name: 'S24',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['128GB', '256GB', '512GB'],
        image_url: 'https://images.samsung.com/kr/smartphones/galaxy-s24/images/galaxy-s24-highlights-kv.jpg'
      },
      {
        manufacturer: 'SAMSUNG',
        device_name: 'Galaxy Z Fold5',
        model_name: 'Z Fold5',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['256GB', '512GB', '1TB'],
        image_url: 'https://images.samsung.com/kr/smartphones/galaxy-z-fold5/images/galaxy-z-fold5-highlights-kv.jpg'
      },
      {
        manufacturer: 'SAMSUNG',
        device_name: 'Galaxy Z Flip5',
        model_name: 'Z Flip5',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['256GB', '512GB'],
        image_url: 'https://images.samsung.com/kr/smartphones/galaxy-z-flip5/images/galaxy-z-flip5-highlights-kv.jpg'
      },
      {
        manufacturer: 'APPLE',
        device_name: 'iPhone 15 Pro Max',
        model_name: '15 Pro Max',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['256GB', '512GB', '1TB'],
        image_url: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'
      },
      {
        manufacturer: 'APPLE',
        device_name: 'iPhone 15 Pro',
        model_name: '15 Pro',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['128GB', '256GB', '512GB', '1TB'],
        image_url: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'
      },
      {
        manufacturer: 'APPLE',
        device_name: 'iPhone 15 Plus',
        model_name: '15 Plus',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['128GB', '256GB', '512GB'],
        image_url: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-plus-finish-select-202309-6-7inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'
      },
      {
        manufacturer: 'APPLE',
        device_name: 'iPhone 15',
        model_name: '15',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['128GB', '256GB', '512GB'],
        image_url: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'
      },
      {
        manufacturer: 'APPLE',
        device_name: 'iPhone 14 Pro Max',
        model_name: '14 Pro Max',
        supported_carriers: ['KT', 'SKT', 'LG_U_PLUS'],
        supported_storage: ['128GB', '256GB', '512GB', '1TB'],
        image_url: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deep-purple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841892'
      }
    ];

    const { data: insertedDevices, error: insertError } = await supabase
      .from('device_models')
      .insert(sampleDevices)
      .select();

    if (insertError) {
      throw new Error(`단말기 모델 삽입 실패: ${insertError.message}`);
    }

    console.log(`   ✅ ${insertedDevices.length}개의 단말기 모델 삽입 완료`);

    // 3. 결과 확인
    console.log('\n3️⃣ 결과 확인 중...');
    
    const { data: deviceCount, error: countError } = await supabase
      .from('device_models')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log(`   ⚠️  카운트 조회 오류: ${countError.message}`);
    } else {
      console.log(`   📊 총 ${deviceCount}개의 단말기 모델이 등록되었습니다.`);
    }

    // 4. 삽입된 데이터 목록 출력
    const { data: devices, error: listError } = await supabase
      .from('device_models')
      .select('id, manufacturer, device_name, model_name, supported_carriers, supported_storage')
      .order('manufacturer', { ascending: true })
      .order('device_name', { ascending: true });

    if (!listError && devices) {
      console.log('\n📱 등록된 단말기 모델 목록:');
      devices.forEach((device, index) => {
        console.log(`   ${index + 1}. ${device.manufacturer} ${device.device_name} (${device.model_name})`);
        console.log(`      통신사: ${device.supported_carriers.join(', ')}`);
        console.log(`      용량: ${device.supported_storage.join(', ')}`);
        console.log('');
      });
    }

    console.log('🎉 데이터베이스 리셋이 완료되었습니다!');
    console.log('이제 새로운 데이터로 테스트를 시작할 수 있습니다.');

  } catch (error) {
    console.error('❌ 데이터베이스 리셋 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
resetDatabase();
