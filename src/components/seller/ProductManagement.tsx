"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { PageLoadingSpinner } from "../ui/loading-spinner";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Square, CheckSquare, Filter, ArrowUpDown, X, Smartphone, FileText } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
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
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import ProductBulkEditor from "./ProductBulkEditor";
import ProductLogDialog, { type ProductLog } from "./ProductLogDialog";
import { getPhoneModels, type PhoneModel } from "../../lib/phoneModels";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkCreateProducts,
  bulkUpdateProducts,
  bulkDeleteProducts,
  type ProductWithDetails 
} from "../../lib/api/products";

// Product 인터페이스는 ProductWithDetails로 대체
type Product = ProductWithDetails;

export default function ProductManagement() {
  // 서버에서 데이터 로드
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productLogs, setProductLogs] = useState<ProductLog[]>([]);

  // 상품 데이터 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getProducts({ 
          // storeId 필터 제거 - 모든 상품 조회 (개발용)
          page: 1,
          limit: 100
        });
        // 날짜 문자열을 Date 객체로 변환
        const productsWithDates = result.products.map(product => ({
          ...product,
          createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
        }));
        setProducts(productsWithDates);
      } catch (err) {
        console.error('상품 데이터 로드 실패:', err);
        setError('상품 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const onEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditorMode('edit');
    setShowBulkEditor(true);
  };

  const onDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('상품 삭제 실패:', err);
      setError('상품 삭제에 실패했습니다.');
    }
  };

  const onBulkSave = async (newProducts: Omit<Product, "id">[], updatedProductId?: string, updatedProductIds?: string[]) => {
    try {
      if (editorMode === 'add') {
        // 상품 일괄 생성
        const createRequests = newProducts.map(product => ({
          storeId: 'temp-store-id', // 임시 storeId (개발용)
          deviceModelId: product.deviceModelId,
          carrier: product.carrier,
          storage: product.storage,
          price: product.price,
          conditions: product.conditions,
          isActive: product.isActive
        }));

        const result = await bulkCreateProducts(createRequests);
        if (result.success) {
          // 성공한 경우 서버에서 최신 데이터 다시 로드
          const latestResult = await getProducts({ 
            // storeId 필터 제거,
            page: 1,
            limit: 100
          });
          // 날짜 문자열을 Date 객체로 변환
          const productsWithDates = latestResult.products.map(product => ({
            ...product,
            createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
            updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
          }));
          setProducts(productsWithDates);
        } else {
          setError('상품 생성에 실패했습니다.');
        }
      } else if (editorMode === 'edit' && updatedProductId) {
        // 단일 상품 수정
        const updateData = newProducts[0];
        const updatedProduct = await updateProduct(updatedProductId, {
          carrier: updateData.carrier,
          storage: updateData.storage,
          price: updateData.price,
          conditions: updateData.conditions,
          isActive: updateData.isActive
        });
        setProducts(prev => prev.map(p => p.id === updatedProductId ? {
          ...updatedProduct,
          createdAt: updatedProduct.createdAt ? new Date(updatedProduct.createdAt) : new Date(),
          updatedAt: updatedProduct.updatedAt ? new Date(updatedProduct.updatedAt) : new Date()
        } : p));
      } else if (editorMode === 'bulk' && updatedProductIds) {
        // 상품 일괄 수정
        const updates: Record<string, any> = {};
        newProducts.forEach(product => {
          const productId = updatedProductIds.find(id => 
            products.find(p => p.id === id)?.deviceModelId === product.deviceModelId
          );
          if (productId) {
            updates[productId] = {
              carrier: product.carrier,
              storage: product.storage,
              price: product.price,
              conditions: product.conditions,
              isActive: product.isActive
            };
          }
        });

        const result = await bulkUpdateProducts(updates);
        if (result.success) {
          // 성공한 경우 서버에서 최신 데이터 다시 로드
          const latestResult = await getProducts({ 
            // storeId 필터 제거,
            page: 1,
            limit: 100
          });
          // 날짜 문자열을 Date 객체로 변환
          const productsWithDates = latestResult.products.map(product => ({
            ...product,
            createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
            updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
          }));
          setProducts(productsWithDates);
        } else {
          setError('상품 수정에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('상품 저장 실패:', err);
      setError('상품 저장에 실패했습니다.');
    }
  };
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProducts, setEditingProducts] = useState<Product[]>([]);
  const [editorMode, setEditorMode] = useState<'add' | 'edit' | 'bulk'>('bulk');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // 필터 상태
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [storageFilter, setStorageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  const [tempConditionFilter, setTempConditionFilter] = useState<string[]>([]);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [modelFilter, setModelFilter] = useState<string[]>([]);
  const [tempModelFilter, setTempModelFilter] = useState<string[]>([]);
  const [showModelModal, setShowModelModal] = useState(false);
  const [modelTab, setModelTab] = useState<"samsung" | "apple">("samsung");
  const [sortBy, setSortBy] = useState<string>('updated-desc');

  // 모델 데이터
  const [phoneModels] = useState<PhoneModel[]>(getPhoneModels());

  // 로그 다이얼로그 상태
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedProductForLog, setSelectedProductForLog] = useState<Product | null>(null);

  // 필터 옵션들
  const carrierOptions = ['SKT', 'KT', 'LG U+'];
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const conditionOptions = ['번호이동', '신규가입', '기기변경', '카드할인', '결합할인', '필수요금제', '부가서비스'];
  const sortOptions = [
    { value: 'updated-desc', label: '최신순' },
    { value: 'updated-asc', label: '오래된 순' },
    { value: 'price-desc', label: '가격순 (높은)' },
    { value: 'price-asc', label: '가격순 (낮은)' },
  ];

  // 날짜 포맷 함수 (YY.MM.DD HH:mm)
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '-';
    
    const d = new Date(date);
    const year = d.getFullYear().toString().slice(-2); // YY
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // MM
    const day = d.getDate().toString().padStart(2, '0'); // DD
    const hours = d.getHours().toString().padStart(2, '0'); // HH
    const minutes = d.getMinutes().toString().padStart(2, '0'); // mm
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 필터링 및 정렬된 상품 목록
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // 모델명 필터
    if (modelFilter.length > 0) {
      filtered = filtered.filter(product => 
        modelFilter.some(model => product.deviceModel.model === model)
      );
    }

    // 통신사 필터
    if (carrierFilter !== 'all') {
      filtered = filtered.filter(product => product.carrier === carrierFilter);
    }

    // 용량 필터
    if (storageFilter !== 'all') {
      filtered = filtered.filter(product => product.storage === storageFilter);
    }

    // 노출 상태 필터
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(product => product.isActive === isActive);
    }

    // 조건 필터
    if (conditionFilter.length > 0) {
      filtered = filtered.filter(product => 
        conditionFilter.some(condition => product.conditions.includes(condition))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated-desc':
          return (b.updatedAt?.getTime() || b.createdAt?.getTime() || 0) - 
                 (a.updatedAt?.getTime() || a.createdAt?.getTime() || 0);
        case 'updated-asc':
          return (a.updatedAt?.getTime() || a.createdAt?.getTime() || 0) - 
                 (b.updatedAt?.getTime() || b.createdAt?.getTime() || 0);
        case 'price-desc':
          return b.price - a.price;
        case 'price-asc':
          return a.price - b.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, modelFilter, carrierFilter, storageFilter, statusFilter, conditionFilter, sortBy]);

  // 필터 초기화
  const resetFilters = () => {
    setModelFilter([]);
    setTempModelFilter([]);
    setCarrierFilter('all');
    setStorageFilter('all');
    setStatusFilter('all');
    setConditionFilter([]);
    setTempConditionFilter([]);
    setSortBy('updated-desc');
  };

  // 활성 필터 개수
  const activeFiltersCount = [
    modelFilter.length > 0 ? 1 : 0,
    carrierFilter !== 'all' ? 1 : 0,
    storageFilter !== 'all' ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    conditionFilter.length > 0 ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  // 조건 선택 핸들러 (임시 상태)
  const handleConditionToggle = (condition: string) => {
    setTempConditionFilter(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  // 조건 모달 열기 핸들러
  const openConditionModal = () => {
    setTempConditionFilter([...conditionFilter]); // 현재 필터 상태를 임시 상태에 복사
    setShowConditionModal(true);
  };

  // 조건 모달 적용 핸들러
  const applyConditionFilter = () => {
    setConditionFilter([...tempConditionFilter]); // 임시 상태를 실제 필터에 적용
    setShowConditionModal(false);
  };

  // 조건 모달 취소 핸들러
  const cancelConditionFilter = () => {
    setTempConditionFilter([...conditionFilter]); // 원래 상태로 되돌림
    setShowConditionModal(false);
  };

  // 모델 선택 핸들러 (임시 상태)
  const handleModelToggle = (modelName: string) => {
    setTempModelFilter(prev => 
      prev.includes(modelName)
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  // 모델 모달 열기 핸들러
  const openModelModal = () => {
    setTempModelFilter([...modelFilter]); // 현재 필터 상태를 임시 상태에 복사
    setShowModelModal(true);
  };

  // 모델 모달 적용 핸들러
  const applyModelFilter = () => {
    setModelFilter([...tempModelFilter]); // 임시 상태를 실제 필터에 적용
    setShowModelModal(false);
  };

  // 모델 모달 취소 핸들러
  const cancelModelFilter = () => {
    setTempModelFilter([...modelFilter]); // 원래 상태로 되돌림
    setShowModelModal(false);
  };

  // 현재 등록된 모델들만 추출 (중복 제거)
  const registeredModels = useMemo(() => {
    const modelNames = [...new Set(products.map(product => product.deviceModel.model))];
    return modelNames.sort();
  }, [products]);

  // 탭별 모델 필터링
  const filteredModels = phoneModels.filter(
    (model) => model.brand === modelTab,
  );

  const handleBulkSave = (newProducts: Omit<Product, "id">[], updatedProductId?: string, updatedProductIds?: string[]) => {
    onBulkSave(newProducts, updatedProductId, updatedProductIds);
    setShowBulkEditor(false);
    setEditingProduct(null);
    setEditingProducts([]);
    setEditorMode('bulk');
    setSelectedProducts(new Set());
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setEditingProducts([]);
    setEditorMode('edit');
    setShowBulkEditor(true);
  };

  const handleBulkEdit = () => {
    const selectedProductsArray = filteredAndSortedProducts.filter(p => selectedProducts.has(p.id));
    setEditingProducts(selectedProductsArray);
    setEditingProduct(null);
    setEditorMode('bulk');
    setShowBulkEditor(true);
  };

  const handleProductSelection = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredAndSortedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedProducts.forEach(productId => {
      onDeleteProduct(productId);
    });
    setSelectedProducts(new Set());
  };

  const handleSingleDelete = (productId: string) => {
    onDeleteProduct(productId);
  };

  // 로그 보기 핸들러
  const handleViewLog = (product: Product) => {
    setSelectedProductForLog(product);
    setShowLogDialog(true);
  };

  const selectedCount = selectedProducts.size;
  const isAllSelected = selectedCount === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0;

  if (showBulkEditor) {
    return (
      <ProductBulkEditor
        products={products}
        editingProduct={editingProduct}
        editingProducts={editingProducts}
        mode={editorMode}
        onSave={handleBulkSave}
        onCancel={() => {
          setShowBulkEditor(false);
          setEditingProduct(null);
          setEditingProducts([]);
          setEditorMode('bulk');
          setSelectedProducts(new Set());
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <PageLoadingSpinner text="상품 데이터를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          상품 목록 ({filteredAndSortedProducts.length}/{products.length})
        </h3>
        <div className="flex space-x-2">
          {selectedCount > 0 && (
            <>
              <Button 
                variant="outline"
                onClick={handleBulkEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                선택 편집 ({selectedCount})
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    선택 삭제 ({selectedCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>상품 삭제 확인</AlertDialogTitle>
                    <AlertDialogDescription>
                      선택한 <strong>{selectedCount}개의 상품</strong>을 삭제하시겠습니까?
                      <div className="mt-3 text-sm text-red-600 font-medium">
                        삭제된 상품은 복구할 수 없습니다.
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      삭제하기
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button onClick={() => {
            setEditorMode('add');
            setEditingProduct(null);
            setEditingProducts([]);
            setShowBulkEditor(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            상품 추가
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="space-y-4">
        {/* 필터 및 정렬 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 모델명 필터 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">모델명:</span>
            <Dialog open={showModelModal} onOpenChange={(open) => {
              if (open) {
                openModelModal();
              } else {
                cancelModelFilter();
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-28 justify-between"
                  size="sm"
                  onClick={openModelModal}
                >
                  {modelFilter.length === 0 
                    ? '전체' 
                    : `${modelFilter.length}개`
                  }
                  <Smartphone className="h-3 w-3 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>모델명 선택</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
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
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredModels.map((model) => {
                      // 현재 등록된 모델인지 확인
                      const isRegistered = registeredModels.includes(model.name);
                      
                      return (
                        <div key={model.id} className={`flex items-center space-x-3 p-2 rounded-lg ${!isRegistered ? 'opacity-50' : ''}`}>
                          <Checkbox
                            id={model.id}
                            checked={tempModelFilter.includes(model.name)}
                            onCheckedChange={() => handleModelToggle(model.name)}
                            disabled={!isRegistered}
                          />
                          <div className="w-10 h-10 mr-2 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={model.image}
                              alt={model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <label
                            htmlFor={model.id}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 ${!isRegistered ? 'text-muted-foreground' : ''}`}
                          >
                            {model.name}
                            {!isRegistered && (
                              <span className="text-xs text-muted-foreground ml-1">(미등록)</span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempModelFilter([])}
                  >
                    전체 해제
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelModelFilter}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={applyModelFilter}
                    >
                      적용 ({tempModelFilter.length})
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 통신사 필터 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">통신사:</span>
            <Select value={carrierFilter} onValueChange={setCarrierFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {carrierOptions.map(carrier => (
                  <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 용량 필터 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">용량:</span>
            <Select value={storageFilter} onValueChange={setStorageFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {storageOptions.map(storage => (
                  <SelectItem key={storage} value={storage}>{storage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 노출 상태 필터 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">노출:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">노출</SelectItem>
                <SelectItem value="inactive">미노출</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 조건 필터 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">조건:</span>
            <Dialog open={showConditionModal} onOpenChange={(open) => {
              if (open) {
                openConditionModal();
              } else {
                cancelConditionFilter();
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-28 justify-between"
                  size="sm"
                  onClick={openConditionModal}
                >
                  {conditionFilter.length === 0 
                    ? '전체' 
                    : `${conditionFilter.length}개`
                  }
                  <Filter className="h-3 w-3 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>조건 선택</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {conditionOptions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-3">
                      <Checkbox
                        id={condition}
                        checked={tempConditionFilter.includes(condition)}
                        onCheckedChange={() => handleConditionToggle(condition)}
                      />
                      <label
                        htmlFor={condition}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
                <DialogFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempConditionFilter([])}
                  >
                    전체 해제
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelConditionFilter}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={applyConditionFilter}
                    >
                      적용 ({tempConditionFilter.length})
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 정렬 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">정렬:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 필터 초기화 버튼 */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              초기화 ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="space-y-2">
            <p>등록된 상품이 없습니다.</p>
            <p className="text-sm">상품 추가 버튼을 눌러 새 상품을 등록해보세요.</p>
          </div>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="space-y-2">
            <p>필터 조건에 맞는 상품이 없습니다.</p>
            <p className="text-sm">필터를 조정해보세요.</p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
              <X className="h-4 w-4 mr-1" />
              필터 초기화
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[180px]">모델명</TableHead>
                <TableHead className="w-[80px]">통신사</TableHead>
                <TableHead className="w-[80px]">용량</TableHead>
                <TableHead className="w-[100px]">가격</TableHead>
                <TableHead className="min-w-[150px]">조건</TableHead>
                <TableHead className="w-[80px]">노출</TableHead>
                <TableHead className="w-[110px]">업데이트</TableHead>
                <TableHead className="w-[120px] text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={(checked) => 
                        handleProductSelection(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.deviceModel.model}
                  </TableCell>
                  <TableCell>
                    {product.carrier}
                  </TableCell>
                  <TableCell>
                    {product.storage}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {product.price.toLocaleString()}원
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.conditions.map((condition, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {product.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.isActive ? "노출" : "미노출"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>
                      {formatDate(product.updatedAt || product.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLog(product)}
                        className="h-8 w-8 p-0"
                        title="이력 조회"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleProductEdit(product)}
                        className="h-8 w-8 p-0"
                        title="편집"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>상품 삭제 확인</AlertDialogTitle>
                            <AlertDialogDescription>
                              상품을 삭제하시겠습니까?
                              <div className="mt-3 text-sm text-red-600 font-medium">
                                삭제된 상품은 복구할 수 없습니다.
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleSingleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              삭제하기
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 상품 로그 다이얼로그 */}
      {selectedProductForLog && (
        <ProductLogDialog
          open={showLogDialog}
          onOpenChange={setShowLogDialog}
          productModel={selectedProductForLog.model}
          productId={selectedProductForLog.id}
          logs={productLogs}
        />
      )}
    </div>
  );
}