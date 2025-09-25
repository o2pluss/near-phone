import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter, Search } from "lucide-react";

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

interface ReservationFiltersProps {
  statusFilter: "all" | Reservation["status"];
  startDate: string;
  endDate: string;
  searchQuery: string;
  onStatusFilterChange: (value: "all" | Reservation["status"]) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onSearchKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ReservationFilters({
  statusFilter,
  startDate,
  endDate,
  searchQuery,
  onStatusFilterChange,
  onStartDateChange,
  onEndDateChange,
  onSearchQueryChange,
  onSearch,
  onReset,
  onSearchKeyPress,
}: ReservationFiltersProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* 첫 번째 행: 검색어와 상태 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search-query">고객명/연락처</Label>
            <Input
              id="search-query"
              placeholder="고객명 또는 휴대전화 뒷자리 4자"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={onSearchKeyPress}
            />
          </div>
          <div>
            <Label htmlFor="status-filter">예약 상태</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusFilterChange(value as "all" | Reservation["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="confirmed">예약 확정</SelectItem>
                <SelectItem value="completed">종료</SelectItem>
                <SelectItem value="cancel_pending">취소중</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 두 번째 행: 날짜 필터 2열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">시작 날짜</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">종료 날짜</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onSearch} className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>검색</span>
          </Button>
          <Button variant="outline" onClick={onReset}>
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}