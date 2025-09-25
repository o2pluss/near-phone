"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { DateRangePicker } from "../ui/date-range-picker";
import { Star, Search, User, Smartphone, MessageSquare, Eye, Filter } from "lucide-react";
import type { ReservationWithReview } from "../../types/review";
import { maskUserName } from "../../utils/privacy";
import { formatPrice } from "../../utils/formatPrice";
import { getProductDisplayName } from "../../utils/productDisplay";

// Mock 예약 및 리뷰 데이터 (예약 종료 건만 리뷰 보유)
const mockReservationsWithReviews: ReservationWithReview[] = [
  {
    id: "res-1",
    storeId: "store-1",
    storeName: "강남 휴대폰 매장",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-1",
    customerName: "햇살좋은날☀️", // 카카오 닉네임 스타일
    customerPhone: "010-1234-5678",
    date: "2025-01-20",
    time: "14:30",
    model: "iPhone 16 Pro",
    storage: "256GB",
    productCarrier: "kt",
    price: 1200000, // 예약 시 적용된 상품 금액
    status: "completed",
    createdAt: "2025-01-18T10:30:00",
    conditions: ["번호이동", "카드할인"],
    review: {
      id: "review-1",
      reservationId: "res-1",
      rating: 5,
      content: "친절하게 설명해주시고 가격도 합리적이었습니다. 추천합니다!",
      createdAt: "2025-01-20T16:30:00"
    }
  },
  {
    id: "res-2",
    storeId: "store-1",
    storeName: "강남 휴대폰 매장",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-2",
    customerName: "핸드폰왕자👑", // 카카오 닉네임 스타일
    customerPhone: "010-2345-6789",
    date: "2025-01-19",
    time: "10:15",
    model: "갤럭시 S25 울트라",
    storage: "512GB",
    productCarrier: "skt",
    price: 980000, // 예약 시 적용된 상품 금액
    status: "completed",
    createdAt: "2025-01-17T09:00:00",
    conditions: ["신규가입", "결합할인"],
    review: {
      id: "review-2",
      reservationId: "res-2",
      rating: 4,
      content: "매장이 깨끗하고 직원분이 전문적이었어요. 다만 대기시간이 조금 길었습니다.",
      createdAt: "2025-01-19T12:15:00"
    }
  },
  {
    id: "res-3",
    storeId: "store-1",
    storeName: "강남 휴대폰 매장",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-3",
    customerName: "커피한잔☕", // 카카오 닉네임 스타일
    customerPhone: "010-3456-7890",
    date: "2025-01-18",
    time: "16:20",
    model: "iPhone 16",
    storage: "128GB",
    productCarrier: "lgu",
    price: 950000, // 예약 시 적용된 상품 금액
    status: "completed",
    createdAt: "2025-01-16T14:00:00",
    conditions: ["번호이동"],
    review: {
      id: "review-3",
      reservationId: "res-3",
      rating: 5,
      content: "할인 혜택도 많고 AS 서비스도 좋네요. 만족합니다!",
      createdAt: "2025-01-18T18:20:00"
    }
  },
  {
    id: "res-4",
    storeId: "store-1",
    storeName: "강남 휴대폰 매장",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-4",
    customerName: "갤럭시러버💙", // 카카오 닉네임 스타일
    customerPhone: "010-4567-8901",
    date: "2025-01-17",
    time: "11:45",
    model: "갤럭시 S25",
    storage: "256GB",
    productCarrier: "kt",
    price: 850000, // 예약 시 적용된 상품 금액
    status: "completed",
    createdAt: "2025-01-15T13:20:00",
    conditions: ["기기변경"],
    review: {
      id: "review-4",
      reservationId: "res-4",
      rating: 3,
      content: "보통입니다. 가격은 괜찮았는데 서비스가 아쉬웠어요.",
      createdAt: "2025-01-17T13:45:00"
    }
  },
  {
    id: "res-5",
    storeId: "store-1",
    storeName: "강남 휴대폰 매장",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    userId: "user-5",
    customerName: "성실한직장인😊", // 카카오 닉네임 스타일
    customerPhone: "010-5678-9012",
    date: "2025-01-16",
    time: "09:30",
    model: "iPhone 16 Pro Max",
    storage: "1TB",
    productCarrier: "skt",
    price: 1400000, // 예약 시 적용된 상품 금액
    status: "completed",
    createdAt: "2025-01-14T11:15:00",
    conditions: ["번호이동", "카드할인", "온라인할인"],
    review: {
      id: "review-5",
      reservationId: "res-5",
      rating: 5,
      content: "정말 친절하시고 꼼꼼하게 설명해주세요. 다음에도 이용할 예정입니다.",
      createdAt: "2025-01-16T11:30:00"
    }
  }
];



interface ReviewManagementProps {
  onReviewDetail?: (reservation: ReservationWithReview) => void;
}

