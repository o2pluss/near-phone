import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import NaverMapWithSearch from "./NaverMapWithSearch";
import { getPhoneModels, type PhoneModel, type DeviceModel, type DeviceModelsResponse } from "../lib/phoneModels";
import { getCarrierLabel } from "../lib/constants/codes";
import { useStores, useStoreSearch, useDeviceModels } from "@/hooks/useApi";
import { useFavorites } from "../contexts/FavoriteContext";

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
  productCarrier?: "kt" | "skt" | "lgu";
  businessHours?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  latitude?: number;
  longitude?: number;
}

interface FilterState {
  signupType: string[];
  conditions: string[];
  priceRange: number[];
  storage: string[];
}

// PhoneModel interface is now imported from lib/phoneModels.ts

interface StoreSearchScreenProps {
  onStoreSelect: (store: Store, selectedProduct?: any) => void;
  onBack: () => void;
}


export default function StoreSearchScreen({
  onStoreSelect,
  onBack,
}: StoreSearchScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  // 실제 device-models 데이터 조회
  const deviceModelsQuery = useDeviceModels({ page: 1, limit: 1000 }, { enabled: true });
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">(
    "list",
  );
  const [showFilter, setShowFilter] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedStore, setSelectedStore] =
    useState<Store | null>(null);
  const [mapSelectedStore, setMapSelectedStore] = useState<Store | null>(null);
  const [visibleStores, setVisibleStores] = useState<Store[]>([]);
  const [mapState, setMapState] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);
  const [storesWithDistance, setStoresWithDistance] = useState<Store[]>([]);
  const [storeCoordinates, setStoreCoordinates] = useState<Map<string, {lat: number, lng: number}>>(new Map());
  
  // 지도 영역 필터링 핸들러
  const handleVisibleStoresChange = useCallback((stores: any[]) => {
    setVisibleStores(stores);
  }, []);

  // 거리 계산 결과 핸들러
  const handleDistanceCalculated = useCallback((stores: any[]) => {
    setStoresWithDistance(stores);
  }, []);

  // 매장 좌표를 별도로 가져오는 함수
  const fetchStoreCoordinates = useCallback(async (storeIds: string[]) => {
    try {
      const response = await fetch(`/api/stores?ids=${storeIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        const coordinatesMap = new Map();
        data.items.forEach((store: any) => {
          if (store.latitude && store.longitude) {
            coordinatesMap.set(store.id, {
              lat: store.latitude,
              lng: store.longitude
            });
          }
        });
        setStoreCoordinates(prev => new Map([...prev, ...coordinatesMap]));
      }
    } catch (error) {
      console.error('매장 좌표 가져오기 실패:', error);
    }
  }, []);
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
    priceRange: [0, 300],
    storage: ["256gb"],
  });
  
  // 적용된 필터 상태 (실제 API 호출에 사용)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    signupType: [],
    conditions: [],
    priceRange: [0, 300],
    storage: ["256gb"],
  });
  const [storeInfoMap, setStoreInfoMap] = useState<Map<string, any>>(new Map());

  // 오늘 요일 기준 영업시간을 가져오는 함수
  const getTodayHours = (businessHours: any) => {
    if (!businessHours) return "09:00 - 21:00";
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    switch (dayOfWeek) {
      case 0: // 일요일
        return businessHours.sunday || businessHours.weekday || "09:00 - 21:00";
      case 6: // 토요일
        return businessHours.saturday || businessHours.weekday || "09:00 - 21:00";
      default: // 월요일~금요일
        return businessHours.weekday || "09:00 - 21:00";
    }
  };

  // 가격 범위는 만원 단위로 가정 → 원화로 변환
  const minPriceWon = Math.max(0, (appliedFilters.priceRange?.[0] ?? 0)) * 10000;
  const maxPriceWon = Math.max(0, (appliedFilters.priceRange?.[1] ?? 0)) * 10000;
  
  // 필터 조건 확인 (모든 필터를 합쳐서 확인)
  const hasProductFilters = selectedCarrier !== "kt" || 
    (appliedFilters.priceRange?.[0] ?? 0) > 0 || 
    (appliedFilters.priceRange?.[1] ?? 0) < 300 ||
    selectedStorage !== "256gb" ||
    (appliedFilters.signupType?.length ?? 0) > 0 ||
    (appliedFilters.conditions?.length ?? 0) > 0 ||
    selectedModel !== ""; // 모델명이 있으면 상품 검색
  
  // 매장 검색 파라미터 (모달 밖 필터)
  const storeSearchParams = {
    model: selectedModel || undefined,
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
    model: selectedModel || undefined, // 모델명 검색 추가
  } : undefined;
  
  // 상품 검색만 사용하고, 매장 검색은 비활성화
  const storesQuery = useStores(storeSearchParams, { enabled: false }); // 매장 검색 비활성화
  const storeSearchQuery = useStoreSearch(productFilterParams, { enabled: hasProductFilters });

  // URL 쿼리 파라미터에서 초기 상태 복원 (컴포넌트 마운트 시에만)
  useEffect(() => {
    const carrier = searchParams.get('carrier');
    const model = searchParams.get('model');
    const storage = searchParams.get('storage');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const signupType = searchParams.get('signupType');
    const conditions = searchParams.get('conditions');
    
    if (carrier) setSelectedCarrier(carrier);
    if (model) setSelectedModel(model);
    if (storage) setSelectedStorage(storage);
    
    if (priceMin || priceMax) {
      const priceRange = [
        priceMin ? parseInt(priceMin) / 10000 : 0,
        priceMax ? parseInt(priceMax) / 10000 : 300
      ];
      setAppliedFilters(prev => ({ ...prev, priceRange }));
    }
    
    if (signupType) {
      const signupTypes = signupType.split(',').map(s => s.trim()).filter(Boolean);
      setAppliedFilters(prev => ({ ...prev, signupType: signupTypes }));
    }
    
    if (conditions) {
      const conditionList = conditions.split(',').map(c => c.trim()).filter(Boolean);
      setAppliedFilters(prev => ({ ...prev, conditions: conditionList }));
    }
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  // 검색 상태가 변경될 때마다 URL 업데이트 (URL 복원 후에만)
  useEffect(() => {
    // 컴포넌트가 마운트된 후에만 URL 업데이트
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (selectedCarrier !== "kt") params.set('carrier', selectedCarrier);
      if (selectedModel) params.set('model', selectedModel);
      if (selectedStorage !== "256gb") params.set('storage', selectedStorage);
      
      if (appliedFilters.priceRange) {
        const [min, max] = appliedFilters.priceRange;
        if (min > 0) params.set('priceMin', String(min * 10000));
        if (max < 300) params.set('priceMax', String(max * 10000));
      }
      
      if (appliedFilters.signupType?.length) {
        params.set('signupType', appliedFilters.signupType.join(','));
      }
      
      if (appliedFilters.conditions?.length) {
        params.set('conditions', appliedFilters.conditions.join(','));
      }
      
      const queryString = params.toString();
      const newUrl = queryString ? `/search?${queryString}` : '/search';
      
      // 현재 URL과 비교하여 변경된 경우에만 업데이트
      const currentUrl = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      if (currentUrl !== newUrl) {
        router.replace(newUrl, { scroll: false });
      }
    }, 100); // 약간의 지연을 두어 상태 복원 후 실행

    return () => clearTimeout(timeoutId);
  }, [selectedCarrier, selectedModel, selectedStorage, appliedFilters, router, searchParams]);


  // device-models 데이터를 PhoneModel 형태로 변환
  useEffect(() => {
    if (deviceModelsQuery.data && deviceModelsQuery.data.data) {
      try {
        const items = deviceModelsQuery.data.data as DeviceModel[];
        
        const models: PhoneModel[] = items
          .filter((device: DeviceModel) => device && device.id) // device가 존재하고 id가 있는 경우만 필터링
          .map((device: DeviceModel) => ({
            id: device.id,
            name: device.deviceName || device.modelName || '이름 없음',
            brand: device.manufacturer?.toLowerCase() === 'samsung' ? 'samsung' : 'apple', // 대소문자 구분 없이 처리
            image: device.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop",
            isFavorite: false, // 기본값
          }));
        setPhoneModels(models);
      } catch (error) {
        console.error('디바이스 모델 데이터 변환 중 오류 발생:', error);
        setPhoneModels([]);
      }
    } else {
      setPhoneModels([]);
    }
  }, [deviceModelsQuery.data]);

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
      priceRange: [0, 300],
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
    "필수요금제",
    "카드할인",
    "결합할인",
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
      // 선택된 상품 정보 찾기
      let productInfo = null;
      if (hasProductFilters && storeSearchQuery.data) {
        const allProducts = storeSearchQuery.data.pages.flatMap((page: any) => page.items || []);
        productInfo = allProducts.find((product: any) => product.store_id === store.id);
      }
      
      // 상품 정보가 없으면 첫 번째 상품 사용
      if (!productInfo && storeSearchQuery.data) {
        const allProducts = storeSearchQuery.data.pages.flatMap((page: any) => page.items || []);
        productInfo = allProducts.find((product: any) => product.store_id === store.id);
      }
      
      // 상품 정보를 store 객체에 추가하여 전달
      const storeWithProduct = {
        ...store,
        selectedProduct: productInfo
      };
      
      onStoreSelect(storeWithProduct);
    }
  };

  const handleMapClick = () => {
    // 지도 클릭 시 카드 닫기
    setMapSelectedStore(null);
  };

  const handleMapStateChange = (center: { lat: number; lng: number }, zoom: number) => {
    // 지도 상태 저장
    setMapState({ center, zoom });
  };

  const handleModelSelect = (modelId: string) => {
    const model = phoneModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model.name);
      setShowModelModal(false);
    }
  };

  // 즐겨찾기 토글 핸들러
  const handleFavoriteToggle = async (store: Store, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite(store.id)) {
        await removeFromFavorites(store.id);
      } else {
        // 상품 정보가 있는 경우 상품 스냅샷 생성
        let productSnapshot = null;
        if (hasProductFilters && storeSearchQuery.data) {
          const allProducts = storeSearchQuery.data.pages.flatMap((page: any) => page.items || []);
          const productInfo = allProducts.find((product: any) => product.store_id === store.id);
          
          if (productInfo) {
            productSnapshot = {
              id: productInfo.id,
              name: productInfo.name || productInfo.device_models?.device_name,
              model: productInfo.device_models?.device_name || productInfo.device_models?.model_name,
              storage: productInfo.storage,
              price: productInfo.price || 0, // 원 단위로 저장
              carrier: productInfo.carrier,
              conditions: productInfo.conditions || [],
              isDeleted: productInfo.is_deleted || false,
              deletedAt: productInfo.deleted_at,
              deletionReason: productInfo.is_deleted ? '상품이 삭제되었습니다' : undefined
            };
          }
        }
        
        await addToFavorites({
          storeId: store.id,
          productId: productSnapshot?.id,
          productSnapshot
        });
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };



  const filteredModels = phoneModels.filter(
    (model) => model.brand === modelTab,
  );

  // 매장 정보를 가져오는 useEffect (이제 store-search API에서 직접 가져옴)
  useEffect(() => {
    if (hasProductFilters && storeSearchQuery.data && storeSearchQuery.data.pages) {
      const items = storeSearchQuery.data.pages.flatMap((p: any) => {
        if (p && Array.isArray(p.items)) {
          return p.items;
        } else if (Array.isArray(p)) {
          return p;
        }
        return [];
      }) as any[];
      
      if (items.length > 0) {
        // store-search API에서 이미 매장 정보를 포함하고 있으므로 별도 API 호출 불필요
        const newStoreMap = new Map();
        items.forEach((item: any) => {
          if (item && item.store_id && item.stores) {
            newStoreMap.set(item.store_id, item.stores);
          }
        });
        setStoreInfoMap(newStoreMap);
      }
    }
  }, [hasProductFilters, storeSearchQuery.data]);

  // 매장 좌표 가져오기
  useEffect(() => {
    if (hasProductFilters && storeSearchQuery.data && storeSearchQuery.data.pages) {
      const items = storeSearchQuery.data.pages.flatMap((p: any) => {
        if (p && Array.isArray(p.items)) {
          return p.items;
        } else if (Array.isArray(p)) {
          return p;
        }
        return [];
      }) as any[];
      
      if (items.length > 0) {
        const storeIds = [...new Set(items.map(item => item.store_id).filter(Boolean))];
        fetchStoreCoordinates(storeIds);
      }
    }
  }, [hasProductFilters, storeSearchQuery.data, fetchStoreCoordinates]);

  // 정렬된 매장 목록
  const sortedStores = useMemo(() => {
    // 거리 계산된 데이터가 있으면 우선 사용
    if (storesWithDistance.length > 0) {
      return storesWithDistance.sort((a, b) => {
        if (sortBy === "거리순") {
          return (a.distance || 0) - (b.distance || 0);
        } else if (sortBy === "가격순") {
          return a.price - b.price;
        }
        return 0;
      });
    }

    if (hasProductFilters && storeSearchQuery.data && storeSearchQuery.data.pages) {
      try {
        const items = storeSearchQuery.data.pages.flatMap((p: any) => {
          // pages 배열의 각 항목이 올바른 구조인지 확인
          if (p && Array.isArray(p.items)) {
            return p.items;
          } else if (Array.isArray(p)) {
            return p;
          }
          return [];
        }) as any[];
        
        // 상품이 없으면 빈 배열 반환 (안내 메시지 표시용)
        if (items.length === 0) {
          return [];
        }
        
        // store_id 기준으로 대표 상품을 선택하여 스토어 카드로 변환
        const byStore = new Map<string, any>();
        for (const it of items) {
          if (it && it.store_id && !byStore.has(it.store_id)) {
            byStore.set(it.store_id, it);
          }
        }
        
        const stores = Array.from(byStore.values()).map((sp: any) => {
          const storeInfo = storeInfoMap.get(sp.store_id);
          
          // 디버깅: storeInfo 확인
          if (sp.store_id === "29ef94d2-6b27-4a74-852a-a8ce094638f1") {
            console.log('storeInfo 확인:', {
              store_id: sp.store_id,
              storeInfo: storeInfo,
              latitude: storeInfo?.latitude,
              longitude: storeInfo?.longitude
            });
          }
          
          return {
            id: sp.store_id,
            name: storeInfo?.name || `매장 ${sp.store_id.slice(-4)}`, // 실제 매장명 또는 임시 매장명
            address: storeInfo?.address || "주소 정보 없음",
            distance: 0.5, // 거리는 계산 로직이 필요
            phone: storeInfo?.phone || "-",
            rating: storeInfo?.rating || 0,
            reviewCount: storeInfo?.review_count || 0,
            model: sp.device_models?.device_name ?? sp.device_models?.model_name ?? "",
            price: sp.price ?? 0, // 원 단위로 유지
            originalPrice: sp.price ?? 0,
            conditions: sp.conditions || [],
            hours: getTodayHours(storeInfo?.hours), // 오늘 요일 기준 영업시간
            position: { x: Math.random() * 100, y: Math.random() * 100 }, // 랜덤 위치
            image: sp.device_models?.image_url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop",
            productCarrier: sp.carrier ?? selectedCarrier,
            latitude: storeInfo?.latitude,
            longitude: storeInfo?.longitude,
            businessHours: storeInfo?.hours || {
              weekday: "-",
              saturday: "-",
              sunday: "-"
            }
          };
        });
        return stores;
      } catch (error) {
        console.error('매장 상품 데이터 변환 중 오류 발생:', error);
        return [];
      }
    }

    let apiItems: any[] = [];
    if (storesQuery.data && storesQuery.data.pages) {
      try {
        apiItems = storesQuery.data.pages.flatMap((p: any) => {
          if (p && Array.isArray(p.items)) {
            return p.items;
          } else if (p && Array.isArray(p.stores)) {
            return p.stores;
          } else if (Array.isArray(p)) {
            return p;
          }
          return [];
        });
      } catch (error) {
        console.error('매장 데이터 변환 중 오류 발생:', error);
        apiItems = [];
      }
    }
    
    const stores = apiItems
      .filter((s) => s && s.id) // 유효한 매장 데이터만 필터링
      .map((s) => ({
        id: s.id,
        name: s.name || "매장명 없음",
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
        latitude: s.latitude,
        longitude: s.longitude,
        businessHours: {
          weekday: "09:00 - 21:00",
          saturday: "10:00 - 20:00",
          sunday: "10:00 - 19:00"
        }
      }));

    if (sortBy === "거리순") {
      return stores.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "가격순") {
      return stores.sort((a, b) => a.price - b.price);
    }

    return stores;
  }, [sortBy, hasProductFilters, storeSearchQuery.data, storesQuery.data, selectedCarrier, storeInfoMap]);

  // Store 데이터를 네이버 지도 형식으로 변환 (실제 좌표 사용)
  const mapStores = useMemo(() => {
    return sortedStores.map((store) => {
        // API에서 받은 좌표 또는 별도로 가져온 좌표 사용
        let latitude = store.latitude;
        let longitude = store.longitude;
        
        // 좌표가 없으면 별도로 가져온 좌표 확인
        if (!latitude || !longitude) {
          const coordinates = storeCoordinates.get(store.id);
          if (coordinates) {
            latitude = coordinates.lat;
            longitude = coordinates.lng;
          } else {
            // 아직 가져오지 않았으면 기본값 사용
            latitude = 37.5665;
            longitude = 126.9780;
          }
        }
        
        return {
          id: store.id,
          name: store.name,
          address: store.address,
          latitude: latitude,
          longitude: longitude,
          phone: store.phone,
          rating: store.rating,
          reviewCount: store.reviewCount || 0,
          distance: store.distance,
          model: store.model,
          price: store.price,
          conditions: store.conditions,
          hours: store.hours
        };
      });
  }, [sortedStores, storeCoordinates]);

  // 활성화된 필터가 있는지 확인 (적용된 필터 기준)
  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.signupType.length > 0 ||
      appliedFilters.conditions.length > 0 ||
      appliedFilters.storage.length > 0 ||
      appliedFilters.priceRange[0] !== 0 ||
      appliedFilters.priceRange[1] !== 300
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
              <SelectTrigger className="w-auto min-w-[4rem] h-9 rounded-full bg-gray-100 hover:bg-gray-100 border-0 shadow-none">
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
              className="model-button rounded-full h-9 px-3 text-left justify-between min-w-0 bg-gray-100 hover:bg-gray-100 border-0 shadow-none"
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
              <SelectTrigger className="w-auto min-w-[4rem] h-9 rounded-full bg-gray-100 hover:bg-gray-100 border-0 shadow-none">
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
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={isFavorite}
            getConditionStyle={getConditionBadgeStyle}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        ) : (
          <MapView
            key="map-view"
            stores={sortedStores}
            mapStores={mapStores}
            selectedStore={selectedStore}
            mapSelectedStore={mapSelectedStore}
            setMapSelectedStore={setMapSelectedStore}
            mapState={mapState}
            hasProductFilters={hasProductFilters}
            storeSearchQuery={storeSearchQuery}
            onStoreClick={handleStoreClick}
            onStoreSelect={onStoreSelect}
            onMapClick={handleMapClick}
            onMapStateChange={handleMapStateChange}
            onVisibleStoresChange={handleVisibleStoresChange}
            onDistanceCalculated={handleDistanceCalculated}
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={isFavorite}
            getConditionStyle={getConditionBadgeStyle}
          />
        )}
        {/* Load more (무한 스크롤 대용 버튼) */}
        {viewMode === "list" && hasProductFilters && storeSearchQuery.hasNextPage && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={() => storeSearchQuery.fetchNextPage()}
              disabled={storeSearchQuery.isFetchingNextPage}
            >
              {storeSearchQuery.isFetchingNextPage ? '불러오는 중…' : '더 보기'}
            </Button>
          </div>
        )}
      </div>

      {/* Floating View Toggle Button */}
      {!(viewMode === "map" && selectedStore) && !(viewMode === "map" && mapSelectedStore) && (
        <div className="absolute left-1/2 transform -translate-x-1/2 z-50 bottom-20">
          <Button
            onClick={() =>
              setViewMode(viewMode === "list" ? "map" : "list")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center"
          >
            {viewMode === "list" ? (
              <>
                <MapPin className="h-4 w-4" />
                <span>지도보기</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                <span>매장 {viewMode === 'map' ? visibleStores.length : sortedStores.length}</span>
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
                  max={300}
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
              {deviceModelsQuery.isLoading ? (
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
  onFavoriteToggle,
  isFavorite,
  getConditionStyle,
  sortBy,
  setSortBy,
}: {
  stores: Store[];
  onStoreClick: (store: Store | null) => void;
  onFavoriteToggle: (store: Store, e: React.MouseEvent) => void;
  isFavorite: (storeId: string) => boolean;
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
          <SelectTrigger className="w-auto min-w-[4rem] h-9 rounded-full border-0 bg-transparent hover:bg-transparent shadow-none">
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
            <h3 className="text-sm text-muted-foreground mb-2">
              앗, 찾으시는 결과가 없어요 😥
            </h3>
            <p className="text-xs text-muted-foreground">
              다른 모델을 검색하시거나 필터를 변경해보세요.
            </p>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={(e) => onFavoriteToggle(store, e)}
                    >
                      <Heart 
                        className={`h-4 w-4 flex-shrink-0 ${
                          isFavorite(store.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`} 
                      />
                    </Button>
                    <h3 className="font-semibold text-base">
                      {store.name}
                    </h3>
                  </div>
                  <div className="text-lg font-semibold text-blue-600 ml-2">
                    {store.price.toLocaleString()}원
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
  mapStores,
  selectedStore,
  mapSelectedStore,
  setMapSelectedStore,
  mapState,
  hasProductFilters,
  storeSearchQuery,
  onStoreClick,
  onStoreSelect,
  onMapClick,
  onMapStateChange,
  onVisibleStoresChange,
  onDistanceCalculated,
  onFavoriteToggle,
  isFavorite,
  getConditionStyle,
}: {
  stores: Store[];
  mapStores: any[];
  selectedStore: Store | null;
  mapSelectedStore: Store | null;
  setMapSelectedStore: (store: Store | null) => void;
  mapState: { center: { lat: number; lng: number }; zoom: number } | null;
  hasProductFilters: boolean;
  storeSearchQuery: any;
  onStoreClick: (store: Store | null) => void;
  onStoreSelect: (store: Store) => void;
  onMapClick: () => void;
  onMapStateChange: (center: { lat: number; lng: number }, zoom: number) => void;
  onVisibleStoresChange?: (visibleStores: any[]) => void;
  onDistanceCalculated?: (stores: any[]) => void;
  onFavoriteToggle: (store: Store, e: React.MouseEvent) => void;
  isFavorite: (storeId: string) => boolean;
  getConditionStyle: (condition: string) => {
    icon: React.FC;
    className: string;
  };
}) {
  
  
  

  const handleStoreSelect = (store: any) => {
    // 네이버 지도에서 선택된 매장을 원래 형식으로 변환
    const originalStore = stores.find(s => s.id === store.id);
    if (originalStore) {
      // 지도보기에서는 mapSelectedStore 상태를 업데이트하여 하단 카드 표시
      setMapSelectedStore(originalStore);
    }
  };

  return (
    <div className="h-full relative" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
      <NaverMapWithSearch
        stores={mapStores}
        onStoreSelect={handleStoreSelect}
        onMapClick={onMapClick}
        onMapStateChange={onMapStateChange}
        onVisibleStoresChange={onVisibleStoresChange}
        onDistanceCalculated={onDistanceCalculated}
        center={mapState?.center || { lat: 37.5665, lng: 126.9780 }}
        zoom={mapState?.zoom || 10}
        className="w-full"
      />

      {/* Selected Store Info */}
      {mapSelectedStore && (
        <div 
          className="bg-white border-t min-h-[120px] rounded-t-lg cursor-pointer" 
          style={{
            position: 'fixed',
            bottom: '64px',
            left: '0',
            right: '0',
            zIndex: 9999
          }}
          onClick={() => {
            // 선택된 상품 정보 찾기
            let productInfo = null;
            if (hasProductFilters && storeSearchQuery.data) {
              const allProducts = storeSearchQuery.data.pages.flatMap((page: any) => page.items || []);
              productInfo = allProducts.find((product: any) => product.store_id === mapSelectedStore.id);
            }
            
            // 상품 정보가 없으면 첫 번째 상품 사용
            if (!productInfo && storeSearchQuery.data) {
              const allProducts = storeSearchQuery.data.pages.flatMap((page: any) => page.items || []);
              productInfo = allProducts.find((product: any) => product.store_id === mapSelectedStore.id);
            }
            
            // 상품 정보를 store 객체에 추가하여 전달
            const storeWithProduct = {
              ...mapSelectedStore,
              selectedProduct: productInfo
            };
            
            onStoreSelect(storeWithProduct);
          }}
        >
          <div className="p-4">
            <div className="space-y-1">
              {/* 상단: 하트 + 매장명 + 가격 */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoriteToggle(mapSelectedStore, e);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 flex-shrink-0 ${
                        isFavorite(mapSelectedStore.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground hover:text-red-500'
                      }`} 
                    />
                  </Button>
                  <h3 className="font-semibold text-base">
                    {mapSelectedStore.name}
                  </h3>
                </div>
                <div className="text-lg font-semibold text-blue-600 ml-2">
                  {mapSelectedStore.price.toLocaleString()}원
                </div>
              </div>

              {/* 거리 | 영업시간 */}
              <div className="text-xs text-muted-foreground ml-6">
                {mapSelectedStore.distance}km |{" "}
                {mapSelectedStore.hours}
              </div>

              {/* 조건 (칩 형태) */}
              <div className="ml-6">
                <StoreConditionChips
                  productCarrier={mapSelectedStore.productCarrier}
                  conditions={mapSelectedStore.conditions}
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