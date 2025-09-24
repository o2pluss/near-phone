// @ts-nocheck
// 이 파일은 삭제되었습니다 - SellerDashboard.tsx와 seller/ 폴더로 컴포넌트가 분리되었습니다.
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface StoreInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  businessNumber: string;
  hours: {
    weekday: string;
    weekend: string;
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
  stock: number;
  isActive: boolean;
}

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
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
    weekend: "10:00 - 20:00",
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
    model: "iPhone 15 Pro",
    carrier: "KT",
    storage: "256GB",
    price: 1200000,
    conditions: ["번호이동", "카드할인"],
    stock: 5,
    isActive: true,
  },
  {
    id: "2",
    model: "Galaxy S24 Ultra",
    carrier: "SKT",
    storage: "512GB",
    price: 980000,
    conditions: ["신규가입", "결합할인"],
    stock: 3,
    isActive: true,
  },
  {
    id: "3",
    model: "iPhone 15",
    carrier: "LG U+",
    storage: "128GB",
    price: 950000,
    conditions: ["번호이동", "필수요금제"],
    stock: 0,
    isActive: false,
  },
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

// 날짜 형식 변환 함수 (YYYY-MM-DD → YY.MM.DD)
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const mockReservations: Reservation[] = [
  {
    id: "1",
    customerName: "김고객",
    customerPhone: "010-1234-5678",
    date: getTodayDate(), // 실제 오늘
    time: "14:30",
    model: "iPhone 15 Pro",
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
    model: "Galaxy S24 Ultra",
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
    model: "iPhone 15",
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
    model: "Galaxy S24",
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
    model: "iPhone 14 Pro",
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
    model: "Galaxy S24 Ultra",
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
    model: "iPhone 15 Pro Max",
    price: 1400000,
    status: "pending",
    createdAt: "2025-01-22T12:15:00",
  },
];

interface SellerDashboardProps {
  onScheduleView?: () => void;
}

