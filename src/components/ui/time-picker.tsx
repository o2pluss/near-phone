import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Button } from './button';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  allowClosed?: boolean;
  required?: boolean;
}

export function TimePicker({ 
  value, 
  onChange, 
  label, 
  placeholder = "시간을 선택하세요",
  allowClosed = true,
  required = false 
}: TimePickerProps) {
  // 시간 옵션 생성 (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  
  // 분 옵션 생성 (0, 30)
  const minutes = ['00', '30'];

  // 현재 값 파싱
  const parseCurrentValue = () => {
    if (value === '휴무' || !value) {
      return { type: value || '', startHour: '09', startMinute: '00', endHour: '18', endMinute: '00' };
    }

    // "09:00 - 21:00" 형태 파싱
    const match = value.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      return {
        type: 'time',
        startHour: match[1],
        startMinute: match[2],
        endHour: match[3],
        endMinute: match[4]
      };
    }

    return { type: 'time', startHour: '09', startMinute: '00', endHour: '18', endMinute: '00' };
  };

  const current = parseCurrentValue();

  const updateTime = (field: string, newValue: string) => {
    if (field === 'type') {
      if (newValue === '휴무') {
        onChange('휴무');
      } else {
        // 기본 시간으로 설정
        onChange('09:00 - 18:00');
      }
      return;
    }

    if (current.type !== 'time') return;

    const updated = { ...current, [field]: newValue };
    const timeString = `${updated.startHour}:${updated.startMinute} - ${updated.endHour}:${updated.endMinute}`;
    onChange(timeString);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* 운영 방식 선택 */}
      <div>
        <Select 
          value={current.type === 'time' ? 'time' : current.type} 
          onValueChange={(value) => updateTime('type', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="운영 방식 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">정해진 시간</SelectItem>
            {allowClosed && <SelectItem value="휴무">휴무</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* 시간 선택 (정해진 시간일 때만 표시) */}
      {current.type === 'time' && (
        <div className="space-y-3">
          {/* 시작시간 ~ 종료시간 (한 줄에 배치) */}
          <div>
            <div className="flex items-center space-x-1">
              {/* 시작 시간 */}
              <Select value={current.startHour} onValueChange={(value) => updateTime('startHour', value)}>
                <SelectTrigger className="w-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(hour => (
                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-sm">:</span>
              <Select value={current.startMinute} onValueChange={(value) => updateTime('startMinute', value)}>
                <SelectTrigger className="w-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map(minute => (
                    <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* 구분자 */}
              <span className="text-muted-foreground font-medium px-1">~</span>
              
              {/* 종료 시간 */}
              <Select value={current.endHour} onValueChange={(value) => updateTime('endHour', value)}>
                <SelectTrigger className="w-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(hour => (
                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-sm">:</span>
              <Select value={current.endMinute} onValueChange={(value) => updateTime('endMinute', value)}>
                <SelectTrigger className="w-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map(minute => (
                    <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


        </div>
      )}

      {/* 현재 설정값 표시 */}
      <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
        <span className="font-medium">현재 설정:</span> {value || placeholder}
      </div>
    </div>
  );
}