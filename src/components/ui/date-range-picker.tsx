import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { CalendarDays } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearch?: () => void;
  label?: string;
  placeholder?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  label = "",
  placeholder = "날짜를 선택하세요"
}: DateRangePickerProps) {
  
  const handleQuickDateSelect = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    onStartDateChange(formatDate(startDate));
    onEndDateChange(formatDate(today));
  };

  const clearDates = () => {
    onStartDateChange('');
    onEndDateChange('');
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="space-y-2">
        {/* 날짜 입력 필드들 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              placeholder="시작일"
              className="text-sm"
            />
          </div>
          <div>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              placeholder="종료일"
              className="text-sm"
            />
          </div>
        </div>

        {/* 빠른 선택 버튼들 */}
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateSelect(0)}
            className="text-xs px-2 py-1 h-7"
          >
            오늘
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateSelect(7)}
            className="text-xs px-2 py-1 h-7"
          >
            최근 7일
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateSelect(30)}
            className="text-xs px-2 py-1 h-7"
          >
            최근 30일
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateSelect(90)}
            className="text-xs px-2 py-1 h-7"
          >
            최근 3개월
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearDates}
            className="text-xs px-2 py-1 h-7 text-muted-foreground"
          >
            초기화
          </Button>
        </div>

        {/* 조회하기 버튼 */}
        {onSearch && (
          <div className="pt-2 border-t">
            <Button
              type="button"
              onClick={onSearch}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              조회하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}