export default function SellerDashboard({
  onScheduleView,
}: SellerDashboardProps) {
  const [storeInfo, setStoreInfo] =
    useState<StoreInfo>(mockStoreInfo);
  const [products, setProducts] =
    useState<Product[]>(mockProducts);
  const [reservations, setReservations] =
    useState<Reservation[]>(mockReservations);
  const [isStoreEditOpen, setIsStoreEditOpen] = useState(false);
  const [isProductEditOpen, setIsProductEditOpen] =
    useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);
  const [storeImages, setStoreImages] = useState<string[]>(
    storeInfo.images,
  );

  // 예약 관리 필터 상태 (입력용)
  const [statusFilter, setStatusFilter] = useState<
    "all" | Reservation["status"]
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 실제 적용된 필터 상태
  const [appliedStatusFilter, setAppliedStatusFilter] =
    useState<"all" | Reservation["status"]>("all");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] =
    useState("");

  // 가입유형과 조건 옵션
  const joinTypeOptions = ["번호이동", "신규가입", "기기변경"];
  const conditionOptions = [
    "카드할인",
    "결합할인",
    "필수요금제",
    "부가서비스",
  ];

  const storeForm = useForm<StoreInfo>({
    defaultValues: storeInfo,
  });

  const productForm = useForm<Omit<Product, "id">>({
    defaultValues: {
      model: "",
      carrier: "",
      storage: "",
      price: 0,
      conditions: [],
      stock: 0,
      isActive: true,
    },
  });

  // 이미지 업로드 핸들러
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    // 최대 5개 제한
    const remainingSlots = 5 - storeImages.length;
    if (remainingSlots <= 0) {
      alert("최대 5개의 이미지만 업로드할 수 있습니다.");
      return;
    }

    const filesToProcess = Array.from(files).slice(
      0,
      remainingSlots,
    );

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setStoreImages((prev) => [
            ...prev,
            e.target?.result as string,
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index: number) => {
    setStoreImages((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const handleStoreUpdate = (data: StoreInfo) => {
    const updatedData = { ...data, images: storeImages };
    setStoreInfo(updatedData);
    setIsStoreEditOpen(false);
  };

  const handleProductSave = (data: Omit<Product, "id">) => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...data, id: editingProduct.id }
            : p,
        ),
      );
    } else {
      const newProduct: Product = {
        ...data,
        id: Date.now().toString(),
      };
      setProducts([...products, newProduct]);
    }
    setIsProductEditOpen(false);
    setEditingProduct(null);
    productForm.reset();
  };

  const handleProductDelete = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
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

  const getStatusInfo = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "승인 대기",
          variant: "secondary" as const,
        };
      case "confirmed":
        return {
          label: "예약 확정",
          variant: "default" as const,
        };
      case "completed":
        return {
          label: "완료",
          variant: "secondary" as const,
        };
      case "cancelled":
        return {
          label: "취소됨",
          variant: "destructive" as const,
        };
    }
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

  const pendingReservations = reservations.filter(
    (r) => r.status === "pending",
  );

  // 오늘 날짜
  const today = new Date().toISOString().split("T")[0];

  // 당일 예약 필터링
  const todayReservations = reservations.filter(
    (r) => r.date === today,
  );

  // 필터링된 예약 목록 (적용된 필터 기준)
  let filteredReservations = reservations.filter(
    (reservation) => {
      // 상태 필터
      if (appliedStatusFilter !== "all") {
        // 확정/완료는 confirmed, completed 둘 다 포함
        if (appliedStatusFilter === "confirmed") {
          if (
            !["confirmed", "completed"].includes(
              reservation.status,
            )
          ) {
            return false;
          }
        } else if (reservation.status !== appliedStatusFilter) {
          return false;
        }
      }

      // 날짜 필터
      if (
        appliedStartDate &&
        reservation.date < appliedStartDate
      ) {
        return false;
      }
      if (appliedEndDate && reservation.date > appliedEndDate) {
        return false;
      }

      return true;
    },
  );

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
    pending: todayReservations.filter(
      (r) => r.status === "pending",
    ).length,
    confirmed: todayReservations.filter(
      (r) => r.status === "confirmed",
    ).length,
    completed: todayReservations.filter(
      (r) => r.status === "completed",
    ).length,
  };

  const [currentView, setCurrentView] = useState<
    "overview" | "store" | "products" | "reservations"
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

  // 버튼 색상 및 텍스트 가져오기 함수
  const getActionButtons = (reservation: Reservation) => {
    const buttons = [];
    
    switch (reservation.status) {
      case "pending":
        buttons.push(
          <Button
            key="accept"
            size="sm"
            onClick={() => handleReservationUpdate(reservation.id, "confirmed")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            수락
          </Button>
        );
        buttons.push(
          <Button
            key="reject"
            size="sm"
            variant="destructive"
            onClick={() => handleReservationUpdate(reservation.id, "cancelled")}
          >
            거절
          </Button>
        );
        break;
      case "confirmed":
        buttons.push(
          <Button
            key="complete"
            size="sm"
            onClick={() => handleReservationUpdate(reservation.id, "completed")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            완료
          </Button>
        );
        break;
      case "completed":
      case "cancelled":
        // 완료되거나 취소된 예약은 버튼 없음
        break;
    }
    
    return buttons;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            판매자 대시보드
          </h1>
          <p className="text-muted-foreground">
            {storeInfo.name}
          </p>
        </div>
        {pendingReservations.length > 0 && (
          <Badge
            variant="destructive"
            className="flex items-center space-x-1"
          >
            <Bell className="h-3 w-3" />
            <span>
              {pendingReservations.length}개 신규 예약
            </span>
          </Badge>
        )}
      </div>

      {/* Navigation Cards */}
      {currentView === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Badge
                      variant="destructive"
                      className="mt-1"
                    >
                      {pendingReservations.length}개 대기중
                    </Badge>
                  )}
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
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>매장 정보</CardTitle>
              <Button onClick={() => setIsStoreEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>매장명</Label>
                  <p className="font-medium">
                    {storeInfo.name}
                  </p>
                </div>
                <div>
                  <Label>사업자등록번호</Label>
                  <p className="font-medium">
                    {storeInfo.businessNumber}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label>매장 설명</Label>
                  <p className="text-muted-foreground">
                    {storeInfo.description}
                  </p>
                </div>
                <div>
                  <Label>주소</Label>
                  <p className="font-medium">
                    {storeInfo.address}
                  </p>
                </div>
                <div>
                  <Label>연락처</Label>
                  <p className="font-medium">
                    {storeInfo.phone}
                  </p>
                </div>
                <div>
                  <Label>평일 영업시간</Label>
                  <p className="font-medium">
                    {storeInfo.hours.weekday}
                  </p>
                </div>
                <div>
                  <Label>주말 영업시간</Label>
                  <p className="font-medium">
                    {storeInfo.hours.weekend}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Images Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>매장 사진 ({storeImages.length}/5)</span>
              </CardTitle>
              <div className="space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={storeImages.length >= 5}
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      사진 추가
                    </span>
                  </Button>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {storeImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {storeImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`매장 사진 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    아직 업로드된 사진이 없습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    매장의 모습을 고객에게 보여주세요 (최대 5장)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Management */}
      {currentView === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              상품 목록 ({products.length})
            </h3>
            <Button
              onClick={() => {
                setEditingProduct(null);
                productForm.reset();
                setIsProductEditOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              상품 추가
            </Button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">
                          {product.model}
                        </h4>
                        <Badge
                          variant={
                            product.isActive
                              ? "default"
                              : "secondary"
                          }
                        >
                          {product.isActive ? "활성" : "비활성"}
                        </Badge>
                        {product.stock === 0 && (
                          <Badge variant="destructive">
                            품절
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          통신사: {product.carrier} | 용량:{" "}
                          {product.storage}
                        </div>
                        <div>재고: {product.stock}개</div>
                        <div className="font-semibold text-red-600 text-lg">
                          {product.price.toLocaleString()}원
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.conditions.map(
                          (condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {condition}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          productForm.reset(product);
                          setIsProductEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleProductDelete(product.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reservation Management */}
      {currentView === "reservations" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              예약 관리 ({reservations.length})
            </h3>
          </div>

          {/* 당일 예약 요약 */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setStatusFilter("all");
                setStartDate(today);
                setEndDate(today);
                setSearchQuery("");
                handleSearch();
              }}
            >
              <CardContent className="p-2 md:p-4">
                <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
                  <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      오늘 예약
                    </p>
                    <p className="text-lg md:text-xl font-semibold">
                      {todayStats.total}건
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setStatusFilter("pending");
                setStartDate("");
                setEndDate("");
                setSearchQuery("");
                handleSearch();
              }}
            >
              <CardContent className="p-2 md:p-4">
                <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
                  <div className="p-1 md:p-2 bg-yellow-100 rounded-lg">
                    <Timer className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      대기중
                    </p>
                    <p className="text-lg md:text-xl font-semibold">
                      {pendingReservations.length}건
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setStatusFilter("confirmed");
                setStartDate("");
                setEndDate("");
                setSearchQuery("");
                handleSearch();
              }}
            >
              <CardContent className="p-2 md:p-4">
                <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
                  <div className="p-1 md:p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      확정/완료
                    </p>
                    <p className="text-lg md:text-xl font-semibold">
                      {todayStats.confirmed + todayStats.completed}건
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 및 필터 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>검색 및 필터</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search-query">고객명/연락처 뒷번호</Label>
                  <Input
                    id="search-query"
                    placeholder="고객명 또는 연락처 뒷번호 4자리"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                </div>
                <div>
                  <Label htmlFor="status-filter">예약 상태</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as "all" | Reservation["status"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="pending">승인 대기</SelectItem>
                      <SelectItem value="confirmed">예약 확정</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">시작 날짜</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">종료 날짜</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSearch} className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>검색</span>
                </Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  초기화
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 예약 목록 */}
          <div className="space-y-4">
            {filteredReservations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    조건에 맞는 예약이 없습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    검색 조건을 변경해 보세요
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    {/* 요청된 UI 형식 */}
                    <div className="space-y-3">
                      {/* 1행: 예약일시 + 처리 버튼 */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {formatDateShort(reservation.date)} {reservation.time}
                        </div>
                        <div className="flex space-x-2">
                          {getActionButtons(reservation)}
                        </div>
                      </div>
                      
                      {/* 2행: 예약 상태 + 고객명 + 연락처 */}
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusInfo(reservation.status).variant}>
                          {getStatusInfo(reservation.status).label}
                        </Badge>
                        <span className="text-sm">
                          {reservation.customerName} · {reservation.customerPhone}
                        </span>
                      </div>
                      
                      {/* 3행: 모델명 + 가격 */}
                      <div className="flex justify-between items-center">
                        <div className="font-medium">
                          {reservation.model}
                        </div>
                        <div className="font-semibold text-red-600">
                          {reservation.price.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}