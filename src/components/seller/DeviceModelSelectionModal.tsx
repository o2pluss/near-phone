"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { getAllDeviceModels } from "../../lib/api/deviceModels";
import { type DeviceModel } from "../../types/product";
import { MANUFACTURER_LABELS, STORAGE_LABELS, type StorageCode } from "../../lib/constants/codes";
import { Star } from "lucide-react";

interface DeviceModelSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectionChange: (selectedCombinations: string[]) => void;
  selectedCombinations?: string[];
}

export default function DeviceModelSelectionModal({
  open,
  onOpenChange,
  onSelectionChange,
  selectedCombinations = []
}: DeviceModelSelectionModalProps) {
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [modelTab, setModelTab] = useState<"samsung" | "apple">("samsung");
  const [localSelectedCombinations, setLocalSelectedCombinations] = useState<string[]>([]);

  // 단말기 데이터 로드
  useEffect(() => {
    const loadDeviceModels = async () => {
      try {
        const models = await getAllDeviceModels();
        setDeviceModels(models);
        
        // 처음 로드 시 모든 모델+용량 조합을 선택된 상태로 설정
        if (selectedCombinations.length === 0) {
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
          setLocalSelectedCombinations(allCombinations);
        } else {
          setLocalSelectedCombinations(selectedCombinations);
        }
      } catch (error) {
        console.error('단말기 데이터 로드 실패:', error);
      }
    };
    
    loadDeviceModels();
  }, [selectedCombinations]);

  const filteredModels = (deviceModels || []).filter((model) => {
    const isManufacturerMatch = modelTab === "samsung" ? model.manufacturer === "SAMSUNG" : model.manufacturer === "APPLE";
    return isManufacturerMatch;
  });


  // 모델+용량 조합 선택/해제
  const handleCombinationToggle = (modelId: string, storage: StorageCode) => {
    const combinationId = `${modelId}-${storage}`;
    setLocalSelectedCombinations(prev => {
      const newSelection = prev.includes(combinationId) 
        ? prev.filter(id => id !== combinationId)
        : [...prev, combinationId];
      return newSelection;
    });
  };

  // 모델의 모든 용량 선택/해제
  const handleModelStorageToggle = (modelId: string) => {
    const model = deviceModels.find(m => m.id === modelId);
    if (!model || !model.supportedStorage) return;

    const modelCombinations = model.supportedStorage.map(storage => `${modelId}-${storage}`);
    const allSelected = modelCombinations.every(combo => localSelectedCombinations.includes(combo));
    
    if (allSelected) {
      // 모든 용량 해제
      setLocalSelectedCombinations(prev => prev.filter(combo => !modelCombinations.includes(combo)));
    } else {
      // 모든 용량 선택
      setLocalSelectedCombinations(prev => {
        const newSelection = [...prev];
        modelCombinations.forEach(combo => {
          if (!newSelection.includes(combo)) {
            newSelection.push(combo);
          }
        });
        return newSelection;
      });
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const currentTabCombinations: string[] = [];
    filteredModels.forEach(model => {
      if (model.supportedStorage) {
        model.supportedStorage.forEach(storage => {
          currentTabCombinations.push(`${model.id}-${storage}`);
        });
      }
    });
    
    const allSelected = currentTabCombinations.every(combo => localSelectedCombinations.includes(combo));
    
    if (allSelected) {
      // 현재 탭의 모든 조합 해제
      setLocalSelectedCombinations(prev => prev.filter(combo => !currentTabCombinations.includes(combo)));
    } else {
      // 현재 탭의 모든 조합 선택
      setLocalSelectedCombinations(prev => {
        const newSelection = [...prev];
        currentTabCombinations.forEach(combo => {
          if (!newSelection.includes(combo)) {
            newSelection.push(combo);
          }
        });
        return newSelection;
      });
    }
  };

  // 선택 완료
  const handleConfirm = () => {
    onSelectionChange(localSelectedCombinations);
    onOpenChange(false);
  };

  // 현재 탭의 선택 상태 확인
  const currentTabCombinations: string[] = [];
  filteredModels.forEach(model => {
    if (model.supportedStorage) {
      model.supportedStorage.forEach(storage => {
        currentTabCombinations.push(`${model.id}-${storage}`);
      });
    }
  });
  const allSelected = currentTabCombinations.length > 0 && currentTabCombinations.every(combo => localSelectedCombinations.includes(combo));
  const someSelected = currentTabCombinations.some(combo => localSelectedCombinations.includes(combo));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>단말기 선택</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 브랜드 탭 */}
          <Tabs
            value={modelTab}
            onValueChange={(value) =>
              setModelTab(value as "samsung" | "apple")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="samsung">삼성</TabsTrigger>
              <TabsTrigger value="apple">애플</TabsTrigger>
            </TabsList>

            {/* 전체 선택 버튼 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el && el instanceof HTMLInputElement) {
                      el.indeterminate = someSelected && !allSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  전체 선택 ({currentTabCombinations.filter(combo => localSelectedCombinations.includes(combo)).length}/{currentTabCombinations.length}개)
                </span>
              </div>
            </div>

            {/* 모델 목록 */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => {
                  const modelCombinations = model.supportedStorage?.map(storage => `${model.id}-${storage}`) || [];
                  const selectedCombinations = modelCombinations.filter(combo => localSelectedCombinations.includes(combo));
                  const allStorageSelected = modelCombinations.length > 0 && selectedCombinations.length === modelCombinations.length;
                  const someStorageSelected = selectedCombinations.length > 0;

                  return (
                    <div key={model.id} className="border rounded-lg bg-white px-4 py-2">
                      <div className="flex items-center space-x-2">
                        {/* 단말기 체크박스 */}
                        <Checkbox
                          checked={someStorageSelected}
                          ref={(el) => {
                            if (el && el instanceof HTMLInputElement) {
                              el.indeterminate = someStorageSelected && !allStorageSelected;
                            }
                          }}
                          onCheckedChange={() => handleModelStorageToggle(model.id)}
                          className="h-4 w-4"
                        />

                        {/* 이미지 썸네일 */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {model.imageUrl ? (
                            <img
                              src={model.imageUrl}
                              alt={model.deviceName || 'Unknown Device'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📱
                            </div>
                          )}
                        </div>

                        {/* 모델명 */}
                        <div className="font-medium flex-1">
                          {model.deviceName || 'Unknown Device'}
                        </div>

                        {/* 용량 칩들 */}
                        <div className="grid grid-cols-2 gap-1">
                          {model.supportedStorage?.map((storage) => {
                            const combinationId = `${model.id}-${storage}`;
                            const isSelected = localSelectedCombinations.includes(combinationId);
                            
                            return (
                              <div
                                key={storage}
                                className={`px-1 py-1 rounded-md cursor-pointer hover:opacity-80 transition-all text-xs font-medium text-center ${
                                  isSelected 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-300'
                                }`}
                                onClick={() => handleCombinationToggle(model.id, storage)}
                              >
                                {STORAGE_LABELS[storage as keyof typeof STORAGE_LABELS] || storage}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>조회 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </Tabs>

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm}>
              선택 완료 ({localSelectedCombinations.length}개)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
