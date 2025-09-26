"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Clock, Plus, X } from "lucide-react";

export interface OperatingHours {
  [key: string]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  };
}

interface OperatingHoursEditorProps {
  value: OperatingHours;
  onChange: (value: OperatingHours) => void;
}

const DAYS = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
  { key: 'saturday', label: '토요일' },
  { key: 'sunday', label: '일요일' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return {
    value: `${hour}:00`,
    label: `${hour}:00`
  };
});

const MINUTE_OPTIONS = [
  { value: '00', label: '00분' },
  { value: '10', label: '10분' },
  { value: '20', label: '20분' },
  { value: '30', label: '30분' },
  { value: '40', label: '40분' },
  { value: '50', label: '50분' },
];

export default function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  const initializeHours = () => {
    const defaultHours: OperatingHours = {};
    DAYS.forEach(day => {
      defaultHours[day.key] = {
        isOpen: true,
        openTime: '09:00',
        closeTime: '18:00'
      };
    });
    return defaultHours;
  };

  const currentValue = Object.keys(value).length > 0 ? value : initializeHours();

  const handleDayToggle = (dayKey: string) => {
    const newValue = {
      ...currentValue,
      [dayKey]: {
        ...currentValue[dayKey],
        isOpen: !currentValue[dayKey]?.isOpen
      }
    };
    onChange(newValue);
  };

  const handleTimeChange = (dayKey: string, timeType: 'openTime' | 'closeTime', time: string) => {
    const newValue = {
      ...currentValue,
      [dayKey]: {
        ...currentValue[dayKey],
        [timeType]: time
      }
    };
    onChange(newValue);
  };

  const applyToAllDays = (template: { isOpen: boolean; openTime?: string; closeTime?: string }) => {
    const newValue = { ...currentValue };
    DAYS.forEach(day => {
      newValue[day.key] = { ...template };
    });
    onChange(newValue);
  };

  const getTimeDisplay = (day: { key: string; label: string }) => {
    const dayData = currentValue[day.key];
    if (!dayData?.isOpen) {
      return '휴무';
    }
    return `${dayData.openTime || '09:00'} - ${dayData.closeTime || '18:00'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={!isCustomMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCustomMode(false)}
          >
            기본 설정
          </Button>
          <Button
            variant={isCustomMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCustomMode(true)}
          >
            요일별 설정
          </Button>
        </div>
      </div>
      <div>
        {!isCustomMode ? (
          // 기본 설정 모드
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label>평일 (월~금)</Label>
                <div className="space-y-2">
                  <Select
                    value={currentValue.monday?.isOpen ? 'open' : 'closed'}
                    onValueChange={(value) => {
                      const isOpen = value === 'open';
                      applyToAllDays({
                        isOpen,
                        openTime: isOpen ? (currentValue.monday?.openTime || '09:00') : undefined,
                        closeTime: isOpen ? (currentValue.monday?.closeTime || '18:00') : undefined
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">영업</SelectItem>
                      <SelectItem value="closed">휴무</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {currentValue.monday?.isOpen && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">시작시간</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={currentValue.monday?.openTime?.split(':')[0] || '09'}
                            onValueChange={(hour) => {
                              const currentTime = currentValue.monday?.openTime || '09:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              applyToAllDays({
                                isOpen: true,
                                openTime: newTime,
                                closeTime: currentValue.monday?.closeTime || '18:00'
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={currentValue.monday?.openTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = currentValue.monday?.openTime || '09:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              applyToAllDays({
                                isOpen: true,
                                openTime: newTime,
                                closeTime: currentValue.monday?.closeTime || '18:00'
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">종료시간</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={currentValue.monday?.closeTime?.split(':')[0] || '18'}
                            onValueChange={(hour) => {
                              const currentTime = currentValue.monday?.closeTime || '18:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              applyToAllDays({
                                isOpen: true,
                                openTime: currentValue.monday?.openTime || '09:00',
                                closeTime: newTime
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={currentValue.monday?.closeTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = currentValue.monday?.closeTime || '18:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              applyToAllDays({
                                isOpen: true,
                                openTime: currentValue.monday?.openTime || '09:00',
                                closeTime: newTime
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>토요일</Label>
                <div className="space-y-2">
                  <Select
                    value={currentValue.saturday?.isOpen ? 'open' : 'closed'}
                    onValueChange={(value) => {
                      const isOpen = value === 'open';
                      const newValue = { ...currentValue };
                      newValue.saturday = {
                        isOpen,
                        openTime: isOpen ? (currentValue.saturday?.openTime || '09:00') : undefined,
                        closeTime: isOpen ? (currentValue.saturday?.closeTime || '18:00') : undefined
                      };
                      onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">영업</SelectItem>
                      <SelectItem value="closed">휴무</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {currentValue.saturday?.isOpen && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">시작시간</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={currentValue.saturday?.openTime?.split(':')[0] || '09'}
                            onValueChange={(hour) => {
                              const currentTime = currentValue.saturday?.openTime || '09:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              const newValue = { ...currentValue };
                              newValue.saturday = {
                                isOpen: true,
                                openTime: newTime,
                                closeTime: currentValue.saturday?.closeTime || '18:00'
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={currentValue.saturday?.openTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = currentValue.saturday?.openTime || '09:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              const newValue = { ...currentValue };
                              newValue.saturday = {
                                isOpen: true,
                                openTime: newTime,
                                closeTime: currentValue.saturday?.closeTime || '18:00'
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">종료시간</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={currentValue.saturday?.closeTime?.split(':')[0] || '18'}
                            onValueChange={(hour) => {
                              const currentTime = currentValue.saturday?.closeTime || '18:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              const newValue = { ...currentValue };
                              newValue.saturday = {
                                isOpen: true,
                                openTime: currentValue.saturday?.openTime || '09:00',
                                closeTime: newTime
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={currentValue.saturday?.closeTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = currentValue.saturday?.closeTime || '18:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              const newValue = { ...currentValue };
                              newValue.saturday = {
                                isOpen: true,
                                openTime: currentValue.saturday?.openTime || '09:00',
                                closeTime: newTime
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>일요일</Label>
                <div className="space-y-2">
                  <Select
                    value={currentValue.sunday?.isOpen ? 'open' : 'closed'}
                    onValueChange={(value) => {
                      const isOpen = value === 'open';
                      const newValue = { ...currentValue };
                      newValue.sunday = {
                        isOpen,
                        openTime: isOpen ? (currentValue.sunday?.openTime || '09:00') : undefined,
                        closeTime: isOpen ? (currentValue.sunday?.closeTime || '18:00') : undefined
                      };
                      onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">영업</SelectItem>
                      <SelectItem value="closed">휴무</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {currentValue.sunday?.isOpen && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">시작시간</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={currentValue.sunday?.openTime?.split(':')[0] || '09'}
                            onValueChange={(hour) => {
                              const currentTime = currentValue.sunday?.openTime || '09:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              const newValue = { ...currentValue };
                              newValue.sunday = {
                                isOpen: true,
                                openTime: newTime,
                                closeTime: currentValue.sunday?.closeTime || '18:00'
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={currentValue.sunday?.openTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = currentValue.sunday?.openTime || '09:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              const newValue = { ...currentValue };
                              newValue.sunday = {
                                isOpen: true,
                                openTime: newTime,
                                closeTime: currentValue.sunday?.closeTime || '18:00'
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">종료시간</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={currentValue.sunday?.closeTime?.split(':')[0] || '18'}
                            onValueChange={(hour) => {
                              const currentTime = currentValue.sunday?.closeTime || '18:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              const newValue = { ...currentValue };
                              newValue.sunday = {
                                isOpen: true,
                                openTime: currentValue.sunday?.openTime || '09:00',
                                closeTime: newTime
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={currentValue.sunday?.closeTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = currentValue.sunday?.closeTime || '18:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              const newValue = { ...currentValue };
                              newValue.sunday = {
                                isOpen: true,
                                openTime: currentValue.sunday?.openTime || '09:00',
                                closeTime: newTime
                              };
                              onChange(newValue);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 요일별 설정 모드
          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayData = currentValue[day.key] || { isOpen: false };
              
              return (
                <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-20">
                    <Label className="text-sm font-medium">{day.label}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select
                      value={dayData.isOpen ? 'open' : 'closed'}
                      onValueChange={(value) => handleDayToggle(day.key)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">영업</SelectItem>
                        <SelectItem value="closed">휴무</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {dayData.isOpen && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm text-gray-600">시작</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={dayData.openTime?.split(':')[0] || '09'}
                            onValueChange={(hour) => {
                              const currentTime = dayData.openTime || '09:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              handleTimeChange(day.key, 'openTime', newTime);
                            }}
                          >
                            <SelectTrigger className="w-16 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={dayData.openTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = dayData.openTime || '09:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              handleTimeChange(day.key, 'openTime', newTime);
                            }}
                          >
                            <SelectTrigger className="w-16 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label className="text-sm text-gray-600">종료</Label>
                        <div className="flex space-x-1">
                          <Select
                            value={dayData.closeTime?.split(':')[0] || '18'}
                            onValueChange={(hour) => {
                              const currentTime = dayData.closeTime || '18:00';
                              const newTime = `${hour}:${currentTime.split(':')[1]}`;
                              handleTimeChange(day.key, 'closeTime', newTime);
                            }}
                          >
                            <SelectTrigger className="w-16 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}시
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={dayData.closeTime?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const currentTime = dayData.closeTime || '18:00';
                              const newTime = `${currentTime.split(':')[0]}:${minute}`;
                              handleTimeChange(day.key, 'closeTime', newTime);
                            }}
                          >
                            <SelectTrigger className="w-16 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((minute) => (
                                <SelectItem key={minute.value} value={minute.value}>
                                  {minute.value}분
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="text-sm text-gray-500">
                    {getTimeDisplay(day)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
