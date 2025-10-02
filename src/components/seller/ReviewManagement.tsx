"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { DateRangePicker } from "../ui/date-range-picker";
import { Star, Search, User, Smartphone, MessageSquare, Eye, Filter, Loader2, AlertCircle } from "lucide-react";
import type { ReservationWithReview } from "../../types/review";
import { maskUserName } from "../../utils/privacy";
import { formatPrice } from "../../utils/formatPrice";
import { getProductDisplayName } from "../../utils/productDisplay";
import { useSellerReviews } from "../../hooks/useSellerReviews";
import { SellerReviewSearchParams } from "../../lib/api/reviews";

interface ReviewManagementProps {
  storeId: string;
  onReviewDetail?: (reservation: ReservationWithReview) => void;
}

export default function ReviewManagement({ storeId, onReviewDetail }: ReviewManagementProps) {
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithReview | null>(null);
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

  // API 호출을 위한 파라미터
  const searchParams: SellerReviewSearchParams = {
    storeId,
    userName: appliedUserNameSearch || undefined,
    startDate: appliedStartDate || undefined,
    endDate: appliedEndDate || undefined,
    rating: appliedRatingFilter !== 'all' ? parseInt(appliedRatingFilter) : undefined,
    sortBy: appliedSortBy,
    page: 1,
    limit: 50
  };

  // 서버에서 리뷰 데이터 조회
  const { data: reviewData, isLoading, error, refetch } = useSellerReviews(searchParams);

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

  // 서버에서 받은 데이터 처리
  const reservations = (reviewData as any)?.items || [];
  
  // 판매자 권한으로 마스킹된 데이터 가져오기
  const maskedReservations = reservations.map((reservation: ReservationWithReview) => ({
    ...reservation,
    customerName: maskUserName(reservation.customerName, 'seller')
  }));

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
            총 {maskedReservations.length}개의 리뷰
            {appliedUserNameSearch && (
              <span className="ml-2 text-blue-600">
                ('{appliedUserNameSearch}' 검색 결과)
              </span>
            )}
            {isLoading && (
              <span className="ml-2 text-blue-600">
                <Loader2 className="h-4 w-4 inline animate-spin mr-1" />
                로딩 중...
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
            <span>리뷰 목록 ({maskedReservations.length}개)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="font-semibold text-lg mb-2">리뷰를 불러오는 중...</h3>
              <p className="text-muted-foreground">잠시만 기다려주세요.</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-red-600">오류가 발생했습니다</h3>
              <p className="text-muted-foreground mb-4">
                리뷰를 불러오는 중 오류가 발생했습니다.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                다시 시도
              </Button>
            </div>
          ) : maskedReservations.length === 0 ? (
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
                {maskedReservations.map((reservation: ReservationWithReview) => (
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