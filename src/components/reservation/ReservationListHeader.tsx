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
            />
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}