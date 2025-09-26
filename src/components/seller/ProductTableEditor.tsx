"use client";

import React, { useState, useEffect } from "react";
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
import { getDeviceModels, type DeviceModel } from "../../lib/api/deviceModels";
import { MANUFACTURER_LABELS, STORAGE_LABELS, type StorageCode } from "../../lib/constants/codes";

// 모델과 용량 조합을 생성하는 함수
const generateModelStorageCombinations = (deviceModels: DeviceModel[]) => {
  const combinations: Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
  }> = [];

  (deviceModels || []).forEach(model => {
    (model.supportedStorage || []).forEach((storage: StorageCode) => {
      combinations.push({
        id: `${model.id}-${storage}`,
        name: model.model,
        storage: storage,
        brand: model.manufacturer === 'SAMSUNG' ? 'samsung' : 'apple',
        manufacturer: model.manufacturer
      });
    });
  });

  return combinations;
};

const CARRIERS = ['KT', 'SKT', 'LGU+'];
const CONDITIONS = ['번호이동', '기기변경'];

interface ProductTableData {
  [modelId: string]: {
    [carrier: string]: {
      [condition: string]: {
        price: number | '';
        additionalConditions: AdditionalConditionKey[];
      };
    };
  };
}

interface ProductTableEditorProps {
  onSave: (products: any[]) => void;
  onCancel: () => void;
  existingProducts?: any[];
}

