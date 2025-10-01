// 상품 관련 API 함수들 (V2 - 통신사+용량 조합 구조)

import { supabase } from './supabaseClient';
import { type DeviceModel } from '../types/product';

export interface CarrierStorageCombination {
  carrier: string;
  storage: string;
  price: number;
  conditions: string[];
  isActive: boolean;
}

export interface Product {
  id: string;
  storeId: string;
  deviceModelId: string;
  carrier: string;
  storage: string;
  price: number;
  conditions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  deviceModelId: string;
  combinations: Omit<CarrierStorageCombination, 'isActive'>[];
}

export interface ProductSearchRequest {
  model?: string;
  carriers?: string[];
  storages?: string[];
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
}

export interface ProductSearchResult {
  id: string;
  model: string;
  manufacturer: string;
  carrier: string;
  storage: string;
  price: number;
  conditions: string[];
  storeName: string;
  storeId: string;
  imageUrl?: string;
}

export interface ModelSearchResult {
  id: string;
  model: string;
  manufacturer: string;
  imageUrl?: string;
  availableCarriers: string[];
  availableStorages: string[];
  minPrice: number;
  maxPrice: number;
  storeCount: number;
}

// 단말기 모델 목록 조회
export async function getDeviceModels(): Promise<DeviceModel[]> {
  const { data, error } = await supabase
    .from('device_models')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('단말기 모델 조회 실패:', error);
    throw error;
  }

  return data.map(model => ({
    id: model.id,
    manufacturer: model.manufacturer,
    model: model.model,
    supportedCarriers: model.supported_carriers || [],
    supportedStorage: model.supported_storage || [],
    imageUrl: model.image_url,
    createdAt: model.created_at
  }));
}

// 특정 단말기 모델 조회
export async function getDeviceModel(id: string): Promise<DeviceModel | null> {
  const { data, error } = await supabase
    .from('device_models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('단말기 모델 조회 실패:', error);
    return null;
  }

  return {
    id: data.id,
    manufacturer: data.manufacturer,
    model: data.model,
    supportedCarriers: data.supported_carriers || [],
    supportedStorage: data.supported_storage || [],
    imageUrl: data.image_url,
    createdAt: data.created_at
  };
}

