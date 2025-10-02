import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { DateRangePicker } from '../ui/date-range-picker';
import {
  Star,
  Eye,
  Ban,
  UserCheck,
  Search,
  Filter,
  User,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { ReservationWithReview } from '../../types/review';
import { maskUserName } from '../../utils/privacy';
import { formatPrice } from '../../utils/formatPrice';

interface AdminReservationWithReview extends ReservationWithReview {
  blocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
  blockedBy?: string;
}

// Mock 데이터 - 실제로는 서버에서 가져와야 함 (카카오 소셜 로그인 사용자명)
const mockReservationsWithReviews: AdminReservationWithReview[] = [
  {
    id: "res-1",
    storeId: "1",
    storeName: "강남 모바일센터",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-1",
    customerName: "햇살좋은날☀️", // 카카오 닉네임 스타일
    customerPhone: "010-1234-5678",
    date: "2025-01-20",
    time: "14:30",
    model: "iPhone 15 Pro",
    price: 1200000,
    status: "completed",
    createdAt: "2025-01-18T10:30:00",
    conditions: ["번호이동", "카드할인"],
    review: {
      id: "review-1",
      reservationId: "res-1",
      rating: 5,
      content: "친절하게 설명해주시고 가격도 합리적이었습니다. 추천합니다!",
      createdAt: "2025-01-20T16:30:00"
    },
    blocked: false
  },
  {
    id: "res-2",
    storeId: "1",
    storeName: "강남 모바일센터",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-2",
    customerName: "핸드폰왕자👑", // 카카오 닉네임 스타일
    customerPhone: "010-2345-6789",
    date: "2025-01-19",
    time: "10:15",
    model: "Galaxy S24 Ultra",
    price: 980000,
    status: "completed",
    createdAt: "2025-01-17T09:00:00",
    conditions: ["신규가입", "결합할인"],
    review: {
      id: "review-2",
      reservationId: "res-2",
      rating: 1,
      content: "최악의 매장입니다. 사기당했어요. 절대 가지마세요!!",
      createdAt: "2025-01-19T12:15:00"
    },
    blocked: true,
    blockedReason: "부적절한 표현 및 악성 리뷰",
    blockedAt: "2025-01-19T15:30:00",
    blockedBy: "admin-1"
  },
  {
    id: "res-3",
    storeId: "2",
    storeName: "서초 스마트폰",
    storeAddress: "서울시 서초구 서초동 456-78",
    storePhone: "02-2345-6789",
    userId: "user-3",
    customerName: "커피한잔☕", // 카카오 닉네임 스타일
    customerPhone: "010-3456-7890",
    date: "2025-01-18",
    time: "16:20",
    model: "iPhone 15",
    price: 950000,
    status: "completed",
    createdAt: "2025-01-16T14:00:00",
    conditions: ["번호이동"],
    review: {
      id: "review-3",
      reservationId: "res-3",
      rating: 4,
      content: "직원분이 친절하시고 설명도 자세히 해주셨어요. 다만 대기시간이 조금 길었습니다.",
      createdAt: "2025-01-18T18:20:00"
    },
    blocked: false
  },
  {
    id: "res-4",
    storeId: "3",
    storeName: "논현 휴대폰마트",
    storeAddress: "서울시 강남구 논현동 789-12",
    storePhone: "02-3456-7890",
    userId: "user-4",
    customerName: "갤럭시러버💙", // 카카오 닉네임 스타일
    customerPhone: "010-4567-8901",
    date: "2025-01-17",
    time: "11:45",
    model: "Galaxy S24",
    price: 850000,
    status: "completed",
    createdAt: "2025-01-15T13:20:00",
    conditions: ["기기변경"],
    review: {
      id: "review-4",
      reservationId: "res-4",
      rating: 2,
      content: "직원이 불친절하고 가격도 비싸요. 다른 곳 알아보세요.",
      createdAt: "2025-01-17T13:45:00"
    },
    blocked: false
  },
  {
    id: "res-5",
    storeId: "1",
    storeName: "강남 모바일센터",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-5",
    customerName: "성실한직장인😊", // 카카오 닉네임 스타일
    customerPhone: "010-5678-9012",
    date: "2025-01-16",
    time: "09:30",
    model: "iPhone 15 Pro Max",
    price: 1400000,
    status: "completed",
    createdAt: "2025-01-14T11:15:00",
    conditions: ["번호이동", "카드할인", "온라인할인"],
    review: {
      id: "review-5",
      reservationId: "res-5",
      rating: 5,
      content: "정말 친절하시고 꼼꼼하게 설명해주세요. 할인도 많이 받았어요!",
      createdAt: "2025-01-16T11:30:00"
    },
    blocked: false
  },
  {
    id: "res-6",
    storeId: "2",
    storeName: "서초 스마트폰",
    storeAddress: "서울시 서초구 서초동 456-78",
    storePhone: "02-2345-6789",
    userId: "user-6",
    customerName: "아이폰매니아🍎", // 카카오 닉네임 스타일
    customerPhone: "010-6789-0123",
    date: "2025-01-15",
    time: "13:45",
    model: "iPhone 14",
    price: 800000,
    status: "completed",
    createdAt: "2025-01-13T12:30:00",
    conditions: ["기기변경", "카드할인"],
    review: {
      id: "review-6",
      reservationId: "res-6",
      rating: 3,
      content: "보통입니다. 가격은 적당한데 서비스가 아쉬워요.",
      createdAt: "2025-01-15T15:45:00"
    },
    blocked: false
  },
  {
    id: "res-7",
    storeId: "3",
    storeName: "논현 휴대폰마트",
    storeAddress: "서울시 강남구 논현동 789-12",
    storePhone: "02-3456-7890",
    userId: "user-7",
    customerName: "꽃님이🌸", // 카카오 닉네임 스타일
    customerPhone: "010-7890-1234",
    date: "2025-01-14",
    time: "10:20",
    model: "Galaxy Z Flip 5",
    price: 1100000,
    status: "completed",
    createdAt: "2025-01-12T08:40:00",
    conditions: ["신규가입", "결합할인"],
    review: {
      id: "review-7",
      reservationId: "res-7",
      rating: 4,
      content: "매장이 깔끔하고 직원분들도 전문적이에요. 추천드려요~",
      createdAt: "2025-01-14T12:20:00"
    },
    blocked: false
  },
  {
    id: "res-8",
    storeId: "1",
    storeName: "강남 모바일센터",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-8",
    customerName: "폰테크전문가📱", // 카카오 닉네임 스타일
    customerPhone: "010-8901-2345",
    date: "2025-01-13",
    time: "15:10",
    model: "Galaxy S23",
    price: 750000,
    status: "completed",
    createdAt: "2025-01-11T14:25:00",
    conditions: ["기기변경"],
    review: {
      id: "review-8",
      reservationId: "res-8",
      rating: 2,
      content: "예상보다 할인이 적었고 부가서비스 강요가 심했어요",
      createdAt: "2025-01-13T17:10:00"
    },
    blocked: false
  }
];

interface ReviewManagementProps {
  // 추후 확장 가능한 props
}

export default function ReviewManagement({}: ReviewManagementProps) {
  const router = useRouter();
  const [reservationsWithReviews, setReservationsWithReviews] = useState<AdminReservationWithReview[]>(mockReservationsWithReviews);
  const [selectedReservation, setSelectedReservation] = useState<AdminReservationWithReview | null>(null);
  
  // 관리자 권한으로 전체 이름 조회 가능 (마스킹 없음)
  const adminReservations = reservationsWithReviews.map(reservation => ({
    ...reservation,
    customerName: maskUserName(reservation.customerName, 'admin') // 관리자는 마스킹 없음
  }));
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  
  // 필터 상태
  const [userNameSearch, setUserNameSearch] = useState(''); // 사용자명 검색
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');

  // 적용된 필터 상태 (검색 버튼을 눌렀을 때만 적용)
  const [appliedUserNameSearch, setAppliedUserNameSearch] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [appliedRatingFilter, setAppliedRatingFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [appliedStoreFilter, setAppliedStoreFilter] = useState<string>('all');

  const handleViewDetail = (reservation: AdminReservationWithReview) => {
    setSelectedReservation(reservation);
    setIsDetailDialogOpen(true);
  };

  const handleBlockReview = (reservation: AdminReservationWithReview) => {
    setSelectedReservation(reservation);
    setBlockReason('');
    setIsBlockDialogOpen(true);
  };

  const confirmBlockReview = () => {
    if (!selectedReservation || !blockReason.trim()) return;

    setReservationsWithReviews(reservationsWithReviews.map(reservation => 
      reservation.id === selectedReservation.id 
        ? { 
            ...reservation, 
            blocked: true,
            blockedReason: blockReason.trim(),
            blockedAt: new Date().toISOString(),
            blockedBy: 'admin-current'
          }
        : reservation
    ));
    
    setIsBlockDialogOpen(false);
    setSelectedReservation(null);
    setBlockReason('');
  };

  const handleUnblockReview = (reservationId: string) => {
    setReservationsWithReviews(reservationsWithReviews.map(reservation => 
      reservation.id === reservationId 
        ? { 
            ...reservation, 
            blocked: false,
            blockedReason: undefined,
            blockedAt: undefined,
            blockedBy: undefined
          }
        : reservation
    ));
  };

  // 검색 실행 함수
  const handleSearch = () => {
    setAppliedUserNameSearch(userNameSearch);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedStatusFilter(statusFilter);
    setAppliedRatingFilter(ratingFilter);
    setAppliedStoreFilter(storeFilter);
  };

  // 필터 초기화 함수
  const handleReset = () => {
    setUserNameSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setRatingFilter('all');
    setStoreFilter('all');
    setAppliedUserNameSearch('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedStatusFilter('all');
    setAppliedRatingFilter('all');
    setAppliedStoreFilter('all');
  };

  // 필터링된 예약 목록 (리뷰가 있는 종료 예약만)
  const filteredReservations = adminReservations
    .filter(reservation => reservation.review) // 리뷰가 있는 예약만
    .filter(reservation => {
      // 사용자명 검색 (카카오 소셜 로그인 사용자명)
      const matchesUserName = 
        !appliedUserNameSearch || 
        reservation.customerName.toLowerCase().includes(appliedUserNameSearch.toLowerCase());

      // 날짜 범위 필터 (리뷰 작성일 기준)
      const reviewDate = new Date(reservation.review!.createdAt).toISOString().split('T')[0];
      const matchesDateRange = 
        (!appliedStartDate || reviewDate >= appliedStartDate) &&
        (!appliedEndDate || reviewDate <= appliedEndDate);

      const matchesStatus = 
        appliedStatusFilter === 'all' || 
        (appliedStatusFilter === 'active' && !reservation.blocked) ||
        (appliedStatusFilter === 'blocked' && reservation.blocked);

      const matchesRating = 
        appliedRatingFilter === 'all' || 
        reservation.review!.rating.toString() === appliedRatingFilter;

      const matchesStore = 
        appliedStoreFilter === 'all' || 
        reservation.storeId === appliedStoreFilter;

      return matchesUserName && matchesDateRange && matchesStatus && matchesRating && matchesStore;
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatPriceDisplay = (price: number) => {
    return formatPrice(price);
  };

  const uniqueStores = Array.from(new Set(adminReservations.map(r => r.storeId)))
    .map(storeId => {
      const reservation = adminReservations.find(r => r.storeId === storeId);
      return { id: storeId, name: reservation?.storeName || '' };
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              리뷰 관리
            </h1>
            <p className="text-muted-foreground">리뷰 및 예약 관리</p>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 검색 및 필터 */}
          <div className="space-y-3">
            {/* 사용자명 검색 */}
            <div>
              <Label className="text-sm mb-1.5 block">사용자명 검색</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="카카오 사용자명으로 검색"
                  value={userNameSearch}
                  onChange={(e) => setUserNameSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 날짜 범위 */}
            <div>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                label="작성 날짜 범위"
              />
            </div>

            {/* 필터 및 버튼 행 */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* 필터들 */}
              <div className="flex gap-2 flex-1 flex-wrap">
                <div className="min-w-20">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="blocked">차단됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-24">
                  <Select value={ratingFilter} onValueChange={(value: any) => setRatingFilter(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="별점" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐</SelectItem>
                      <SelectItem value="3">⭐⭐⭐</SelectItem>
                      <SelectItem value="2">⭐⭐</SelectItem>
                      <SelectItem value="1">⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-32 flex-1">
                  <Select value={storeFilter} onValueChange={setStoreFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="매장" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 매장</SelectItem>
                      {uniqueStores.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 검색/초기화 버튼 */}
              <div className="flex gap-2 sm:w-auto w-full">
                <Button onClick={handleSearch} className="flex-1 sm:w-20">
                  <Search className="h-4 w-4 sm:mr-0 mr-2" />
                  <span className="sm:hidden">검색</span>
                </Button>
                <Button variant="outline" onClick={handleReset} className="flex-1 sm:w-20">
                  초기화
                </Button>
              </div>
            </div>
          </div>

          {/* 검색 결과 수 */}
          <div className="text-sm text-muted-foreground border-t pt-3">
            총 {filteredReservations.length}개의 리뷰
            {appliedUserNameSearch && (
              <span className="ml-2 text-blue-600">
                ('{appliedUserNameSearch}' 검색 결과)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            리뷰 목록 ({filteredReservations.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>매장</TableHead>
                <TableHead>별점</TableHead>
                <TableHead>리뷰 내용</TableHead>
                <TableHead>구매 모델</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.customerName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{reservation.storeName}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {renderStars(reservation.review!.rating)}
                      <span className="text-sm ml-1">({reservation.review!.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={reservation.review!.content}>
                      {reservation.review!.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{reservation.model}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatPriceDisplay(reservation.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(reservation.review!.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reservation.blocked ? 'destructive' : 'default'}>
                      {reservation.blocked ? '차단됨' : '활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(reservation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!reservation.blocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlockReview(reservation)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockReview(reservation.id)}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 리뷰 상세보기 Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>리뷰 상세 정보</DialogTitle>
          </DialogHeader>
          
          {selectedReservation && selectedReservation.review && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">작성자</Label>
                  <p className="text-sm">{selectedReservation.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">작성일시</Label>
                  <p className="text-sm">{formatDate(selectedReservation.review.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">매장</Label>
                  <p className="text-sm">{selectedReservation.storeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">예약일시</Label>
                  <p className="text-sm">{selectedReservation.date} {selectedReservation.time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">구매 모델</Label>
                  <p className="text-sm">{selectedReservation.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">금액</Label>
                  <p className="text-sm">{formatPriceDisplay(selectedReservation.price)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">별점</Label>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedReservation.review.rating)}
                    <span className="text-sm ml-1">({selectedReservation.review.rating}점)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">적용 조건</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedReservation.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">리뷰 내용</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedReservation.review.content}</p>
                </div>
              </div>

              {selectedReservation.blocked && (
                <div className="border border-red-200 rounded-md p-3 bg-red-50">
                  <Label className="text-sm font-medium text-red-700">차단 정보</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-red-600">사유: {selectedReservation.blockedReason}</p>
                    <p className="text-xs text-red-500">
                      차단일: {selectedReservation.blockedAt && formatDate(selectedReservation.blockedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 리뷰 차단 Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>리뷰 차단</DialogTitle>
            <DialogDescription>
              이 리뷰를 차단하시겠습니까? 차단된 리뷰는 사용자에게 표시되지 않습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>차단 사유 *</Label>
              <Textarea
                placeholder="차단 사유를 입력해주세요"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmBlockReview}
              disabled={!blockReason.trim()}
            >
              차단하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}