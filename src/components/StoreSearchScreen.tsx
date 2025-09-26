import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  SlidersHorizontal,
  MapPin,
  List,
  Search,
  ArrowLeft,
  X,
  Phone,
  Clock,
  Heart,
  RotateCcw,
  User,
  Smartphone,
  ChevronDown,
  Crosshair,
} from "lucide-react";
import { getConditionStyle } from "../lib/conditionStyles";
import { StoreConditionChips } from "./StoreConditionChips";
import { getPhoneModels, type PhoneModel } from "../lib/phoneModels";
import { useStores, useStoreProducts, useProducts } from "@/hooks/useApi";

interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  rating: number;
  reviewCount: number;
  model: string;
  price: number;
  originalPrice: number;
  conditions: string[];
  hours: string;
  position: { x: number; y: number };
  image: string;
  // 상품별 통신사 정보 (상단 검색 select와는 다른 정보)
  productCarrier: "kt" | "skt" | "lgu";
  businessHours?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
}

interface FilterState {
  signupType: string[];
  conditions: string[];
  priceRange: number[];
  storage: string[];
}

// PhoneModel interface is now imported from lib/phoneModels.ts

interface StoreSearchScreenProps {
  onStoreSelect: (store: Store) => void;
  onBack: () => void;
}


export default function StoreSearchScreen({
  onStoreSelect,
  onBack,
}: StoreSearchScreenProps) {
  // 실제 products 데이터 조회
  const productsQuery = useProducts({ enabled: true });
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">(
    "list",
  );
  const [showFilter, setShowFilter] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedStore, setSelectedStore] =
    useState<Store | null>(null);
  const [selectedCarrier, setSelectedCarrier] =
    useState<string>("kt");
  const [selectedModel, setSelectedModel] =
    useState<string>("");
  const [selectedStorage, setSelectedStorage] =
    useState<string>("256gb");
  const [modelTab, setModelTab] = useState<"samsung" | "apple">(
    "samsung",
  );
  const [sortBy, setSortBy] = useState("거리순");

  // 임시 필터 상태 (모달에서 수정 중)
  const [tempFilters, setTempFilters] = useState<FilterState>({
    signupType: [],
    conditions: [],
    priceRange: [0, 200],
    storage: ["256gb"],
  });
  
  // 적용된 필터 상태 (실제 API 호출에 사용)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    signupType: [],
    conditions: [],
    priceRange: [0, 200],
    storage: ["256gb"],
  });

  // 가격 범위는 만원 단위로 가정 → 원화로 변환
  const minPriceWon = Math.max(0, (appliedFilters.priceRange?.[0] ?? 0)) * 10000;
  const maxPriceWon = Math.max(0, (appliedFilters.priceRange?.[1] ?? 0)) * 10000;
  
  // 필터 조건 확인 (모든 필터를 합쳐서 확인)
  const hasProductFilters = selectedCarrier !== "kt" || 
    (appliedFilters.priceRange?.[0] ?? 0) > 0 || 
    (appliedFilters.priceRange?.[1] ?? 0) < 200 ||
    selectedStorage !== "256gb" ||
    (appliedFilters.signupType?.length ?? 0) > 0 ||
    (appliedFilters.conditions?.length ?? 0) > 0 ||
    selectedModel !== ""; // 모델명이 있으면 상품 검색
  
  // 매장 검색 파라미터 (모달 밖 필터)
  const storeSearchParams = {
    q: selectedModel || undefined,
    sortBy: sortBy === "거리순" ? "created_at.desc" : "name.asc"
  };
  
  // 상품 필터 파라미터 (모든 필터 조건을 합쳐서 조회)
  const productFilterParams = hasProductFilters ? {
    carrier: selectedCarrier,
    minPrice: String(minPriceWon),
    maxPrice: String(maxPriceWon),
    storage: selectedStorage || undefined,
    signupType: appliedFilters.signupType?.[0] || undefined,
    conditions: appliedFilters.conditions?.join(',') || undefined,
    q: selectedModel || undefined, // 모델명 검색 추가
  } : undefined;
  
  // 상품 검색만 사용하고, 매장 검색은 비활성화
  const storesQuery = useStores(storeSearchParams, { enabled: false }); // 매장 검색 비활성화
  const storeProductsQuery = useStoreProducts(productFilterParams, { enabled: hasProductFilters });

  // products 데이터를 PhoneModel 형태로 변환
  useEffect(() => {
    if (productsQuery.data) {
      const items = productsQuery.data.pages.flatMap((p: any) => p.items) as any[];
      const models: PhoneModel[] = items.map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand?.toLowerCase() === 'samsung' ? 'samsung' : 'apple', // 대소문자 구분 없이 처리
        image: product.image_url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop",
        isFavorite: false, // 기본값
      }));
      setPhoneModels(models);
    }
  }, [productsQuery.data]);

  // 필터 적용 함수
  const applyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setShowFilter(false);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    const defaultFilters = {
      signupType: [],
      conditions: [],
      priceRange: [0, 200],
      storage: ["256gb"],
    };
    setTempFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setShowFilter(false);
  };

  const signupTypeOptions = [
    "번호이동",
    "신규가입",
    "기기변경",
  ];
  const conditionOptions = [
    "필수 요금제",
    "카드 할인",
    "결합 할인",
    "부가서비스",
  ];

  const carrierOptions = [
    { value: "kt", label: "KT" },
    { value: "skt", label: "SKT" },
    { value: "lgu", label: "LG U+" },
  ];

  const toggleFilter = (
    category: 'signupType' | 'conditions' | 'storage',
    value: string,
  ) => {
    setTempFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };


  // getConditionStyle 어댑터: 기대 타입으로 변환
  const Noop: React.FC = () => null;
  const getConditionBadgeStyle = (condition: string) => {
    const s = getConditionStyle(condition);
    return {
      icon: (s.icon as unknown as React.FC<{}>) ?? Noop,
      className: s.className,
    };
  };

  const handleStoreClick = (store: Store | null) => {
    if (viewMode === "map") {
      setSelectedStore(store);
    } else if (store) {
      onStoreSelect(store);
    }
  };

  const handleModelSelect = (modelId: string) => {
    const model = phoneModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model.name);
      setShowModelModal(false);
    }
  };



  const filteredModels = phoneModels.filter(
    (model) => model.brand === modelTab,
  );

  // 정렬된 매장 목록
  const sortedStores = useMemo(() => {
    if (hasProductFilters && storeProductsQuery.data) {
      const items = storeProductsQuery.data.pages.flatMap((p: any) => p.items) as any[];
      
      // 상품이 없으면 빈 배열 반환 (안내 메시지 표시용)
      if (items.length === 0) {
        return [];
      }
      
      // store_id 기준으로 대표 상품을 선택하여 스토어 카드로 변환
      const byStore = new Map<string, any>();
      for (const it of items) {
        if (!byStore.has(it.store_id)) byStore.set(it.store_id, it);
      }
      const stores = Array.from(byStore.values()).map((sp: any) => ({
        id: sp.store_id,
        name: `매장 ${sp.store_id.slice(-4)}`, // 임시 매장명 (실제로는 매장 API에서 가져와야 함)
        address: "주소 정보 없음",
        distance: 0.5,
        phone: "-",
        rating: 4.5, // 기본 평점
        reviewCount: 0,
        model: sp.products?.model ?? "",
        price: Math.floor((sp.price ?? 0) / 10000), // 원화를 만원 단위로 변환
        originalPrice: Math.floor((sp.discount_price ?? sp.price ?? 0) / 10000),
        conditions: sp.conditions ? String(sp.conditions).replace(/[{}"]/g, '').split(',').map((c: string) => c.trim()) : [],
        hours: "09:00 - 21:00", // 기본 영업시간
        position: { x: Math.random() * 100, y: Math.random() * 100 }, // 랜덤 위치
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop",
        productCarrier: sp.carrier ?? selectedCarrier,
        businessHours: {
          weekday: "09:00 - 21:00",
          saturday: "10:00 - 20:00",
          sunday: "10:00 - 19:00"
        }
      }));
      return stores;
    }

    const apiItems = storesQuery.data
      ? (storesQuery.data.pages.flatMap((p: any) => p.items) as any[])
      : null;
    const stores = apiItems
      ? apiItems.map((s) => ({
          id: s.id,
          name: s.name,
          address: s.address ?? "주소 정보 없음",
          distance: 0.5,
          phone: s.phone ?? "-",
          rating: s.rating ?? 4.5,
          reviewCount: s.review_count ?? 0,
          model: "",
          price: 0,
          originalPrice: 0,
          conditions: [],
          hours: "09:00 - 21:00",
          position: { x: Math.random() * 100, y: Math.random() * 100 },
          image:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop",
          productCarrier: selectedCarrier as any,
          businessHours: {
            weekday: "09:00 - 21:00",
            saturday: "10:00 - 20:00",
            sunday: "10:00 - 19:00"
          }
        }))
      : [];

    if (sortBy === "거리순") {
      return stores.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "가격순") {
      return stores.sort((a, b) => a.price - b.price);
    }

    return stores;
  }, [sortBy, hasProductFilters, storeProductsQuery.data, storesQuery.data, selectedCarrier]);

  // 활성화된 필터가 있는지 확인 (적용된 필터 기준)
  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.signupType.length > 0 ||
      appliedFilters.conditions.length > 0 ||
      appliedFilters.storage.length > 0 ||
      appliedFilters.priceRange[0] !== 0 ||
      appliedFilters.priceRange[1] !== 200
    );
  }, [appliedFilters]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Filter & Model/Storage Bar */}
      <div className="border-b bg-white flex-shrink-0">
        <div className="overflow-x-auto filter-scroll">
          <div className="flex items-center space-x-0 px-2 py-3 min-w-max">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full filter-button"
                onClick={() => {
                  setTempFilters({ ...appliedFilters });
                  setShowFilter(true);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>

            {/* 통신사 Select */}
            <Select
              value={selectedCarrier}
              onValueChange={setSelectedCarrier}
            >
              <SelectTrigger className="no-border-select w-auto min-w-[4rem] h-9 rounded-full bg-background hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="통신사" />
              </SelectTrigger>
              <SelectContent>
                {carrierOptions.map((carrier) => (
                  <SelectItem
                    key={carrier.value}
                    value={carrier.value}
                  >
                    {carrier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 모델명 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="model-button rounded-full h-9 px-3 text-left justify-between min-w-0"
              onClick={() => setShowModelModal(true)}
            >
              <span className="truncate">
                {selectedModel
                  ? selectedModel
                  : "모델명"}
              </span>
              <ChevronDown className="h-3 w-3 ml-2 flex-shrink-0" />
            </Button>

            {/* 용량 Select */}
            <Select
              value={selectedStorage}
              onValueChange={setSelectedStorage}
            >
              <SelectTrigger className="no-border-select w-auto min-w-[4rem] h-9 rounded-full bg-background hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="용량" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128gb">128GB</SelectItem>
                <SelectItem value="256gb">256GB</SelectItem>
                <SelectItem value="512gb">512GB</SelectItem>
                <SelectItem value="1tb">1TB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "list" ? (
          <ListView
            stores={sortedStores}
            onStoreClick={handleStoreClick}
            getConditionStyle={getConditionBadgeStyle}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        ) : (
          <MapView
            stores={sortedStores}
            selectedStore={selectedStore}
            onStoreClick={handleStoreClick}
            onStoreSelect={onStoreSelect}
            getConditionStyle={getConditionBadgeStyle}
          />
        )}
        {/* Load more (무한 스크롤 대용 버튼) */}
        {viewMode === "list" && hasProductFilters && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={() => storeProductsQuery.fetchNextPage()}
              disabled={!storeProductsQuery.hasNextPage || storeProductsQuery.isFetchingNextPage}
            >
              {storeProductsQuery.isFetchingNextPage ? '불러오는 중…' : (storeProductsQuery.hasNextPage ? '더 보기' : '모두 읽음')}
            </Button>
          </div>
        )}
      </div>

      {/* Floating View Toggle Button */}
      {!(viewMode === "map" && selectedStore) && (
        <div className="absolute left-1/2 transform -translate-x-1/2 z-50 bottom-20">
          <Button
            onClick={() =>
              setViewMode(viewMode === "list" ? "map" : "list")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
          >
            {viewMode === "list" ? (
              <>
                <MapPin className="h-4 w-4" />
                <span>지도보기</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                <span>매장 {sortedStores.length}</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Filter Modal */}
      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>필터</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 가입유형 */}
            <div>
              <h4 className="font-medium mb-3">가입유형</h4>
              <div className="flex flex-wrap gap-2">
                {signupTypeOptions.map((signupType) => (
                  <Button
                    key={signupType}
                    variant={
                      tempFilters.signupType.includes(signupType)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      toggleFilter("signupType", signupType)
                    }
                  >
                    {signupType}
                  </Button>
                ))}
              </div>
            </div>

            {/* 조건 */}
            <div>
              <h4 className="font-medium mb-3">조건</h4>
              <div className="flex flex-wrap gap-2">
                {conditionOptions.map((condition) => (
                  <Button
                    key={condition}
                    variant={
                      tempFilters.conditions.includes(condition)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      toggleFilter("conditions", condition)
                    }
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>

            {/* 가격 범위 */}
            <div>
              <h4 className="font-medium mb-3 text-green-600">
                가격대
              </h4>
              <div className="px-2">
                <Slider
                  value={tempFilters.priceRange}
                  onValueChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      priceRange: value,
                    }))
                  }
                  max={200}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{tempFilters.priceRange[0]}만원</span>
                  <span>{tempFilters.priceRange[1]}만원</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetFilters}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              초기화
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={applyFilters}
            >
              필터 적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Model Modal */}
      <Dialog
        open={showModelModal}
        onOpenChange={setShowModelModal}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
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
            </Tabs>

            {/* 모델 목록 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {productsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">모델을 불러오는 중...</div>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">모델이 없습니다.</div>
                </div>
              ) : (
                filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg border cursor-pointer"
                  onClick={() => handleModelSelect(model.id)}
                >
                  <div className="w-12 h-12 mr-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {model.name}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// List View Component
function ListView({
  stores,
  onStoreClick,
  getConditionStyle,
  sortBy,
  setSortBy,
}: {
  stores: Store[];
  onStoreClick: (store: Store | null) => void;
  getConditionStyle: (condition: string) => {
    icon: React.FC;
    className: string;
  };
  sortBy: string;
  setSortBy: (value: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 - 총 개수와 정렬 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="text-sm text-muted-foreground">
          총 {stores.length}개 매장
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-auto min-w-[4rem] h-9 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="거리순">거리순</SelectItem>
            <SelectItem value="가격순">가격순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 매장 목록 */}
      <div className="flex-1 overflow-y-auto">
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-lg text-gray-700">
              모델을 선택하거나 필터를 적용해보세요.
            </h3>
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className="border-b cursor-pointer hover:bg-gray-50 transition-colors p-4"
              onClick={() => onStoreClick(store)}
            >
              <div className="space-y-1">
                {/* 상단: 하트 + 매장명 + 가격 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <Heart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <h3 className="font-semibold text-base">
                      {store.name}
                    </h3>
                  </div>
                  <div className="text-lg font-semibold text-blue-600 ml-2">
                    {(store.price * 10000).toLocaleString()}원
                  </div>
                </div>

                {/* 거리 | 영업시간 */}
                <div className="text-xs text-muted-foreground ml-6">
                  {store.distance}km | {store.hours}
                </div>

                {/* 조건 (칩 형태) */}
                <div className="ml-6">
                  <StoreConditionChips
                    productCarrier={store.productCarrier}
                    conditions={store.conditions}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Map View Component
function MapView({
  stores,
  selectedStore,
  onStoreClick,
  onStoreSelect,
  getConditionStyle,
}: {
  stores: Store[];
  selectedStore: Store | null;
  onStoreClick: (store: Store | null) => void;
  onStoreSelect: (store: Store) => void;
  getConditionStyle: (condition: string) => {
    icon: React.FC;
    className: string;
  };
}) {
  const handleCurrentLocation = () => {
    // 현재 위치 가져오기 로직
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("현재 위치:", latitude, longitude);
          // 지도를 현재 위치로 이동하는 로직을 여기에 추가
        },
        (error) => {
          console.error(
            "위치 정보를 가져올 수 없습니다:",
            error,
          );
          alert(
            "위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.",
          );
        },
      );
    } else {
      alert(
        "이 브라우저에서는 위치 서비스를 지원하지 않습니다.",
      );
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    // 매장 핀이 아닌 지도 배경을 클릭했을 때만 카드 닫기
    if (e.target === e.currentTarget) {
      onStoreClick(null as any);
    }
  };

  return (
    <div className="h-full relative">
      {/* Mock Map */}
      <div
        className="h-full bg-gradient-to-br from-blue-100 to-green-100 relative cursor-pointer"
        onClick={handleMapClick}
      >
        {/* Mock Streets */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-300 pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 pointer-events-none"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-300 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-300 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gray-300 pointer-events-none"></div>

        {/* Store Pins */}
        {stores.map((store) => (
          <div
            key={store.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
            style={{
              left: `${store.position.x}%`,
              top: `${store.position.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onStoreClick(store);
            }}
          >
            <div
              className={`
              bg-white border-2 px-2 py-1 rounded-lg shadow-lg text-sm font-semibold
              ${selectedStore?.id === store.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            `}
            >
              {store.price}만
            </div>
          </div>
        ))}
      </div>

      {/* Current Location Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white shadow-lg"
          onClick={handleCurrentLocation}
          title="현재 위치"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Store Info */}
      {selectedStore && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
          <div className="p-4">
            <div className="space-y-1">
              {/* 상단: 하트 + 매장명 + 가격 */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <Heart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-semibold text-base">
                    {selectedStore.name}
                  </h3>
                </div>
                <div className="text-lg font-semibold text-blue-600 ml-2">
                  {(
                    selectedStore.price * 10000
                  ).toLocaleString()}
                  원
                </div>
              </div>

              {/* 거리 | 영업시간 */}
              <div className="text-xs text-muted-foreground ml-6">
                {selectedStore.distance}km |{" "}
                {selectedStore.hours}
              </div>

              {/* 조건 (칩 형태) */}
              <div className="ml-6">
                <StoreConditionChips
                  productCarrier={selectedStore.productCarrier}
                  conditions={selectedStore.conditions}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}