// 판매자의 상품 목록 조회 (통신사+용량 조합별로 그룹화)
export async function getProductsByStore(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      device_models (
        id,
        manufacturer,
        model,
        supported_carriers,
        supported_storage,
        image_url,
        created_at
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('상품 조회 실패:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    storeId: item.store_id,
    deviceModelId: item.device_model_id,
    carrier: item.carrier,
    storage: item.storage,
    price: item.price,
    conditions: item.conditions || [],
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

// 상품 생성 (통신사+용량 조합별로 개별 레코드 생성)
export async function createProduct(
  storeId: string, 
  request: ProductCreateRequest
): Promise<Product[]> {
  // 먼저 단말기 모델 정보 조회
  const deviceModel = await getDeviceModel(request.deviceModelId);
  if (!deviceModel) {
    throw new Error('단말기 모델을 찾을 수 없습니다');
  }

  // 각 조합별로 상품 생성
  const productInserts = request.combinations.map(combination => ({
    store_id: storeId,
    device_model_id: request.deviceModelId,
    carrier: combination.carrier,
    storage: combination.storage,
    price: combination.price,
    conditions: combination.conditions,
    is_active: true
  }));

  const { data, error } = await supabase
    .from('products')
    .insert(productInserts)
    .select();

  if (error) {
    console.error('상품 생성 실패:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    storeId: item.store_id,
    deviceModelId: item.device_model_id,
    carrier: item.carrier,
    storage: item.storage,
    price: item.price,
    conditions: item.conditions || [],
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

// 상품 업데이트 (기존 조합 삭제 후 새로 생성)
export async function updateProduct(
  deviceModelId: string,
  storeId: string,
  combinations: CarrierStorageCombination[]
): Promise<void> {
  // 기존 상품들 삭제
  await supabase
    .from('products')
    .delete()
    .eq('device_model_id', deviceModelId)
    .eq('store_id', storeId);

  // 새로운 combinations로 상품들 생성
  const productInserts = combinations.map(combination => ({
    store_id: storeId,
    device_model_id: deviceModelId,
    carrier: combination.carrier,
    storage: combination.storage,
    price: combination.price,
    conditions: combination.conditions,
    is_active: combination.isActive
  }));

  const { error } = await supabase
    .from('products')
    .insert(productInserts);

  if (error) {
    console.error('상품 업데이트 실패:', error);
    throw error;
  }
}

// 상품 검색 (고객용)
export async function searchProducts(request: ProductSearchRequest): Promise<ProductSearchResult[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      device_models (
        id,
        manufacturer,
        model,
        image_url
      ),
      seller_applications (
        business_name
      ),
      product_tables (
        id,
        exposure_start_date,
        exposure_end_date,
        is_active
      )
    `)
    .eq('is_active', true)
    .is('deleted_at', null);

  // 필터 적용
  if (request.model) {
    query = query.like('device_models.model', `%${request.model}%`);
  }
  
  if (request.carriers && request.carriers.length > 0) {
    query = query.in('carrier', request.carriers);
  }
  
  if (request.storages && request.storages.length > 0) {
    query = query.in('storage', request.storages);
  }
  
  if (request.minPrice) {
    query = query.gte('price', request.minPrice);
  }
  
  if (request.maxPrice) {
    query = query.lte('price', request.maxPrice);
  }

  // 조건 필터 (배열의 교집합)
  if (request.conditions && request.conditions.length > 0) {
    query = query.overlaps('conditions', request.conditions);
  }

  // 노출기간 필터링 (현재 날짜가 노출기간 내에 있는 상품만)
  const today = new Date().toISOString().split('T')[0];
  query = query
    .lte('product_tables.exposure_start_date', today)
    .gte('product_tables.exposure_end_date', today)

  const { data, error } = await query.order('price', { ascending: true });

  if (error) {
    console.error('상품 검색 실패:', error);
    throw error;
  }

  // 데이터 변환
  const rawProducts = data.map(item => ({
    id: item.id,
    model: item.device_models.model,
    manufacturer: item.device_models.manufacturer,
    carrier: item.carrier,
    storage: item.storage,
    price: item.price,
    conditions: item.conditions || [],
    storeName: item.seller_applications.business_name,
    storeId: item.store_id,
    imageUrl: item.device_models.image_url,
    createdAt: item.created_at
  }));

  // 중복 제거: 같은 모델+통신사+용량+조건 조합 중 최신 데이터만 유지
  const deduplicatedProducts = rawProducts.reduce((acc: any[], product: any) => {
    const key = `${product.model}-${product.carrier}-${product.storage}-${product.conditions.sort().join(',')}`;
    
    const existingIndex = acc.findIndex(p => {
      const existingKey = `${p.model}-${p.carrier}-${p.storage}-${p.conditions.sort().join(',')}`;
      return existingKey === key;
    });
    
    if (existingIndex === -1) {
      // 새로운 조합이면 추가
      acc.push(product);
    } else {
      // 기존 조합이 있으면 더 최신 데이터로 교체
      const existing = acc[existingIndex];
      if (new Date(product.createdAt) > new Date(existing.createdAt)) {
        acc[existingIndex] = product;
      }
    }
    
    return acc;
  }, []);

  return deduplicatedProducts;
}

// 모델 목록 조회 (매장 찾기용 - 통신사/용량 정보 없이)
export async function getModelsForSearch(): Promise<ModelSearchResult[]> {
  const { data, error } = await supabase
    .from('device_models')
    .select(`
      id,
      manufacturer,
      model,
      image_url,
      products!inner (
        carrier,
        storage,
        price,
        is_active
      )
    `)
    .eq('products.is_active', true);

  if (error) {
    console.error('모델 목록 조회 실패:', error);
    throw error;
  }

  // 모델별로 그룹화하여 통계 계산
  const modelMap = new Map<string, ModelSearchResult>();
  
  data.forEach(item => {
    const key = item.id;
    if (!modelMap.has(key)) {
      modelMap.set(key, {
        id: item.id,
        model: item.model,
        manufacturer: item.manufacturer,
        imageUrl: item.image_url,
        availableCarriers: [],
        availableStorages: [],
        minPrice: Infinity,
        maxPrice: 0,
        storeCount: 0
      });
    }
    
    const model = modelMap.get(key)!;
    const product = item.products;
    
    if (!model.availableCarriers.includes(product.carrier)) {
      model.availableCarriers.push(product.carrier);
    }
    
    if (!model.availableStorages.includes(product.storage)) {
      model.availableStorages.push(product.storage);
    }
    
    model.minPrice = Math.min(model.minPrice, product.price);
    model.maxPrice = Math.max(model.maxPrice, product.price);
    model.storeCount++;
  });

  return Array.from(modelMap.values()).map(model => ({
    ...model,
    minPrice: model.minPrice === Infinity ? 0 : model.minPrice
  }));
}

// 상품 삭제
export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('상품 삭제 실패:', error);
    throw error;
  }
}

// 단말기 모델 생성
export async function createDeviceModel(model: Omit<DeviceModel, 'id' | 'createdAt'>): Promise<DeviceModel> {
  const { data, error } = await supabase
    .from('device_models')
    .insert({
      manufacturer: model.manufacturer,
      model: model.model,
      supported_carriers: model.supportedCarriers,
      supported_storage: model.supportedStorage,
      image_url: model.imageUrl
    })
    .select()
    .single();

  if (error) {
    console.error('단말기 모델 생성 실패:', error);
    throw error;
  }

  return {
    id: data.id,
    manufacturer: data.manufacturer,
    model: data.model,
    supportedCarriers: data.supported_carriers || [],
    supportedStorage: data.supported_storage || [],
    imageUrl: data.image_url,
    createdAt: data.created_at
  };
}

// 단말기 모델 업데이트
export async function updateDeviceModel(
  id: string, 
  model: Omit<DeviceModel, 'id' | 'createdAt'>
): Promise<DeviceModel> {
  const { data, error } = await supabase
    .from('device_models')
    .update({
      manufacturer: model.manufacturer,
      model: model.model,
      supported_carriers: model.supportedCarriers,
      supported_storage: model.supportedStorage,
      image_url: model.imageUrl
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('단말기 모델 업데이트 실패:', error);
    throw error;
  }

  return {
    id: data.id,
    manufacturer: data.manufacturer,
    model: data.model,
    supportedCarriers: data.supported_carriers || [],
    supportedStorage: data.supported_storage || [],
    imageUrl: data.image_url,
    createdAt: data.created_at
  };
}

// 단말기 모델 삭제
export async function deleteDeviceModel(id: string): Promise<void> {
  const { error } = await supabase
    .from('device_models')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('단말기 모델 삭제 실패:', error);
    throw error;
  }
}
