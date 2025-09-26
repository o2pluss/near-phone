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

interface ProductVariant {
  storage: string;
  price: string;
  conditions: string[];
  isActive: boolean;
}

interface ProductVariantEditorProps {
  model: string;
  carrier: string;
  supportedStorage: string[]; // 관리자가 설정한 지원 용량 목록
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
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

export default function ProductVariantEditor({
  model,
  carrier,
  supportedStorage,
  variants,
  onVariantsChange,
  onValidationChange
}: ProductVariantEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateVariant = (variant: ProductVariant): string | null => {
    if (!variant.storage) return "용량을 선택해주세요";
    if (!variant.price || isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
      return "올바른 가격을 입력해주세요";
    }
    return null;
  };

  const validateAllVariants = (variants: ProductVariant[]): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    variants.forEach((variant, index) => {
      const error = validateVariant(variant);
      if (error) {
        newErrors[`${index}`] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    onValidationChange(isValid);
    return isValid;
  };

  const addVariant = () => {
    const availableStorage = supportedStorage.filter(
      storage => !variants.some(v => v.storage === storage)
    );
    
    if (availableStorage.length > 0) {
      const newVariant: ProductVariant = {
        storage: availableStorage[0],
        price: "",
        conditions: [],
        isActive: true
      };
      
      const newVariants = [...variants, newVariant];
      onVariantsChange(newVariants);
      validateAllVariants(newVariants);
    }
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
    validateAllVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
    validateAllVariants(newVariants);
  };

  const toggleCondition = (variantIndex: number, condition: string) => {
    const variant = variants[variantIndex];
    const newConditions = variant.conditions.includes(condition)
      ? variant.conditions.filter(c => c !== condition)
      : [...variant.conditions, condition];
    
    updateVariant(variantIndex, 'conditions', newConditions);
  };

  const availableStorageForVariant = (currentIndex: number) => {
    return supportedStorage.filter(storage => 
      !variants.some((v, index) => index !== currentIndex && v.storage === storage)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>용량별 가격 설정</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            disabled={variants.length >= supportedStorage.length}
          >
            <Plus className="h-4 w-4 mr-2" />
            용량 추가
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>용량별 가격을 설정해주세요</p>
            <p className="text-sm">+ 용량 추가 버튼을 눌러 시작하세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{variant.storage}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
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
                  {/* 용량 선택 */}
                  <div className="space-y-2">
                    <Label>용량</Label>
                    <Select
                      value={variant.storage}
                      onValueChange={(value) => updateVariant(index, 'storage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="용량 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStorageForVariant(index).map(storage => (
                          <SelectItem key={storage} value={storage}>
                            {storage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 가격 입력 */}
                  <div className="space-y-2">
                    <Label>가격 (원)</Label>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="가격을 입력하세요"
                      className={errors[index] ? 'border-red-500' : ''}
                    />
                  </div>
                </div>

                {/* 조건 선택 */}
                <div className="space-y-2">
                  <Label>조건</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conditionOptions.map(condition => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${index}-${condition}`}
                          checked={variant.conditions.includes(condition)}
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
                  {variant.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {variant.conditions.map(condition => (
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
                    checked={variant.isActive}
                    onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                  />
                  <Label htmlFor={`${index}-active`} className="text-sm cursor-pointer">
                    상품 노출
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