export default function ReviewManagement({ onReviewDetail }: ReviewManagementProps) {
  const [reservationsWithReviews, setReservationsWithReviews] = useState<ReservationWithReview[]>(mockReservationsWithReviews);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithReview | null>(null);
  
  // 판매자 권한으로 마스킹된 데이터 가져오기
  const maskedReservations = reservationsWithReviews.map(reservation => ({
    ...reservation,
    customerName: maskUserName(reservation.customerName, 'seller')
  }));
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // 필터 상태
  const [userNameSearch, setUserNameSearch] = useState(''); // 사용자명 검색
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // 적용된 필터 상태 (검색 버튼을 눌렀을 때만 적용)
  const [appliedUserNameSearch, setAppliedUserNameSearch] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedRatingFilter, setAppliedRatingFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [appliedSortBy, setAppliedSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  const handleViewDetail = (reservation: ReservationWithReview) => {
    setSelectedReservation(reservation);
    setIsDetailDialogOpen(true);
  };

  // 검색 실행 함수
  const handleSearch = () => {
    setAppliedUserNameSearch(userNameSearch);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedRatingFilter(ratingFilter);
    setAppliedSortBy(sortBy);
  };

  // 필터 초기화 함수
  const handleReset = () => {
    setUserNameSearch('');
    setStartDate('');
    setEndDate('');
    setRatingFilter('all');
    setSortBy('newest');
    setAppliedUserNameSearch('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedRatingFilter('all');
    setAppliedSortBy('newest');
  };

  // 필터링된 예약 목록 (리뷰가 있는 종료 예약만)
  const filteredReservations = maskedReservations
    .filter(reservation => reservation.review) // 리뷰가 있는 예약만
    .filter(reservation => {
      // 사용자명 검색 (마스킹된 이름으로 검색)
      const matchesUserName = 
        !appliedUserNameSearch || 
        reservation.customerName.toLowerCase().includes(appliedUserNameSearch.toLowerCase());

      // 날짜 범위 필터 (리뷰 작성일 기준)
      const reviewDate = new Date(reservation.review!.createdAt).toISOString().split('T')[0];
      const matchesDateRange = 
        (!appliedStartDate || reviewDate >= appliedStartDate) &&
        (!appliedEndDate || reviewDate <= appliedEndDate);

      const matchesRating = 
        appliedRatingFilter === 'all' || 
        reservation.review!.rating.toString() === appliedRatingFilter;

      return matchesUserName && matchesDateRange && matchesRating;
    }).sort((a, b) => {
      // 정렬 (리뷰 기준)
      switch (appliedSortBy) {
        case "newest":
          return new Date(b.review!.createdAt).getTime() - new Date(a.review!.createdAt).getTime();
        case "oldest":
          return new Date(a.review!.createdAt).getTime() - new Date(b.review!.createdAt).getTime();
        case "highest":
          return b.review!.rating - a.review!.rating;
        case "lowest":
          return a.review!.rating - b.review!.rating;
        default:
          return 0;
      }
    });

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };



  return (
    <div className="space-y-6">
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

                <div className="min-w-28">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="정렬" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">최신순</SelectItem>
                      <SelectItem value="oldest">오래된순</SelectItem>
                      <SelectItem value="highest">높은별점순</SelectItem>
                      <SelectItem value="lowest">낮은별점순</SelectItem>
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
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>리뷰 목록 ({filteredReservations.length}개)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">리뷰가 없습니다</h3>
              <p className="text-muted-foreground">
                {appliedUserNameSearch || ratingFilter !== "all" 
                  ? "검색 조건에 맞는 리뷰가 없습니다." 
                  : "아직 등록된 리뷰가 없습니다."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>별점</TableHead>
                  <TableHead>리뷰 내용</TableHead>
                  <TableHead>제품 정보</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="font-medium">{reservation.customerName}</div>
                    </TableCell>
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
                      <div className="flex items-center space-x-1">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getProductDisplayName(reservation)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(reservation.review!.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(reservation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
              {/* 리뷰 핵심 정보 */}
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
                  <Label className="text-sm font-medium">제품 정보</Label>
                  <p className="text-sm">{getProductDisplayName(selectedReservation)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">별점</Label>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedReservation.review.rating)}
                    <span className="text-sm ml-1">({selectedReservation.review.rating}점)</span>
                  </div>
                </div>
              </div>
              
              {/* 리뷰 내용 */}
              <div>
                <Label className="text-sm font-medium">리뷰 내용</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedReservation.review.content}</p>
                </div>
              </div>
              
              {/* 선택적 정보 - 접을 수 있는 섹션 */}
              <details className="border-t pt-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  예약 세부 정보 (선택사항)
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <Label className="text-xs">예약일시</Label>
                    <p className="text-xs">{selectedReservation.date} {selectedReservation.time}</p>
                  </div>
                  <div>
                    <Label className="text-xs">금액</Label>
                    <p className="text-xs">{formatPriceDisplay(selectedReservation.price)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">적용 조건</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedReservation.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs h-5">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}