// Device Models API 테스트 스크립트
// Node.js 환경에서 실행: node scripts/test-device-models-api.js

const BASE_URL = 'http://localhost:3000';

async function testDeviceModelsAPI() {
  console.log('=== Device Models API 테스트 시작 ===\n');

  try {
    // 1. GET /api/device-models 테스트
    console.log('1. GET /api/device-models 테스트');
    const getResponse = await fetch(`${BASE_URL}/api/device-models?page=1&limit=5`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET 요청 성공');
      console.log(`총 ${getData.total}개 데이터, ${getData.totalPages}페이지`);
      console.log('샘플 데이터:');
      getData.data.slice(0, 2).forEach(item => {
        console.log(`  - ${item.deviceName} (${item.modelName}) - ${item.manufacturer}`);
      });
    } else {
      console.log('❌ GET 요청 실패:', getData);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 2. POST /api/device-models 테스트 (새 단말기 추가)
    console.log('2. POST /api/device-models 테스트');
    const newDevice = {
      manufacturer: 'SAMSUNG',
      device_name: '갤럭시 S25',
      model_name: 'SM-S930N',
      supported_carriers: ['SKT', 'KT', 'LG_U_PLUS'],
      supported_storage: ['128GB', '256GB', '512GB'],
      image_url: null
    };

    const postResponse = await fetch(`${BASE_URL}/api/device-models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDevice)
    });

    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST 요청 성공');
      console.log(`생성된 단말기: ${postData.deviceName} (${postData.modelName})`);
      
      // 3. 생성된 단말기 조회 테스트
      console.log('\n3. 생성된 단말기 조회 테스트');
      const getByIdResponse = await fetch(`${BASE_URL}/api/device-models/${postData.id}`);
      const getByIdData = await getByIdResponse.json();
      
      if (getByIdResponse.ok) {
        console.log('✅ GET by ID 요청 성공');
        console.log(`조회된 단말기: ${getByIdData.deviceName} (${getByIdData.modelName})`);
      } else {
        console.log('❌ GET by ID 요청 실패:', getByIdData);
      }

      // 4. 단말기 수정 테스트
      console.log('\n4. 단말기 수정 테스트');
      const updateData = {
        ...newDevice,
        device_name: '갤럭시 S25 Ultra',
        model_name: 'SM-S935N'
      };

      const putResponse = await fetch(`${BASE_URL}/api/device-models/${postData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const putData = await putResponse.json();
      
      if (putResponse.ok) {
        console.log('✅ PUT 요청 성공');
        console.log(`수정된 단말기: ${putData.deviceName} (${putData.modelName})`);
      } else {
        console.log('❌ PUT 요청 실패:', putData);
      }

      // 5. 단말기 삭제 테스트
      console.log('\n5. 단말기 삭제 테스트');
      const deleteResponse = await fetch(`${BASE_URL}/api/device-models/${postData.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log('✅ DELETE 요청 성공');
      } else {
        const deleteData = await deleteResponse.json();
        console.log('❌ DELETE 요청 실패:', deleteData);
      }

    } else {
      console.log('❌ POST 요청 실패:', postData);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 6. 검색 API 테스트
    console.log('6. 검색 API 테스트');
    const searchResponse = await fetch(`${BASE_URL}/api/device-models/search?q=갤럭시`);
    const searchData = await searchResponse.json();
    
    if (searchResponse.ok) {
      console.log('✅ 검색 요청 성공');
      console.log(`검색 결과: ${searchData.length}개`);
      searchData.slice(0, 2).forEach(item => {
        console.log(`  - ${item.deviceName} (${item.modelName})`);
      });
    } else {
      console.log('❌ 검색 요청 실패:', searchData);
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 테스트 실행
testDeviceModelsAPI();
