import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DateRangePicker } from "../ui/date-range-picker";
import {
  Collapsible,
  CollapsibleContent,
} from "../ui/collapsible";
import { Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface ReservationListHeaderProps {
  totalReservations: number;
  filteredCount: number;
  showDateFilter: boolean;
  onToggleDateFilter: () => void;
  tempStartDate: string;
  tempEndDate: string;
  onTempStartDateChange: (date: string) => void;
  onTempEndDateChange: (date: string) => void;
  appliedStartDate: string;
  appliedEndDate: string;
  onDateSearch: () => void;
  onDateFilterReset: () => void;
}

export default function ReservationListHeader({
  totalReservations,
  filteredCount,
  showDateFilter,
  onToggleDateFilter,
  tempStartDate,
  tempEndDate,
  onTempStartDateChange,
  onTempEndDateChange,
  appliedStartDate,
  appliedEndDate,
  onDateSearch,
  onDateFilterReset,
}: ReservationListHeaderProps) {
  const hasDateFilter = Boolean(appliedStartDate || appliedEndDate);

  return (
    <>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>예약 목록</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDateFilter}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>기간별 조회</span>
            {showDateFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          총 {totalReservations}개의 예약 내역
          {hasDateFilter && (
            <span className="text-blue-600">
              {' '}(필터 적용: {filteredCount}개)
            </span>
          )}
        </p>
      </div>

      {/* Date Filter */}
      <Collapsible open={showDateFilter}>
        <CollapsibleContent className="space-y-2">
          <Card className="p-4">
            <DateRangePicker
              startDate={tempStartDate}
              endDate={tempEndDate}
              onStartDateChange={onTempStartDateChange}
              onEndDateChange={onTempEndDateChange}
              onSearch={onDateSearch}
              label="예약 날짜 범위"
            />
            
            {/* 현재 적용된 필터 정보 표시 */}
            {hasDateFilter && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium text-blue-800">적용된 필터:</span>
                    <div className="text-blue-700 mt-1">
                      {appliedStartDate && appliedEndDate ? (
                        `${appliedStartDate} ~ ${appliedEndDate}`
                      ) : appliedStartDate ? (
                        `${appliedStartDate} 이후`
                      ) : (
                        `${appliedEndDate} 이전`
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDateFilterReset}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    필터 해제
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}