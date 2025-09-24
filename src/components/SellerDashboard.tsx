import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { TimePicker } from "./ui/time-picker";
import {
  Store,
  Package,
  Calendar,
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Timer,
  Bell,
  Camera,
  Upload,
  X,
  Filter,
  CalendarDays,
  Search,
  Users,
  ChevronDown,
  Star,
  MessageSquare,
} from "lucide-react";

// Seller 컴포넌트들 import
import StoreManagement from "./seller/StoreManagement";
import ProductManagement from "./seller/ProductManagement";
import ReservationManagement from "./seller/ReservationManagement";
import { type ProductLog } from "./seller/ProductLogDialog";
import ReviewManagement from "./seller/ReviewManagement";

interface StoreInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  businessNumber: string;
  hours: {
    weekday: string;
    saturday: string;
    sunday: string;
    holiday: string;
  };
  images: string[];
}

interface Product {
  id: string;
  model: string;
  carrier: string;
  storage: string;
  price: number;
  conditions: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancel_pending" | "cancelled";
  createdAt: string;
}

const mockStoreInfo: StoreInfo = {
  id: "1",
  name: "강남 휴대폰 매장",
  description:
    "최신 스마트폰을 합리적인 가격에 제공하는 신뢰할 수 있는 매장입니다.",
  address: "서울시 강남구 역삼동 123-45",
  phone: "02-1234-5678",
  businessNumber: "123-45-67890",
  hours: {
    weekday: "09:00 - 21:00",
    saturday: "10:00 - 20:00",
    sunday: "10:00 - 19:00",
    holiday: "휴무",
  },
  images: [
    "https://images.unsplash.com/photo-1723133741318-0f5c5afcf19e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHN0b3JlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU4NTEzMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1584658645175-90788b3347b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG9uZSUyMHN0b3JlJTIwZGlzcGxheXxlbnwxfHx8fDE3NTg1MTMyODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1703165552745-37e85f0273cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHJldGFpbCUyMHN0b3JlfGVufDF8fHx8MTc1ODUxMzI4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  ],
};

const mockProducts: Product[] = [
  {
    id: "1",
    model: "iPhone 16 Pro",
    carrier: "KT",
    storage: "256GB",
    price: 1200000,
    conditions: ["번호이동", "카드할인"],
    isActive: true,
    createdAt: new Date(2025, 0, 18, 14, 30), // 2025-01-18 14:30
    updatedAt: new Date(2025, 0, 22, 10, 15), // 2025-01-22 10:15
  },
  {
    id: "2",
    model: "갤럭시 S25 울트라",
    carrier: "SKT",
    storage: "512GB",
    price: 980000,
    conditions: ["신규가입", "결합할인"],
    isActive: true,
    createdAt: new Date(2025, 0, 20, 9, 45), // 2025-01-20 09:45
    updatedAt: new Date(2025, 0, 21, 16, 20), // 2025-01-21 16:20
  },
  {
    id: "3",
    model: "iPhone 16",
    carrier: "LG U+",
    storage: "128GB",
    price: 950000,
    conditions: ["번호이동", "필수요금제"],
    isActive: false,
    createdAt: new Date(2025, 0, 19, 11, 20), // 2025-01-19 11:20
    updatedAt: new Date(2025, 0, 22, 8, 30), // 2025-01-22 08:30
  },
];

// Mock 상품 로그 데이터
const mockProductLogs: ProductLog[] = [
  {
    id: "log-1",
    productId: "1",
    action: "create",
    timestamp: new Date(2025, 0, 18, 14, 30),
    actor: "김판매자"
  },
  {
    id: "log-2",
    productId: "1",
    action: "update",
    timestamp: new Date(2025, 0, 20, 16, 45),
    actor: "김판매자",
    changes: [
      {
        field: "price",
        oldValue: 1250000,
        newValue: 1200000
      }
    ]
  },
  {
    id: "log-3",
    productId: "1",
    action: "update",
    timestamp: new Date(2025, 0, 22, 10, 15),
    actor: "김판매자",
    changes: [
      {
        field: "conditions",
        oldValue: ["번호이동"],
        newValue: ["번호이동", "카드할인"]
      }
    ]
  },
  {
    id: "log-4",
    productId: "2",
    action: "create",
    timestamp: new Date(2025, 0, 20, 9, 45),
    actor: "이판매자"
  },
  {
    id: "log-5",
    productId: "2",
    action: "update",
    timestamp: new Date(2025, 0, 21, 16, 20),
    actor: "이판매자",
    changes: [
      {
        field: "conditions",
        oldValue: ["신규가입"],
        newValue: ["신규가입", "결합할인"]
      }
    ]
  },
  {
    id: "log-6",
    productId: "3",
    action: "create",
    timestamp: new Date(2025, 0, 19, 11, 20),
    actor: "박판매자"
  },
  {
    id: "log-7",
    productId: "3",
    action: "toggle_status",
    timestamp: new Date(2025, 0, 22, 8, 30),
    actor: "박판매자",
    changes: [
      {
        field: "isActive",
        oldValue: true,
        newValue: false
      }
    ]
  }
];

// 동적으로 오늘 날짜 생성
const getTodayDate = () =>
  new Date().toISOString().split("T")[0];
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const mockReservations: Reservation[] = [
  {
    id: "1",
    customerName: "김고객",
    customerPhone: "010-1234-5678",
    date: getTodayDate(), // 실제 오늘
    time: "14:30",
    model: "iPhone 16 Pro",
    price: 1200000,
    status: "pending",
    createdAt: "2025-01-20T10:30:00",
  },
  {
    id: "2",
    customerName: "이사용",
    customerPhone: "010-2345-6789",
    date: getTodayDate(), // 실제 오늘
    time: "11:00",
    model: "갤럭시 S25 울트라",
    price: 980000,
    status: "confirmed",
    createdAt: "2025-01-21T15:20:00",
  },
  {
    id: "3",
    customerName: "박고객",
    customerPhone: "010-3456-7890",
    date: getTodayDate(), // 실제 오늘 (더 많은 예약으로 스케줄러 테스트)
    time: "16:00",
    model: "iPhone 16",
    price: 950000,
    status: "pending",
    createdAt: "2025-01-22T09:15:00",
  },
  {
    id: "4",
    customerName: "최사용",
    customerPhone: "010-4567-8901",
    date: getTodayDate(), // 실제 오늘
    time: "10:30",
    model: "갤럭시 S25",
    price: 850000,
    status: "completed",
    createdAt: "2025-01-18T14:20:00",
  },
  {
    id: "5",
    customerName: "정고객",
    customerPhone: "010-5678-9012",
    date: getYesterdayDate(), // 어제
    time: "15:45",
    model: "iPhone 16 Pro Max",
    price: 1100000,
    status: "cancelled",
    createdAt: "2025-01-17T11:40:00",
  },
  {
    id: "6",
    customerName: "홍길동",
    customerPhone: "010-9876-5432",
    date: getTodayDate(), // 실제 오늘
    time: "09:30",
    model: "갤럭시 S25 울트라",
    price: 1100000,
    status: "confirmed",
    createdAt: "2025-01-21T08:20:00",
  },
  {
    id: "7",
    customerName: "신고객",
    customerPhone: "010-1111-2222",
    date: getTodayDate(), // 실제 오늘
    time: "18:00",
    model: "iPhone 16 Pro Max",
    price: 1400000,
    status: "pending",
    createdAt: "2025-01-22T12:15:00",
  },
];

interface SellerDashboardProps {
  onScheduleView?: () => void;
  onReservationDetail?: (reservation: any) => void;
}

export default function SellerDashboard({
  onScheduleView,
  onReservationDetail,
}: SellerDashboardProps) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(mockStoreInfo);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [productLogs, setProductLogs] = useState<ProductLog[]>(mockProductLogs);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [isStoreEditOpen, setIsStoreEditOpen] = useState(false);
  const [storeImages, setStoreImages] = useState<string[]>(storeInfo.images);
  const [editFormData, setEditFormData] = useState<StoreInfo>(storeInfo);

  // 예약 관리 필터 상태 (입력용)
  const [statusFilter, setStatusFilter] = useState<"all" | Reservation["status"]>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 실제 적용된 필터 상태
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<"all" | Reservation["status"]>("all");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // 최대 5개 제한
    const remainingSlots = 5 - storeImages.length;
    if (remainingSlots <= 0) {
      alert("최대 5개의 이미지만 업로드할 수 있습니다.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setStoreImages((prev) => [...prev, e.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index: number) => {
    setStoreImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStoreUpdate = (data: StoreInfo) => {
    const updatedData = { ...data, images: storeImages };
    setStoreInfo(updatedData);
    setIsStoreEditOpen(false);
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStoreUpdate(editFormData);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (type: 'weekday' | 'saturday' | 'sunday' | 'holiday', value: string) => {
    setEditFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [type]: value
      }
    }));
  };

  const handleProductDelete = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const handleBulkSave = (newProducts: Omit<Product, "id">[], updatedProductId?: string, updatedProductIds?: string[]) => {
    if (updatedProductId) {
      // 단일 상품 편집 모드
      const updatedProduct = newProducts[0]; // 편집 모드에서는 하나의 상품만 전달됨
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === updatedProductId 
            ? { 
                ...updatedProduct, 
                id: updatedProductId,
                createdAt: p.createdAt, // 기존 생성일 유지
                updatedAt: updatedProduct.updatedAt || new Date()
              }
            : p
        )
      );
    } else if (updatedProductIds && updatedProductIds.length > 0) {
      // 여러 상품 편집 모드
      setProducts(prevProducts => {
        const updatedMap = new Map();
        newProducts.forEach((product, index) => {
          if (index < updatedProductIds.length) {
            updatedMap.set(updatedProductIds[index], product);
          }
        });

        return prevProducts.map(p => {
          if (updatedMap.has(p.id)) {
            const updatedProduct = updatedMap.get(p.id);
            return { 
              ...updatedProduct, 
              id: p.id,
              createdAt: p.createdAt, // 기존 생성일 유지
              updatedAt: updatedProduct.updatedAt || new Date()
            };
          }
          return p;
        });
      });
    } else {
      // 일괄 추가 모드
      const now = new Date();
      const productsWithIds: Product[] = newProducts.map(product => ({
        ...product,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: product.createdAt || now,
        updatedAt: product.updatedAt || now,
      }));
      
      setProducts([...products, ...productsWithIds]);
    }
  };

  const handleReservationUpdate = (
    reservationId: string,
    status: Reservation["status"],
  ) => {
    setReservations(
      reservations.map((r) =>
        r.id === reservationId ? { ...r, status } : r,
      ),
    );
  };

  // 검색 필터링 함수
  const filterReservationsBySearch = (
    reservations: Reservation[],
    query: string,
  ) => {
    if (!query.trim()) return reservations;

    const searchTerm = query.toLowerCase().trim();

    return reservations.filter((reservation) => {
      // 고객명으로 검색
      const nameMatch = reservation.customerName
        .toLowerCase()
        .includes(searchTerm);

      // 연락처 뒷자리 4글자로 검색 (010-1234-5678 → 5678)
      const phoneLastFour = reservation.customerPhone.slice(-4);
      const phoneMatch = phoneLastFour.includes(searchTerm);

      return nameMatch || phoneMatch;
    });
  };

  const pendingReservations = reservations.filter((r) => r.status === "pending");

  // 오늘 날짜
  const today = new Date().toISOString().split("T")[0];

  // 당일 예약 필터링
  const todayReservations = reservations.filter((r) => r.date === today);

  // 필터링된 예약 목록 (적용된 필터 기준)
  let filteredReservations = reservations.filter((reservation) => {
    // 상태 필터
    if (appliedStatusFilter !== "all") {
      // 확정/완료는 confirmed, completed 둘 다 포함
      if (appliedStatusFilter === "confirmed") {
        if (!["confirmed", "completed"].includes(reservation.status)) {
          return false;
        }
      } else if (reservation.status !== appliedStatusFilter) {
        return false;
      }
    }

    // 날짜 필터
    if (appliedStartDate && reservation.date < appliedStartDate) {
      return false;
    }
    if (appliedEndDate && reservation.date > appliedEndDate) {
      return false;
    }

    return true;
  });

  // 적용된 검색어가 있으면 검색 필터 적용
  if (appliedSearchQuery.trim()) {
    filteredReservations = filterReservationsBySearch(
      filteredReservations,
      appliedSearchQuery,
    );
  }

  // 당일 예약 통계
  const todayStats = {
    total: todayReservations.length,
    pending: todayReservations.filter((r) => r.status === "pending").length,
    confirmed: todayReservations.filter((r) => r.status === "confirmed").length,
    completed: todayReservations.filter((r) => r.status === "completed").length,
  };

  const [currentView, setCurrentView] = useState<
    "overview" | "store" | "products" | "reservations" | "reviews"
  >("overview");

  // 검색 실행 함수 (모든 필터 적용)
  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedStatusFilter(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  // Enter 키로 검색 실행
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 필터 초기화 함수
  const handleResetFilters = () => {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setAppliedStatusFilter("all");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedSearchQuery("");
  };

  // 통계 카드 클릭 핸들러들
  const handleTodayClick = () => {
    setStatusFilter("all");
    setStartDate(today);
    setEndDate(today);
    setSearchQuery("");
    handleSearch();
  };

  const handlePendingClick = () => {
    setStatusFilter("pending");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    handleSearch();
  };

  const handleConfirmedClick = () => {
    setStatusFilter("confirmed");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    handleSearch();
  };

  const handleEditProduct = (product: Product) => {
    // 개별 상품 편집은 더 이상 지원하지 않음 (일괄 편집만 사용)
    console.log("Individual product editing is no longer supported");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header - 메인화면(overview)에서만 표시 */}
      {currentView === "overview" && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">판매자 대시보드</h1>
            <p className="text-muted-foreground">{storeInfo.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            {onScheduleView && (
              <Button 
                variant="outline" 
                onClick={onScheduleView}
                className="flex items-center space-x-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span>스케줄 보기</span>
              </Button>
            )}
            {pendingReservations.length > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Bell className="h-3 w-3" />
                <span>{pendingReservations.length}개 신규 예약</span>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      {currentView === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Store Management Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentView("store")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">매장 관리</h3>
                  <p className="text-sm text-muted-foreground">
                    매장 정보 및 사진 관리
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Management Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentView("products")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">상품 관리</h3>
                  <p className="text-sm text-muted-foreground">
                    {products.length}개 상품
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Management Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentView("reservations")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">예약 관리</h3>
                  <p className="text-sm text-muted-foreground">
                    {reservations.length}개 예약
                  </p>
                  {pendingReservations.length > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {pendingReservations.length}개 대기중
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Management Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentView("reviews")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">리뷰 관리</h3>
                  <p className="text-sm text-muted-foreground">
                    고객 리뷰 조회 및 관리
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back Button for Detail Views */}
      {currentView !== "overview" && (
        <Button
          variant="ghost"
          onClick={() => setCurrentView("overview")}
          className="mb-4"
        >
          ← 대시보드로 돌아가기
        </Button>
      )}

      {/* Store Management */}
      {currentView === "store" && (
        <StoreManagement
          storeInfo={storeInfo}
          storeImages={storeImages}
          onEditClick={() => {
            setEditFormData(storeInfo);
            setIsStoreEditOpen(true);
          }}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
        />
      )}

      {/* Product Management */}
      {currentView === "products" && (
        <ProductManagement
          products={products}
          productLogs={productLogs}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleProductDelete}
          onBulkSave={handleBulkSave}
        />
      )}

      {/* Reservation Management */}
      {currentView === "reservations" && (
        <ReservationManagement
          reservations={reservations}
          filteredReservations={filteredReservations}
          todayStats={todayStats}
          pendingCount={pendingReservations.length}
          statusFilter={statusFilter}
          startDate={startDate}
          endDate={endDate}
          searchQuery={searchQuery}
          onStatusFilterChange={setStatusFilter}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onResetFilters={handleResetFilters}
          onSearchKeyPress={handleSearchKeyPress}
          onReservationUpdate={handleReservationUpdate}
          onTodayClick={handleTodayClick}
          onPendingClick={handlePendingClick}
          onConfirmedClick={handleConfirmedClick}
          onScheduleView={onScheduleView}
          onReservationDetail={onReservationDetail}
        />
      )}

      {/* Review Management */}
      {currentView === "reviews" && (
        <ReviewManagement />
      )}

      {/* Store Edit Dialog */}
      <Dialog open={isStoreEditOpen} onOpenChange={setIsStoreEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>매장 정보 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">매장명</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessNumber">사업자등록번호</Label>
                <Input
                  id="businessNumber"
                  value={editFormData.businessNumber}
                  onChange={(e) => handleEditFormChange('businessNumber', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="description">매장 설명</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  value={editFormData.address}
                  onChange={(e) => handleEditFormChange('address', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  value={editFormData.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-3">
                <TimePicker
                  label="평일 영업시간 (월~금)"
                  value={editFormData.hours.weekday}
                  onChange={(value) => handleHoursChange('weekday', value)}
                  placeholder="평일 영업시간을 선택하세요"
                  required
                />
              </div>
              <div className="lg:col-span-3">
                <TimePicker
                  label="토요일 영업시간"
                  value={editFormData.hours.saturday}
                  onChange={(value) => handleHoursChange('saturday', value)}
                  placeholder="토요일 영업시간을 선택하세요"
                  required
                />
              </div>
              <div className="lg:col-span-3">
                <TimePicker
                  label="일요일 영업시간"
                  value={editFormData.hours.sunday}
                  onChange={(value) => handleHoursChange('sunday', value)}
                  placeholder="일요일 영업시간을 선택하세요"
                  required
                />
              </div>
              <div className="lg:col-span-3">
                <Label htmlFor="holiday">예외 영업시간</Label>
                <Input
                  id="holiday"
                  value={editFormData.hours.holiday}
                  onChange={(e) => handleHoursChange('holiday', e.target.value)}
                  placeholder="ex) 수요일 20:00 종료 / 명절 당일 휴무"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsStoreEditOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">
                저장
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}