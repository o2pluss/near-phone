"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Save, Copy, X, Plus } from "lucide-react";
import { 
  ADDITIONAL_CONDITIONS, 
  CONDITION_DISPLAY_NAMES, 
  type AdditionalConditionKey,
  convertKeysToTexts,
  convertTextsToKeys
} from "@/lib/constants";
import { getAllDeviceModels } from "../../lib/api/deviceModels";
import { type DeviceModel } from "../../types/product";
import { MANUFACTURER_LABELS, STORAGE_LABELS, type StorageCode } from "../../lib/constants/codes";
import DeviceModelSelectionModal from "./DeviceModelSelectionModal";
import { createProductsBulk } from "../../lib/api/productBulk";
import { getCurrentUserStore } from "../../lib/store";

// 모델과 용량 조합을 생성하는 함수
const generateModelStorageCombinations = (deviceModels: DeviceModel[]) => {
  const combinations: Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string; // 실제 device_models 테이블의 ID
  }> = [];

  (deviceModels || []).forEach(model => {
    // deviceName이 없는 모델은 건너뛰기
    if (!model.deviceName) {
      console.warn('DeviceModel with missing deviceName:', model);
      return;
    }
    
    (model.supportedStorage || []).forEach((storage: StorageCode) => {
      combinations.push({
        id: `${model.id}-${storage}`,
        name: model.deviceName,
        storage: storage,
        brand: model.manufacturer === 'SAMSUNG' ? 'samsung' : 'apple',
        manufacturer: model.manufacturer,
        deviceModelId: model.id // 실제 device_models 테이블의 ID
      });
    });
  });

  return combinations;
};

const CARRIERS = ['KT', 'SKT', 'LG_U_PLUS'];
const CONDITIONS = ['번호이동', '기기변경'];

// 통신사 표시명 매핑
const CARRIER_DISPLAY_NAMES = {
  'KT': 'KT',
  'SKT': 'SKT', 
  'LG_U_PLUS': 'LGU+'
};

interface ProductTableData {
  [modelId: string]: {
    [carrier: string]: {
      [condition: string]: {
        price: number | string | '';
        additionalConditions: AdditionalConditionKey[];
      };
    };
  };
}

interface ProductTableEditorProps {
  onSave: (products: any[]) => void;
  onCancel: () => void;
  existingProducts?: any[];
  editingProducts?: any[];
  mode?: 'bulk' | 'edit';
  tableInfo?: {
    id: string;
    name: string;
    exposureStartDate: string;
    exposureEndDate: string;
  };
}

