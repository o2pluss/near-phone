"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Trash2, AlertCircle } from "lucide-react";

interface CarrierStorageCombination {
  carrier: string;
  storage: string;
  price: number;
  conditions: string[];
  isActive: boolean;
}

interface ProductCombinationEditorProps {
  model: string;
  supportedCarriers: string[]; // 관리자가 설정한 지원 통신사 목록
  supportedStorage: string[]; // 관리자가 설정한 지원 용량 목록
  combinations: CarrierStorageCombination[];
  onCombinationsChange: (combinations: CarrierStorageCombination[]) => void;
  onValidationChange: (isValid: boolean) => void;
}

const conditionOptions = [
  "번호이동",
  "신규가입", 
  "기기변경",
  "카드할인",
  "결합할인",
  "필수요금제",
  "부가서비스"
];

export default function ProductCombinationEditor({
  model,
  supportedCarriers,
  supportedStorage,
  combinations,
  onCombinationsChange,
  onValidationChange
}: ProductCombinationEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCombination = (combination: CarrierStorageCombination): string | null => {
    if (!combination.carrier) return "통신사를 선택해주세요";
    if (!combination.storage) return "용량을 선택해주세요";
    if (!combination.price || isNaN(Number(combination.price)) || Number(combination.price) <= 0) {
      return "올바른 가격을 입력해주세요";
    }
    return null;
  };

  const validateAllCombinations = (combinations: CarrierStorageCombination[]): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    combinations.forEach((combination, index) => {
      const error = validateCombination(combination);
      if (error) {
        newErrors[`${index}`] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    onValidationChange(isValid);
    return isValid;
  };

  const addCombination = () => {
    const availableCombinations = getAvailableCombinations();
    
    if (availableCombinations.length > 0) {
      const newCombination: CarrierStorageCombination = {
        carrier: availableCombinations[0].carrier,
        storage: availableCombinations[0].storage,
        price: 0,
        conditions: [],
        isActive: true
      };
      
      const newCombinations = [...combinations, newCombination];
      onCombinationsChange(newCombinations);
      validateAllCombinations(newCombinations);
    }
  };

  const removeCombination = (index: number) => {
    const newCombinations = combinations.filter((_, i) => i !== index);
    onCombinationsChange(newCombinations);
    validateAllCombinations(newCombinations);
  };

  const updateCombination = (index: number, field: keyof CarrierStorageCombination, value: any) => {
    const newCombinations = [...combinations];
    newCombinations[index] = { ...newCombinations[index], [field]: value };
    onCombinationsChange(newCombinations);
    validateAllCombinations(newCombinations);
  };

  const toggleCondition = (combinationIndex: number, condition: string) => {
    const combination = combinations[combinationIndex];
    const newConditions = combination.conditions.includes(condition)
      ? combination.conditions.filter(c => c !== condition)
      : [...combination.conditions, condition];
    
    updateCombination(combinationIndex, 'conditions', newConditions);
  };

  // 사용 가능한 통신사+용량 조합 계산
  const getAvailableCombinations = () => {
    const usedCombinations = combinations.map(c => `${c.carrier}-${c.storage}`);
    const available: { carrier: string; storage: string }[] = [];
    
    supportedCarriers.forEach(carrier => {
      supportedStorage.forEach(storage => {
        const key = `${carrier}-${storage}`;
        if (!usedCombinations.includes(key)) {
          available.push({ carrier, storage });
        }
      });
    });
    
    return available;
  };

  const availableCombinations = getAvailableCombinations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>통신사 + 용량 조합별 가격 설정</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCombination}
            disabled={availableCombinations.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            조합 추가
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {combinations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>통신사와 용량 조합을 설정해주세요</p>
            <p className="text-sm">+ 조합 추가 버튼을 눌러 시작하세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {combinations.map((combination, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {combination.carrier} + {combination.storage}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCombination(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {errors[index] && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors[index]}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 통신사 선택 */}
                  <div className="space-y-2">
                    <Label>통신사</Label>
                    <Select
                      value={combination.carrier}
                      onValueChange={(value) => updateCombination(index, 'carrier', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="통신사 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCarriers.map(carrier => (
                          <SelectItem key={carrier} value={carrier}>
                            {carrier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 용량 선택 */}
                  <div className="space-y-2">
                    <Label>용량</Label>
                    <Select
                      value={combination.storage}
                      onValueChange={(value) => updateCombination(index, 'storage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="용량 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedStorage.map(storage => (
                          <SelectItem key={storage} value={storage}>
                            {storage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 가격 입력 */}
                <div className="space-y-2">
                  <Label>가격 (원)</Label>
                  <Input
                    type="number"
                    value={combination.price || ''}
                    onChange={(e) => updateCombination(index, 'price', Number(e.target.value))}
                    placeholder="가격을 입력하세요"
                    className={errors[index] ? 'border-red-500' : ''}
                  />
                </div>

                {/* 조건 선택 */}
                <div className="space-y-2">
                  <Label>조건</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conditionOptions.map(condition => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${index}-${condition}`}
                          checked={combination.conditions.includes(condition)}
                          onCheckedChange={() => toggleCondition(index, condition)}
                        />
                        <Label 
                          htmlFor={`${index}-${condition}`} 
                          className="text-sm cursor-pointer"
                        >
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {combination.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {combination.conditions.map(condition => (
                        <Badge key={condition} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 활성화 상태 */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${index}-active`}
                    checked={combination.isActive}
                    onCheckedChange={(checked) => updateCombination(index, 'isActive', checked)}
                  />
                  <Label htmlFor={`${index}-active`} className="text-sm cursor-pointer">
                    상품 노출
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableCombinations.length === 0 && combinations.length > 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            모든 통신사와 용량 조합이 설정되었습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
