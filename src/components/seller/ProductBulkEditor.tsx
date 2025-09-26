"use client";

import React, { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
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
import { Plus, Trash2, Copy, Save, X, AlertCircle, ChevronDown, Star, Table as TableIcon } from "lucide-react";
// phoneModels 관련 import 제거 - 실제 단말기 데이터 사용
import { ADDITIONAL_CONDITIONS, convertKeysToTexts, convertTextsToKeys, type AdditionalConditionKey } from "@/lib/constants";
import { getDeviceModels, searchDeviceModels, type DeviceModel } from "../../lib/api/deviceModels";
import { MANUFACTURER_LABELS } from "../../lib/constants/codes";
import ProductTableEditor from "./ProductTableEditor";

interface Product {
  id: string;
  model: string;
  carrier: CarrierCode;
  storage: StorageCode;
  price: number;
  conditions: string[]; // UI에서는 텍스트로 표시하지만 내부적으로는 KEY 사용
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductRow {
  id: string;
  model: string;
  carrier: CarrierCode;
  storage: StorageCode;
  price: string;
  conditions: string[];
  isActive: boolean;
  isNew: boolean;
  hasErrors: boolean;
}

// 용량별 가격을 위한 새로운 인터페이스
interface ProductVariant {
  storage: StorageCode;
  price: string;
  conditions: string[];
  isActive: boolean;
}

interface ProductWithVariants {
  id: string;
  model: string;
  carrier: CarrierCode;
  variants: ProductVariant[];
  isNew: boolean;
  hasErrors: boolean;
}

interface ProductBulkEditorProps {
  products: Product[];
  editingProduct?: Product | null; // 단일 상품 편집 시 사용
  editingProducts?: Product[]; // 여러 상품 편집 시 사용
  mode?: 'add' | 'edit' | 'bulk'; // 모드 구분
  onSave: (products: Omit<Product, "id">[], updatedProductId?: string, updatedProductIds?: string[]) => void;
  onCancel: () => void;
}

import { 
  getAllCarrierCodes, 
  getAllStorageCodes, 
  CARRIER_LABELS, 
  STORAGE_LABELS,
  STORAGE_CODES,
  type CarrierCode,
  type StorageCode
} from '../../lib/constants/codes';

const carrierOptions = getAllCarrierCodes();
const storageOptions = getAllStorageCodes();
const conditionOptions = [
  "번호이동",
  "신규가입", 
  "기기변경",
  ...Object.values(ADDITIONAL_CONDITIONS)
];

// 기본 용량 매핑
const getDefaultStorages = (modelName: string): StorageCode[] => {
  if (modelName.includes("Pro") || modelName.includes("Ultra") || modelName.includes("Fold")) {
    return [STORAGE_CODES.GB_128, STORAGE_CODES.GB_256, STORAGE_CODES.GB_512, STORAGE_CODES.TB_1];
  } else if (modelName.includes("Flip")) {
    return [STORAGE_CODES.GB_256, STORAGE_CODES.GB_512];
  } else {
    return [STORAGE_CODES.GB_128, STORAGE_CODES.GB_256, STORAGE_CODES.GB_512];
  }
};

export default function ProductBulkEditor({
  products,
  editingProduct = null,
  editingProducts = [],
  mode = 'bulk',
  onSave,
  onCancel,
}: ProductBulkEditorProps) {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  // phoneModels 상태 제거 - deviceModels 사용
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [modelTab, setModelTab] = useState<"samsung" | "apple">("samsung");
  const [editorMode, setEditorMode] = useState<"manual" | "table">("manual");
  const [searchQuery, setSearchQuery] = useState("");

  // 단말기 데이터 로드
  useEffect(() => {
    const loadDeviceModels = async () => {
      try {
        const models = await getDeviceModels();
        setDeviceModels(models);
      } catch (error) {
        console.error('단말기 데이터 로드 실패:', error);
      }
    };
    
    loadDeviceModels();
  }, []);

  // 초기 데이터 설정
  useEffect(() => {
    let initialRows: ProductRow[] = [];

    if (mode === 'edit' && editingProduct) {
      // 단일 상품 편집 모드
      initialRows = [{
        id: editingProduct.id,
        model: editingProduct.model,
        carrier: editingProduct.carrier,
        storage: editingProduct.storage,
        price: editingProduct.price.toString(),
        conditions: editingProduct.conditions,
        isActive: editingProduct.isActive,
        isNew: false,
        hasErrors: false,
      }];
    } else if (mode === 'bulk' && editingProducts.length > 0) {
      // 선택된 여러 상품 편집 모드
      initialRows = editingProducts.map(product => ({
        id: product.id,
        model: product.model,
        carrier: product.carrier,
        storage: product.storage,
        price: product.price.toString(),
        conditions: product.conditions,
        isActive: product.isActive,
        isNew: false,
        hasErrors: false,
      }));
    } else if (mode === 'bulk') {
      // 일괄 편집 모드 (기존 로직)
      initialRows = products.map(product => ({
        id: product.id,
        model: product.model,
        carrier: product.carrier,
        storage: product.storage,
        price: product.price.toString(),
        conditions: product.conditions,
        isActive: product.isActive,
        isNew: false,
        hasErrors: false,
      }));

      // 빈 행 하나 추가
      if (initialRows.length === 0) {
        initialRows.push(createEmptyRow());
      }
    } else {
      // 신규 추가 모드
      initialRows = [createEmptyRow()];
    }

    setRows(initialRows);
  }, [products, editingProduct, editingProducts, mode]);

  const createEmptyRow = (): ProductRow => ({
    id: `new-${Date.now()}-${Math.random()}`,
    model: "",
    carrier: "" as CarrierCode,
    storage: "" as StorageCode,
    price: "",
    conditions: [],
    isActive: true,
    isNew: true,
    hasErrors: false,
  });

  const validateRow = (row: ProductRow): boolean => {
    return !!(
      row.model.trim() &&
      row.carrier &&
      row.storage &&
      row.price &&
      !isNaN(Number(row.price)) &&
      Number(row.price) > 0
    );
  };

  const updateRow = (id: string, field: keyof ProductRow, value: any) => {
    setRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        updatedRow.hasErrors = !validateRow(updatedRow);
        return updatedRow;
      }
      return row;
    }));
    setHasChanges(true);
  };

  const addRow = () => {
    // 단일 상품 편집 모드가 아닐 때만 행 추가 가능
    if (!(mode === 'edit' && editingProduct)) {
      setRows(prev => [...prev, createEmptyRow()]);
      setHasChanges(true);
    }
  };

  const removeRow = (id: string) => {
    // 단일 상품 편집 모드가 아닐 때만 행 삭제 가능
    if (!(mode === 'edit' && editingProduct)) {
      setRows(prev => prev.filter(row => row.id !== id));
      setHasChanges(true);
    }
  };

  const duplicateRow = (sourceRow: ProductRow) => {
    const newRow: ProductRow = {
      ...sourceRow,
      id: `new-${Date.now()}-${Math.random()}`,
      isNew: true,
    };
    setRows(prev => {
      const index = prev.findIndex(row => row.id === sourceRow.id);
      const newRows = [...prev];
      newRows.splice(index + 1, 0, newRow);
      return newRows;
    });
    setHasChanges(true);
  };

  const addModelTemplate = (modelName: string) => {
    const newRow = {
      id: `new-${Date.now()}-${Math.random()}`,
      model: modelName,
      carrier: "" as CarrierCode,
      storage: STORAGE_CODES.GB_256, // 기본 256GB로 고정
      price: "",
      conditions: [] as string[],
      isActive: true,
      isNew: true,
      hasErrors: true, // 초기에는 필수 필드가 비어있으므로 에러
    };

    setRows(prev => [...prev, newRow]);
    setHasChanges(true);
  };

  const handleConditionToggle = (rowId: string, condition: string) => {
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newConditions = row.conditions.includes(condition)
          ? row.conditions.filter(c => c !== condition)
          : [...row.conditions, condition];
        return { ...row, conditions: newConditions };
      }
      return row;
    }));
    setHasChanges(true);
  };

  const handleModelSelect = (modelId: string) => {
    const model = (deviceModels || []).find((m) => m.id === modelId);
    if (model && selectedRowId) {
      updateRow(selectedRowId, "model", model.model);
      setShowModelModal(false);
      setSelectedRowId("");
    }
  };

  const toggleModelFavorite = (modelId: string) => {
    // TODO: 단말기 즐겨찾기 기능 구현 (로컬 스토리지 또는 서버 연동)
    console.log('즐겨찾기 토글:', modelId);
  };

  const openModelModal = (rowId: string) => {
    console.log('모델 모달 열기:', rowId);
    console.log('현재 deviceModels:', deviceModels);
    setSelectedRowId(rowId);
    setShowModelModal(true);
  };

  const filteredModels = (deviceModels || []).filter((model) => {
    const isManufacturerMatch = modelTab === "samsung" ? model.manufacturer === "SAMSUNG" : model.manufacturer === "APPLE";
    const isSearchMatch = searchQuery === "" || 
      model.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      MANUFACTURER_LABELS[model.manufacturer as keyof typeof MANUFACTURER_LABELS].toLowerCase().includes(searchQuery.toLowerCase());
    
    return isManufacturerMatch && isSearchMatch;
  });

  const handleSave = () => {
    const validRows = rows.filter(row => validateRow(row));
    const now = new Date();
    const productsToSave: Omit<Product, "id">[] = validRows.map(row => ({
      model: row.model.trim(),
      carrier: row.carrier,
      storage: row.storage,
      price: Number(row.price),
      conditions: row.conditions,
      isActive: row.isActive,
      createdAt: row.isNew ? now : undefined,
      updatedAt: now,
    }));

    if (mode === 'edit' && editingProduct) {
      // 단일 상품 편집 모드인 경우 편집할 상품의 ID 전달
      onSave(productsToSave, editingProduct.id);
    } else if (mode === 'bulk' && editingProducts.length > 0) {
      // 여러 상품 편집 모드인 경우 편집할 상품들의 ID 전달
      const updatedProductIds = validRows.map(row => row.id).filter(id => !id.startsWith('new-'));
      onSave(productsToSave, undefined, updatedProductIds);
    } else {
      // 일괄 추가 모드
      onSave(productsToSave);
    }
  };

  const hasValidRows = rows.some(row => validateRow(row));
  const hasInvalidRows = rows.some(row => row.hasErrors && (row.model || row.carrier || row.storage || row.price));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {mode === 'edit' && editingProduct ? '상품 편집' 
             : mode === 'bulk' && editingProducts.length > 0 ? `선택 상품 편집 (${editingProducts.length}개)`
             : '상품 일괄 편집'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'edit' && editingProduct
              ? '선택한 상품의 정보를 수정할 수 있습니다'
              : mode === 'bulk' && editingProducts.length > 0
              ? '선택한 여러 상품의 정보를 한번에 수정할 수 있습니다'
              : '여러 상품을 한번에 추가하거나 수정할 수 있습니다'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {hasChanges && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>변경사항을 취소하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    저장되지 않은 변경사항이 모두 사라집니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>계속 편집</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>
                    취소하기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!hasChanges && (
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              닫기
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={!hasValidRows}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                저장 ({rows.filter(row => validateRow(row)).length}개)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {mode === 'edit' && editingProduct ? '상품 수정 확인' 
                   : mode === 'bulk' && editingProducts.length > 0 ? `선택 상품 수정 확인`
                   : '상품 저장 확인'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {mode === 'edit' && editingProduct ? (
                    <>
                      <strong>{editingProduct.model}</strong> 상품의 정보를 수정하시겠습니까?
                      <div className="mt-2 text-sm text-muted-foreground">
                        수정된 정보는 즉시 반영됩니다.
                      </div>
                    </>
                  ) : mode === 'bulk' && editingProducts.length > 0 ? (
                    <>
                      선택한 <strong>{editingProducts.length}개 상품</strong>의 정보를 수정하시겠습니까?
                      <div className="mt-2 text-sm text-muted-foreground">
                        • 수정될 상품: {editingProducts.map(p => p.model).join(', ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        • 새로 추가될 상품: {rows.filter(row => validateRow(row) && row.isNew).length}개
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>{rows.filter(row => validateRow(row)).length}개의 새로운 상품</strong>을 등록하시겠습니까?
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        {rows.filter(row => validateRow(row)).slice(0, 3).map((row, index) => (
                          <div key={index}>
                            • {row.model} ({row.carrier}, {row.storage})
                          </div>
                        ))}
                        {rows.filter(row => validateRow(row)).length > 3 && (
                          <div>
                            • 외 {rows.filter(row => validateRow(row)).length - 3}개
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {mode === 'edit' && editingProduct ? '수정하기' 
                   : mode === 'bulk' && editingProducts.length > 0 ? '수정하기'
                   : '등록하기'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 편집 모드 선택 탭 */}
      <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as "manual" | "table")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>수동 입력</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center space-x-2">
            <TableIcon className="h-4 w-4" />
            <span>테이블 입력</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          {/* 기존 수동 입력 UI */}
      {!(mode === 'edit' && editingProduct) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              빠른 추가
              <span className="text-sm text-muted-foreground ml-2">(즐겨찾는 모델)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(deviceModels || []).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {(deviceModels || []).slice(0, 8).map((model) => (
                  <Button
                    key={model.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addModelTemplate(model.model)}
                    className="text-xs h-auto p-2 flex-col"
                  >
                    <span className="font-medium">{model.model}</span>
                    <span className="text-muted-foreground">
                      {MANUFACTURER_LABELS[model.manufacturer as keyof typeof MANUFACTURER_LABELS]}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <p>단말기 데이터를 불러오는 중...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasInvalidRows && (
        <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-700">
            일부 행에 오류가 있습니다. 필수 항목을 모두 입력해주세요.
          </span>
        </div>
      )}

      {/* 상품 테이블 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">모델명 *</TableHead>
                  <TableHead className="w-[100px]">통신사 *</TableHead>
                  <TableHead className="w-[100px]">용량 *</TableHead>
                  <TableHead className="w-[120px]">가격 *</TableHead>
                  <TableHead>조건</TableHead>
                  <TableHead className="w-[80px]">노출</TableHead>
                  <TableHead className="w-[100px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className={row.hasErrors ? "bg-red-50" : ""}
                  >
                    <TableCell>
                      <div className="relative">
                        <Input
                          readOnly
                          value={row.model}
                          placeholder="모델 선택"
                          className={`cursor-pointer pr-8 ${row.hasErrors && !row.model ? "border-red-300" : ""}`}
                          onClick={() => openModelModal(row.id)}
                        />
                        <ChevronDown className="h-3 w-3 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.carrier}
                        onValueChange={(value) => updateRow(row.id, "carrier", value)}
                      >
                        <SelectTrigger className={row.hasErrors && !row.carrier ? "border-red-300" : ""}>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {carrierOptions.map((carrier) => (
                            <SelectItem key={carrier} value={carrier}>
                              {CARRIER_LABELS[carrier]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.storage}
                        onValueChange={(value) => updateRow(row.id, "storage", value)}
                      >
                        <SelectTrigger className={row.hasErrors && !row.storage ? "border-red-300" : ""}>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {storageOptions.map((storage) => (
                            <SelectItem key={storage} value={storage}>
                              {STORAGE_LABELS[storage]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateRow(row.id, "price", e.target.value)}
                        placeholder="1000000"
                        className={row.hasErrors && (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) ? "border-red-300" : ""}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {conditionOptions.map((condition) => (
                          <Badge
                            key={condition}
                            variant={row.conditions.includes(condition) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => handleConditionToggle(row.id, condition)}
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={row.isActive}
                        onCheckedChange={(checked) => updateRow(row.id, "isActive", checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {!(mode === 'edit' && editingProduct) && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateRow(row)}
                            title="행 복사"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.id)}
                            title="행 삭제"
                            disabled={rows.length === 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {mode === 'edit' && editingProduct && (
                        <div className="text-xs text-muted-foreground">
                          편집 중
                        </div>
                      )}
                      {mode === 'bulk' && editingProducts.length > 0 && !row.isNew && (
                        <div className="text-xs text-muted-foreground">
                          수정 중
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!(mode === 'edit' && editingProduct) && (
            <div className="p-4 border-t">
              <Button variant="outline" onClick={addRow} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                행 추가
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>* 필수 입력 항목</p>
        <p>• 조건: 클릭하여 선택/해제할 수 있습니다</p>
        <p>• 행 복사: 같은 모델의 다른 용량을 쉽게 추가할 수 있습니다</p>
        <p>• 모델명: 클릭하여 모델을 선택할 수 있습니다</p>
      </div>

      {/* Model Selection Modal */}
      <Dialog
        open={showModelModal}
        onOpenChange={setShowModelModal}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              원하는 휴대폰을 선택해주세요
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 검색 입력 */}
            <div className="space-y-2">
              <Input
                placeholder="모델명 또는 제조사로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

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
            </Tabs>

            {/* 모델 목록 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg border"
                  >
                    <div className="w-12 h-12 mr-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {model.imageUrl ? (
                        <img
                          src={model.imageUrl}
                          alt={model.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📱
                        </div>
                      )}
                    </div>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleModelSelect(model.id)}
                    >
                      <div className="font-medium">
                        {model.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {MANUFACTURER_LABELS[model.manufacturer as keyof typeof MANUFACTURER_LABELS]}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModelFavorite(model.id);
                      }}
                    >
                      <Star 
                        className="h-5 w-5 text-gray-400" 
                      />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>검색 결과가 없습니다.</p>
                  <p className="text-sm">다른 검색어를 시도해보세요.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <ProductTableEditor
            onSave={(tableProducts) => {
              // 테이블에서 생성된 상품들을 기존 rows에 추가
              const newRows: ProductRow[] = tableProducts.map(product => ({
                id: product.id,
                model: product.model,
                carrier: product.carrier,
                storage: product.storage,
                price: product.price.toString(),
                conditions: product.conditions,
                isActive: product.isActive,
                isNew: true,
                hasErrors: false,
              }));
              
              setRows(prev => [...prev, ...newRows]);
              setHasChanges(true);
            }}
            onCancel={() => setEditorMode("manual")}
            existingProducts={rows.map(row => ({
              id: row.id,
              model: row.model,
              carrier: row.carrier,
              storage: row.storage,
              price: parseInt(row.price) || 0,
              conditions: row.conditions,
              isActive: row.isActive,
            }))}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}