export default function ProductTableEditor({
  onSave,
  onCancel,
  existingProducts = [],
  editingProducts = [],
  mode = 'bulk',
  tableInfo
}: ProductTableEditorProps) {
  const [tableData, setTableData] = useState<ProductTableData>({});
  const [activeTab, setActiveTab] = useState<'samsung' | 'apple'>('samsung');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{modelId: string, carrier: string, condition: string} | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [modelCombinations, setModelCombinations] = useState<Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
  }>>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [exposureStartDate, setExposureStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [exposureEndDate, setExposureEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [tableName, setTableName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // 단말기 데이터 로드
  useEffect(() => {
    const loadDeviceModels = async () => {
      try {
        const models = await getAllDeviceModels();
        setDeviceModels(models);
        const combinations = generateModelStorageCombinations(models);
        setModelCombinations(combinations);
        // 모든 모델+용량 조합을 기본 선택
        const allCombinations: string[] = [];
        if (models && Array.isArray(models)) {
          models.forEach(model => {
            if (model.supportedStorage) {
              model.supportedStorage.forEach((storage: StorageCode) => {
                allCombinations.push(`${model.id}-${storage}`);
              });
            }
          });
        }
        setSelectedCombinations(allCombinations);
        
        // 모든 모델을 기본 선택
        const allModelIds = new Set((combinations || []).map(combo => combo.id));
        setSelectedModels(allModelIds);
      } catch (error) {
        console.error('단말기 데이터 로드 실패:', error);
      }
    };
    
    loadDeviceModels();
  }, []);

  // 테이블 정보 설정 (편집 모드)
  useEffect(() => {
    if (tableInfo && mode === 'edit') {
      setTableName(tableInfo.name);
      setExposureStartDate(tableInfo.exposureStartDate);
      setExposureEndDate(tableInfo.exposureEndDate);
    }
  }, [tableInfo, mode]);

  // 기존 상품 데이터를 테이블 형태로 변환
  useEffect(() => {
    const initialData: ProductTableData = {};
    
    // 기존 상품들을 테이블 데이터로 변환
    existingProducts.forEach(product => {
      // 안전한 접근을 위한 null 체크 (deviceName 사용)
      if (!product.deviceName || !product.storage || !product.carrier) {
        console.warn('상품 데이터에 필수 필드가 누락되었습니다:', product);
        return;
      }
      
      // modelCombinations의 ID 형식과 일치하도록 수정: ${deviceModelId}-${storage}
      const modelId = `${product.device_model_id}-${product.storage}`;
      const carrier = product.carrier;
      const condition = product.conditions?.includes('번호이동') ? '번호이동' : '기기변경';
      
      if (!initialData[modelId]) {
        initialData[modelId] = {};
      }
      if (!initialData[modelId][carrier]) {
        initialData[modelId][carrier] = {};
      }
      
      // 추가 조건들을 추출 (기존 conditions에서 기본 조건 제외)
      const additionalConditionTexts = product.conditions.filter((c: string) => 
        !['번호이동', '기기변경'].includes(c)
      );
      const additionalConditions = convertTextsToKeys(additionalConditionTexts);
      
      initialData[modelId][carrier][condition] = {
        price: product.price,
        additionalConditions: additionalConditions
      };
    });
    
    setTableData(initialData);
  }, [existingProducts]);

  // 선택된 모델들이 변경될 때 tableData 초기화
  useEffect(() => {
    const filteredModels = (modelCombinations || []).filter(model => {
      const isBrandMatch = activeTab === 'samsung' ? model.brand === 'samsung' : model.brand === 'apple';
      const isSelected = selectedCombinations.includes(model.id);
      return isBrandMatch && isSelected;
    });

    const newTableData = { ...tableData };
    let hasChanges = false;

    filteredModels.forEach(model => {
      if (!newTableData[model.id]) {
        newTableData[model.id] = {};
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setTableData(newTableData);
    }
  }, [selectedCombinations, activeTab, modelCombinations]);

  const handlePriceChange = (modelId: string, carrier: string, condition: string, value: number | string) => {
    // 빈 문자열, - 기호, 또는 숫자 값을 그대로 저장 (음수 포함)
    const numericValue = value === '' || value === '-' ? value : (typeof value === 'number' ? value : parseFloat(value));
    
    setTableData(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [carrier]: {
          ...prev[modelId]?.[carrier],
          [condition]: {
            price: numericValue,
            additionalConditions: prev[modelId]?.[carrier]?.[condition]?.additionalConditions || []
          }
        }
      }
    }));

    // 에러 제거
    const errorKey = `${modelId}-${carrier}-${condition}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleAdditionalConditionChange = (modelId: string, carrier: string, condition: string, additionalCondition: AdditionalConditionKey, checked: boolean) => {
    setTableData(prev => {
      const currentData = prev[modelId]?.[carrier]?.[condition];
      const currentConditions = currentData?.additionalConditions || [];
      
      const newConditions = checked
        ? [...currentConditions, additionalCondition]
        : currentConditions.filter(c => c !== additionalCondition);
      
      return {
        ...prev,
        [modelId]: {
          ...prev[modelId],
          [carrier]: {
            ...prev[modelId]?.[carrier],
            [condition]: {
              price: currentData?.price || '',
              additionalConditions: newConditions
            }
          }
        }
      };
    });
  };

  const formatPrice = (value: number | string | '') => {
    if (value === '' || value === '-') return value;
    // 원 단위를 만원 단위로 변환하여 표시 (음수 포함)
    if (typeof value === 'number') {
      const result = Math.trunc(value / 10000);
      return result.toString();
    }
    return value;
  };

  const parsePrice = (value: string) => {
    // 만원 단위 입력을 원 단위로 변환 (음수 허용, 3자리수 제한)
    if (value === '' || value === '-') return '';
    
    // 숫자와 음수 기호만 허용
    const cleanValue = value.replace(/[^0-9-]/g, '');
    
    // 음수 기호가 맨 앞이 아니면 제거
    if (cleanValue.indexOf('-') > 0) {
      const withoutMinus = cleanValue.replace(/-/g, '');
      return withoutMinus === '' ? '' : parseInt(withoutMinus) * 10000;
    }
    
    // 음수 기호가 여러 개면 첫 번째만 유지
    if (cleanValue.startsWith('-')) {
      const withoutExtraMinus = '-' + cleanValue.substring(1).replace(/-/g, '');
      const numValue = parseInt(withoutExtraMinus);
      if (isNaN(numValue)) return '';
      
      // 3자리수 제한 (-999 ~ 999)
      const clampedValue = Math.max(-999, Math.min(999, numValue));
      return clampedValue * 10000;
    } else {
      const numValue = parseInt(cleanValue);
      if (isNaN(numValue)) return '';
      
      // 3자리수 제한 (0 ~ 999)
      const clampedValue = Math.max(0, Math.min(999, numValue));
      return clampedValue * 10000;
    }
  };

  const copyRow = (modelId: string) => {
    // 원본 모델 ID 찾기 (복사된 모델인 경우 원본 ID로 변환)
    const originalModelId = modelId.replace(/-copy-\d+$/, '');
    const model = (modelCombinations || []).find(m => m.id === originalModelId);
    if (!model) {
      return;
    }

    const newModelId = `${originalModelId}-copy-${Date.now()}`;
    
    // 데이터 복사 (기존 데이터가 있으면 복사, 없으면 빈 구조 생성)
    const copiedData: ProductTableData = {};
    CARRIERS.forEach(carrier => {
      CONDITIONS.forEach(condition => {
        const originalData = tableData[modelId]?.[carrier]?.[condition];
        if (originalData) {
          if (!copiedData[newModelId]) {
            copiedData[newModelId] = {};
          }
          if (!copiedData[newModelId][carrier]) {
            copiedData[newModelId][carrier] = {};
          }
          copiedData[newModelId][carrier][condition] = { ...originalData };
        } else {
          // 기존 데이터가 없어도 빈 구조 생성
          if (!copiedData[newModelId]) {
            copiedData[newModelId] = {};
          }
          if (!copiedData[newModelId][carrier]) {
            copiedData[newModelId][carrier] = {};
          }
          copiedData[newModelId][carrier][condition] = {
            price: '',
            additionalConditions: []
          };
        }
      });
    });

    setTableData(prev => ({
      ...prev,
      ...copiedData
    }));
  };

  const deleteRow = (modelId: string) => {
    console.log('Deleting row:', modelId);
    
    // tableData에서 해당 행 삭제
    setTableData(prev => {
      const newData = { ...prev };
      delete newData[modelId];
      return newData;
    });
    
    // selectedCombinations에서도 해당 모델 제거
    setSelectedCombinations(prev => {
      const newCombinations = prev.filter(combo => combo !== modelId);
      console.log('Updated selectedCombinations after single delete:', newCombinations);
      return newCombinations;
    });
    
    // 선택된 행에서도 제거
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(modelId);
      return newSet;
    });
  };

  // 체크박스 관련 함수들
  const toggleRowSelection = (modelId: string) => {
    console.log('Toggling row selection for:', modelId);
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      console.log('New selected rows:', Array.from(newSet));
      return newSet;
    });
  };

  const toggleAllRowsSelection = () => {
    const allModelIds = allModels.map(model => model.id);
    const allSelected = allModelIds.every(id => selectedRows.has(id));
    
    console.log('Toggle all rows - allModelIds:', allModelIds);
    console.log('Toggle all rows - allSelected:', allSelected);
    
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(allModelIds));
    }
  };

  const deleteSelectedRows = () => {
    console.log('Deleting selected rows:', Array.from(selectedRows));
    console.log('Current tableData keys:', Object.keys(tableData));
    
    // tableData에서 선택된 행들 삭제
    setTableData(prev => {
      const newData = { ...prev };
      selectedRows.forEach(modelId => {
        console.log('Deleting modelId:', modelId, 'exists:', modelId in newData);
        delete newData[modelId];
      });
      return newData;
    });
    
    // selectedCombinations에서도 해당 모델들 제거
    setSelectedCombinations(prev => {
      const newCombinations = prev.filter(combo => {
        // 선택된 행들 중에서 해당 조합이 포함되지 않은 것만 유지
        return !Array.from(selectedRows).some(modelId => combo === modelId);
      });
      console.log('Updated selectedCombinations:', newCombinations);
      return newCombinations;
    });
    
    setSelectedRows(new Set());
  };


  const openConditionModal = (modelId: string, carrier: string, condition: string) => {
    setSelectedCell({ modelId, carrier, condition });
    setShowConditionModal(true);
  };

  const closeConditionModal = () => {
    setShowConditionModal(false);
    setSelectedCell(null);
  };

  const validateData = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 테이블명 검증
    if (!tableName.trim()) {
      newErrors['tableName'] = '테이블명을 입력해주세요';
    }
    
    Object.keys(tableData).forEach(modelId => {
      Object.keys(tableData[modelId]).forEach(carrier => {
        Object.keys(tableData[modelId][carrier]).forEach(condition => {
          const data = tableData[modelId][carrier][condition];
          const value = data?.price;
          const errorKey = `${modelId}-${carrier}-${condition}`;
          
          if (value === '') {
            newErrors[errorKey] = '금액을 입력해주세요';
          }
          // 음수 값도 유효한 입력으로 처리 (0은 제외)
          else if (value === 0) {
            newErrors[errorKey] = '금액을 입력해주세요';
          }
        });
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    // 데이터 초기화
    setTableData({});
    setSelectedRows(new Set());
    setTableName('');
    setExposureStartDate('');
    setExposureEndDate('');
    setErrors({});
    setSaveError('');
    
    // 부모 컴포넌트에 취소 알림
    onCancel();
  };

  const handleSave = async () => {
    if (!validateData()) {
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // 로그인 상태 확인
      const user = await getCurrentUser();
      
      if (!user) {
        setSaveError('로그인이 필요합니다. 페이지를 새로고침해주세요.');
        return;
      }

      // 현재 사용자의 스토어 ID 가져오기
      const { data: storeInfo, error: storeError } = await getCurrentUserStore();
      
      if (storeError || !storeInfo) {
        setSaveError('스토어 정보를 불러올 수 없습니다. 스토어 등록을 먼저 완료해주세요.');
        return;
      }

      const products: any[] = [];
      
      Object.keys(tableData).forEach(modelId => {
        // 복사된 모델인 경우 원본 모델 찾기
        const originalModelId = modelId.replace(/-copy-\d+$/, '');
        const model = (modelCombinations || []).find(m => m.id === originalModelId) as {
          id: string;
          name: string;
          storage: StorageCode;
          brand: 'samsung' | 'apple';
          manufacturer: string;
          deviceModelId: string;
        };
        if (!model) return;
        
        // 실제 device_models 테이블의 ID 사용
        const actualDeviceModelId = model.deviceModelId;
        
        Object.keys(tableData[modelId]).forEach(carrier => {
          Object.keys(tableData[modelId][carrier]).forEach(condition => {
            const data = tableData[modelId][carrier][condition];
            const price = data?.price;
            const additionalConditions = data?.additionalConditions || [];
            const conditionTexts = convertKeysToTexts(additionalConditions);
            
            if (price !== '' && price !== 0) {
              // carrier 값을 데이터베이스 형식으로 변환
              const dbCarrier = carrier === 'LGU+' ? 'LG_U_PLUS' : carrier;
              
              products.push({
                storeId: storeInfo.id, // 실제 스토어 ID 사용
                deviceModelId: actualDeviceModelId,
                carrier: dbCarrier,
                storage: model.storage,
                price: price,
                conditions: [condition, ...conditionTexts],
                isActive: true,
                exposureStartDate: exposureStartDate,
                exposureEndDate: exposureEndDate
              });
            }
          });
        });
      });

      if (products.length === 0) {
        setSaveError('저장할 상품이 없습니다.');
        return;
      }

      // 1. product_tables 테이블에 레코드 생성 또는 수정
      if (mode === 'edit' && tableInfo?.id) {
        // 편집 모드: 기존 테이블 업데이트
        const { updateProductTable } = await import('@/lib/api/productTables');
        await updateProductTable(tableInfo.id, {
          name: tableName,
          exposureStartDate: exposureStartDate,
          exposureEndDate: exposureEndDate,
          tableData: products,
          products: products
        });
      } else {
        // 생성 모드: 새 테이블 생성
        const { createProductTable } = await import('@/lib/api/productTables');
        const tableResult = await createProductTable({
          name: tableName,
          exposureStartDate: exposureStartDate,
          exposureEndDate: exposureEndDate,
          tableData: products,
          products: products
        });

        if (!tableResult.success) {
          setSaveError(tableResult.error || '가격표 생성에 실패했습니다.');
          return;
        }
      }

      // 성공 시 부모 컴포넌트에 저장된 상품 정보 전달
      onSave(products);
    } catch (error) {
      console.error('상품 저장 오류:', error);
      setSaveError(error instanceof Error ? error.message : '상품 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredModels = (modelCombinations || []).filter(model => {
    const isBrandMatch = activeTab === 'samsung' ? model.brand === 'samsung' : model.brand === 'apple';
    const isSelected = selectedCombinations.includes(model.id);
    return isBrandMatch && isSelected;
  }) as Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string;
  }>;

  // 선택된 모델과 복사본을 올바른 순서로 배치
  const allModels: Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string;
    originalId?: string;
    timestamp?: number;
  }> = [];
  
  // 먼저 선택된 모델들을 추가
  filteredModels.forEach(model => {
    allModels.push(model);
  });
  
  
  // 복사본들을 allModels에 추가
  Object.keys(tableData || {}).forEach(modelId => {
    if (modelId.includes('-copy-')) {
      // 원본 모델 찾기
      const originalModelId = modelId.replace(/-copy-\d+$/, '');
      const model = (modelCombinations || []).find(m => m.id === originalModelId) as {
        id: string;
        name: string;
        storage: StorageCode;
        brand: 'samsung' | 'apple';
        manufacturer: string;
        deviceModelId: string;
      };
      if (model) {
        allModels.push({
          ...model,
          id: modelId,
          originalId: originalModelId,
          timestamp: parseInt(modelId.split('-copy-')[1]) || 0
        });
      }
    }
  });

  // 인증 상태 확인 중
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-yellow-400">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">로그인이 필요합니다</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>상품을 등록하려면 먼저 로그인해주세요.</p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">상품 등록</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowModelModal(true)}>
            단말기 선택 ({modelCombinations.length}개)
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeviceModelSelectionModal
        open={showModelModal}
        onOpenChange={setShowModelModal}
        onSelectionChange={(selectedCombinations) => {
          // 선택된 모델+용량 조합을 저장
          setSelectedCombinations(selectedCombinations);
          
          // 모델 ID 추출하여 selectedModels 업데이트
          const modelIds = new Set(selectedCombinations.map(combo => combo.split('-')[0]));
          setSelectedModels(modelIds);
        }}
        selectedCombinations={selectedCombinations}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'samsung' | 'apple')}>
        <TabsList>
          <TabsTrigger value="samsung">삼성</TabsTrigger>
          <TabsTrigger value="apple">애플</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* 테이블명 및 노출기간 설정 */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* 테이블명 입력 */}
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium w-20">테이블명:</Label>
                <div className="flex-1 max-w-md">
                  <Input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="예: 25-09-30 가격표"
                    className={errors['tableName'] ? 'border-red-500' : ''}
                  />
                  {errors['tableName'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['tableName']}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  상품 목록에서 표시될 이름입니다
                </span>
              </div>
              
              {/* 노출기간 설정 */}
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium w-20">노출기간:</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={exposureStartDate}
                    onChange={(e) => {
                      setExposureStartDate(e.target.value);
                      // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
                      if (e.target.value > exposureEndDate) {
                        setExposureEndDate(e.target.value);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-sm border rounded px-2 py-1"
                    placeholder="시작일"
                  />
                  <span className="text-sm text-muted-foreground">~</span>
                  <input
                    type="date"
                    value={exposureEndDate}
                    onChange={(e) => setExposureEndDate(e.target.value)}
                    min={exposureStartDate}
                    className="text-sm border rounded px-2 py-1"
                    placeholder="종료일"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  설정한 기간에만 상품이 노출됩니다
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="border-collapse w-auto table-auto" style={{ minWidth: '600px' }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r w-8 p-0">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={allModels.length > 0 && allModels.every(model => selectedRows.has(model.id))}
                            onCheckedChange={toggleAllRowsSelection}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="border-r text-center" colSpan={2}>모델 정보</TableHead>
                      {CARRIERS.map(carrier => (
                        <TableHead key={carrier} colSpan={2} className="text-center border-r last:border-r-0">
                          {CARRIER_DISPLAY_NAMES[carrier as keyof typeof CARRIER_DISPLAY_NAMES]}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableHead className="border-r text-center whitespace-nowrap">
                        {selectedRows.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedRows}
                            className="h-6 px-2 text-xs"
                          >
                            삭제 ({selectedRows.size})
                          </Button>
                        )}
                      </TableHead>
                      <TableHead className="border-r text-center whitespace-nowrap">모델명</TableHead>
                      <TableHead className="border-r text-center whitespace-nowrap">용량</TableHead>
                      {CARRIERS.map(carrier => (
                        <React.Fragment key={carrier}>
                          <TableHead className="text-center text-xs border-r whitespace-nowrap">번호이동</TableHead>
                          <TableHead className="text-center text-xs border-r last:border-r-0 whitespace-nowrap">기기변경</TableHead>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allModels.map(model => {
                      const isCopied = model.id.includes('-copy-');
                      const hasData = CARRIERS.some(carrier => 
                        CONDITIONS.some(condition => {
                          const data = tableData[model.id]?.[carrier]?.[condition];
                          return data && (data.price !== '' || data.additionalConditions.length > 0);
                        })
                      );
                      
                      return (
                        <React.Fragment key={model.id}>
                          <TableRow>
                            <TableCell className="border-r w-8 p-0">
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={selectedRows.has(model.id)}
                                  onCheckedChange={() => toggleRowSelection(model.id)}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium border-r whitespace-nowrap p-1 sm:p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm">{model.name}</span>
                                <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        copyRow(model.id);
                                      }}
                                      title="복사"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    {isCopied && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                        onClick={() => deleteRow(model.id)}
                                        title="삭제"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center border-r whitespace-nowrap p-1 sm:p-2">
                              <span className="text-sm text-muted-foreground">
                                {STORAGE_LABELS[model.storage as keyof typeof STORAGE_LABELS]}
                              </span>
                            </TableCell>
                            {CARRIERS.map(carrier => (
                              <React.Fragment key={carrier}>
                                {CONDITIONS.map(condition => {
                                  const errorKey = `${model.id}-${carrier}-${condition}`;
                                  const hasError = !!errors[errorKey];
                                  const data = tableData[model.id]?.[carrier]?.[condition];
                                  const isLastCarrier = carrier === CARRIERS[CARRIERS.length - 1];
                                  const isLastCondition = condition === CONDITIONS[CONDITIONS.length - 1];
                                  
                                  return (
                                    <TableCell key={`${carrier}-${condition}`} className={`p-0.5 sm:p-1 border-r ${isLastCarrier && isLastCondition ? 'border-r-0' : ''}`}>
                                      <div className="space-y-1">
                                        <div className="relative flex items-center">
                                          <input
                                            type="text"
                                            placeholder="0"
                                            value={formatPrice(data?.price || '')}
                                            onChange={(e) => {
                                              let value = e.target.value;
                                              
                                              // 숫자와 음수 기호만 허용
                                              value = value.replace(/[^0-9-]/g, '');
                                              
                                              // 음수 기호가 맨 앞이 아니면 제거
                                              if (value.indexOf('-') > 0) {
                                                value = value.replace(/-/g, '');
                                              }
                                              
                                              // 음수 기호가 여러 개면 첫 번째만 유지
                                              if ((value.match(/-/g) || []).length > 1) {
                                                value = '-' + value.replace(/-/g, '');
                                              }
                                              
                                              // 길이 제한
                                              if (value.startsWith('-')) {
                                                value = value.substring(0, 4); // -999
                                              } else {
                                                value = value.substring(0, 3); // 999
                                              }
                                              
                                              // - 기호만 입력된 경우 임시로 저장
                                              if (value === '-') {
                                                handlePriceChange(model.id, carrier, condition, '-');
                                              } else {
                                                const priceInWon = parsePrice(value);
                                                handlePriceChange(model.id, carrier, condition, priceInWon);
                                              }
                                            }}
                                            className={`w-full text-center bg-transparent text-xs ${hasError ? 'text-red-500' : ''}`}
                                            style={{ 
                                              border: 'none !important', 
                                              outline: 'none !important', 
                                              boxShadow: 'none !important',
                                              background: 'transparent !important'
                                            }}
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                            onClick={() => openConditionModal(model.id, carrier, condition)}
                                            title={data?.additionalConditions && data.additionalConditions.length > 0 ? "조건 수정" : "조건 추가"}
                                          >
                                            <Plus className="h-2 w-2" />
                                          </Button>
                                          {hasError && (
                                            <div className="absolute -bottom-3 left-0 text-xs text-red-500">
                                              {errors[errorKey]}
                                            </div>
                                          )}
                                        </div>
                                        {/* 추가 조건 칩들 */}
                                        {data?.additionalConditions && data.additionalConditions.length > 0 && (
                                          <div className="flex flex-wrap gap-0.5">
                                            {data.additionalConditions.map(condition => (
                                              <Badge key={condition} variant="outline" className="text-xs px-0.5 py-0">
                                                {CONDITION_DISPLAY_NAMES[condition]}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 추가 조건 설정 모달 */}
      <Dialog open={showConditionModal} onOpenChange={setShowConditionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>추가 조건 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCell && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {(modelCombinations || []).find(m => m.id === selectedCell.modelId)?.name} {(modelCombinations || []).find(m => m.id === selectedCell.modelId)?.storage} - {selectedCell.carrier} - {selectedCell.condition}
                </div>
                <div className="space-y-2">
                  <Label>선택</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ADDITIONAL_CONDITIONS).map(([key, label]) => {
                      const isChecked = tableData[selectedCell.modelId]?.[selectedCell.carrier]?.[selectedCell.condition]?.additionalConditions?.includes(key as AdditionalConditionKey) || false;
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`modal-${key}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => 
                              handleAdditionalConditionChange(
                                selectedCell.modelId, 
                                selectedCell.carrier, 
                                selectedCell.condition, 
                                key as AdditionalConditionKey, 
                                checked as boolean
                              )
                            }
                          />
                          <Label htmlFor={`modal-${key}`} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeConditionModal}>
                    닫기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
