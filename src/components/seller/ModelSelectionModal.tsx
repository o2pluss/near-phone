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
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { getAllDeviceModels } from "../../lib/api/deviceModels";
import { type DeviceModel } from "../../types/product";
import { STORAGE_LABELS } from "../../lib/constants/codes";

interface ModelSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModels: Set<string>;
  onSelectionChange: (selectedModels: Set<string>) => void;
}

export default function ModelSelectionModal({
  open,
  onOpenChange,
  selectedModels,
  onSelectionChange,
}: ModelSelectionModalProps) {
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [modelTab, setModelTab] = useState<"samsung" | "apple">("samsung");

  // 단말기 데이터 로드
  useEffect(() => {
    const loadDeviceModels = async () => {
      try {
        const models = await getAllDeviceModels();
        setDeviceModels(models);
      } catch (error) {
        console.error('단말기 데이터 로드 실패:', error);
      }
    };
    
    loadDeviceModels();
  }, []);

  // 모델과 용량 조합을 생성하는 함수
  const generateModelStorageCombinations = (deviceModels: DeviceModel[]) => {
    const combinations: Array<{
      id: string;
      name: string;
      storage: string;
      brand: 'samsung' | 'apple';
      manufacturer: string;
    }> = [];

    (deviceModels || []).forEach(model => {
      // deviceName이 없는 모델은 건너뛰기
      if (!model.deviceName) {
        console.warn('DeviceModel with missing deviceName:', model);
        return;
      }
      
      (model.supportedStorage || []).forEach(storage => {
        const combinationId = `${model.deviceName.toLowerCase().replace(/\s+/g, '-')}-${storage.toLowerCase()}`;
        combinations.push({
          id: combinationId,
          name: model.deviceName,
          storage: storage,
          brand: model.manufacturer === 'SAMSUNG' ? 'samsung' : 'apple',
          manufacturer: model.manufacturer
        });
      });
    });

    return combinations;
  };

  const modelCombinations = generateModelStorageCombinations(deviceModels);

  const filteredModels = (modelCombinations || []).filter(model => 
    model.brand === modelTab
  );

  const handleSelectAll = (checked: boolean) => {
    const currentTabModels = filteredModels.map(m => m.id);
    if (checked) {
      onSelectionChange(new Set([...selectedModels, ...currentTabModels]));
    } else {
      const newSet = new Set(selectedModels);
      currentTabModels.forEach(id => newSet.delete(id));
      onSelectionChange(newSet);
    }
  };

  const handleModelToggle = (modelId: string, checked: boolean) => {
    const newSet = new Set(selectedModels);
    if (checked) {
      newSet.add(modelId);
    } else {
      newSet.delete(modelId);
    }
    onSelectionChange(newSet);
  };

  const isAllSelected = filteredModels.length > 0 && filteredModels.every(m => selectedModels.has(m.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>단말기 선택</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Tabs value={modelTab} onValueChange={(value) => setModelTab(value as 'samsung' | 'apple')}>
            <TabsList>
              <TabsTrigger value="samsung">삼성</TabsTrigger>
              <TabsTrigger value="apple">애플</TabsTrigger>
            </TabsList>
            <TabsContent value="samsung" className="space-y-2">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="select-all-samsung"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-samsung">전체 선택</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredModels.map(model => (
                  <div key={model.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={model.id}
                      checked={selectedModels.has(model.id)}
                      onCheckedChange={(checked) => handleModelToggle(model.id, !!checked)}
                    />
                    <Label htmlFor={model.id} className="text-sm">
                      {model.name} ({STORAGE_LABELS[model.storage as keyof typeof STORAGE_LABELS]})
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="apple" className="space-y-2">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="select-all-apple"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-apple">전체 선택</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredModels.map(model => (
                  <div key={model.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={model.id}
                      checked={selectedModels.has(model.id)}
                      onCheckedChange={(checked) => handleModelToggle(model.id, !!checked)}
                    />
                    <Label htmlFor={model.id} className="text-sm">
                      {model.name} ({STORAGE_LABELS[model.storage as keyof typeof STORAGE_LABELS]})
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