export default function ProductTableEditor({
  onSave,
  onCancel,
  existingProducts = []
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

  // 단말기 데이터 로드
  useEffect(() => {
    const loadDeviceModels = async () => {
      try {
        const models = await getDeviceModels();
        setDeviceModels(models);
        const combinations = generateModelStorageCombinations(models);
        setModelCombinations(combinations);
      } catch (error) {
        console.error('단말기 데이터 로드 실패:', error);
      }
    };
    
    loadDeviceModels();
  }, []);

  // 기존 상품 데이터를 테이블 형태로 변환
  useEffect(() => {
    const initialData: ProductTableData = {};
    
    // 기존 상품들을 테이블 데이터로 변환
    existingProducts.forEach(product => {
      const modelId = `${product.model.toLowerCase().replace(/\s+/g, '-')}-${product.storage.toLowerCase()}`;
      const carrier = product.carrier;
      const condition = product.conditions.includes('번호이동') ? '번호이동' : '기기변경';
      
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

  const handlePriceChange = (modelId: string, carrier: string, condition: string, value: string) => {
    const numericValue = value === '' ? '' : parseInt(value.replace(/,/g, ''));
    
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

  const formatPrice = (value: number | '') => {
    if (value === '') return '';
    return value.toLocaleString();
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
    setTableData(prev => {
      const newData = { ...prev };
      delete newData[modelId];
      return newData;
    });
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
    
    Object.keys(tableData).forEach(modelId => {
      Object.keys(tableData[modelId]).forEach(carrier => {
        Object.keys(tableData[modelId][carrier]).forEach(condition => {
          const data = tableData[modelId][carrier][condition];
          const value = data?.price;
          const errorKey = `${modelId}-${carrier}-${condition}`;
          
          if (value === '' || value === 0) {
            newErrors[errorKey] = '금액을 입력해주세요';
          } else if (value && value < 0) {
            newErrors[errorKey] = '올바른 금액을 입력해주세요';
          }
        });
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateData()) {
      return;
    }

    const products: any[] = [];
    
    Object.keys(tableData).forEach(modelId => {
      // 복사된 모델인 경우 원본 모델 찾기
      const originalModelId = modelId.replace(/-copy-\d+$/, '');
      const model = (modelCombinations || []).find(m => m.id === originalModelId);
      if (!model) return;
      
      Object.keys(tableData[modelId]).forEach(carrier => {
        Object.keys(tableData[modelId][carrier]).forEach(condition => {
          const data = tableData[modelId][carrier][condition];
          const price = data?.price;
          const additionalConditions = data?.additionalConditions || [];
          const conditionTexts = convertKeysToTexts(additionalConditions);
          
          if (price && price > 0) {
            products.push({
              id: `${modelId}-${carrier}-${condition}`,
              model: model.name,
              storage: model.storage,
              carrier: carrier,
              conditions: [condition, ...conditionTexts],
              price: price,
              isActive: true,
              isNew: true
            });
          }
        });
      });
    });

    onSave(products);
  };

  const filteredModels = (modelCombinations || []).filter(model => 
    activeTab === 'samsung' ? model.brand === 'samsung' : model.brand === 'apple'
  );

  // 모든 모델과 복사본을 올바른 순서로 배치
  const allModels: any[] = [];
  
  // 각 모델의 직접 복사본 관계를 추적하는 맵
  const directCopyRelations = new Map<string, string[]>();
  
  // 복사본들을 직접 부모별로 그룹화
  Object.keys(tableData || {}).forEach(modelId => {
    if (modelId.includes('-copy-')) {
      // 복사본의 직접 부모 찾기
      // 예: "galaxy-s24-fe-256-copy-123" -> "galaxy-s24-fe-256"
      // 예: "galaxy-s24-fe-256-copy-123-copy-456" -> "galaxy-s24-fe-256-copy-123"
      const copyIndex = modelId.lastIndexOf('-copy-');
      if (copyIndex > 0) {
        const parentId = modelId.substring(0, copyIndex);
        
        if (!directCopyRelations.has(parentId)) {
          directCopyRelations.set(parentId, []);
        }
        directCopyRelations.get(parentId)!.push(modelId);
      }
    }
  });
  
  // 모델과 그 직접 복사본들을 올바른 순서로 추가하는 재귀 함수
  const addModelWithDirectCopies = (modelId: string) => {
    // 원본 모델 찾기
    const originalModelId = modelId.replace(/-copy-\d+$/, '');
    const model = (modelCombinations || []).find(m => m.id === originalModelId);
    if (!model) {
      console.log('Model not found for:', modelId);
      return;
    }
    
    // 현재 모델 추가 (복사본인 경우 복사본 정보로, 원본인 경우 원본 정보로)
    const modelToAdd = modelId.includes('-copy-') ? {
      ...model,
      id: modelId,
      originalId: originalModelId,
      timestamp: parseInt(modelId.split('-copy-')[1]) || 0
    } : model;
    
    allModels.push(modelToAdd);
    
    // 이 모델의 직접 복사본들을 시간순으로 정렬하여 추가
    const directCopies = directCopyRelations.get(modelId) || [];
    
    const sortedDirectCopies = directCopies
      .map(copyId => {
        const timestamp = parseInt(copyId.split('-copy-')[1]) || 0;
        return { 
          ...model, 
          id: copyId, 
          originalId: modelId,
          timestamp 
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // 최신 복사본이 먼저 오도록 역순 정렬
    
    // 각 직접 복사본을 재귀적으로 추가 (최신 복사본부터)
    sortedDirectCopies.forEach(copy => {
      addModelWithDirectCopies(copy.id);
    });
  };
  
  // 원본 모델들부터 시작하여 복사본들을 올바른 순서로 배치
  (filteredModels || []).forEach(model => {
    addModelWithDirectCopies(model.id);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">상품 일괄 등록</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'samsung' | 'apple')}>
        <TabsList>
          <TabsTrigger value="samsung">삼성</TabsTrigger>
          <TabsTrigger value="apple">애플</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="border-collapse w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r"></TableHead>
                      {CARRIERS.map(carrier => (
                        <TableHead key={carrier} colSpan={2} className="text-center border-r last:border-r-0 w-1/4">
                          {carrier}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow>
                    <TableHead className="border-r w-1/4 text-center">모델명</TableHead>
                      {CARRIERS.map(carrier => (
                        <React.Fragment key={carrier}>
                          <TableHead className="text-center text-xs border-r w-1/8">번호이동</TableHead>
                          <TableHead className="text-center text-xs border-r last:border-r-0 w-1/8">기기변경</TableHead>
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
                            <TableCell className="font-medium border-r w-1/4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-sm">{model.name}</span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      {STORAGE_LABELS[model.storage as keyof typeof STORAGE_LABELS]}
                                    </span>
                                  </div>
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
                              </div>
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
                                    <TableCell key={`${carrier}-${condition}`} className={`p-1 border-r w-1/8 ${isLastCarrier && isLastCondition ? 'border-r-0' : ''}`}>
                                      <div className="space-y-1">
                                        <div className="relative flex items-center">
                                          <input
                                            type="text"
                                            placeholder="0"
                                            value={formatPrice(data?.price || '')}
                                            onChange={(e) => {
                                              const value = e.target.value.replace(/[^0-9]/g, '');
                                              handlePriceChange(model.id, carrier, condition, value);
                                            }}
                                            className={`w-full text-center bg-transparent pr-5 text-xs ${hasError ? 'text-red-500' : ''}`}
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
