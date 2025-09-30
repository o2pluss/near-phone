import React from 'react';
import { Badge } from './ui/badge';
import { getConditionStyle } from '../lib/conditionStyles';
import { getCarrierLabel } from '../lib/constants/codes';

interface StoreConditionChipsProps {
  productCarrier: "kt" | "skt" | "lgu";
  conditions: string[];
  size?: 'sm' | 'md';
}

export function StoreConditionChips({ 
  productCarrier, 
  conditions, 
  size = 'sm' 
}: StoreConditionChipsProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <div className="flex flex-wrap gap-1">
      {/* 통신사 CHIP (맨 앞에 표시) */}
      <Badge className={`${sizeClasses} bg-blue-50 text-blue-700`}>
        {getCarrierLabel(productCarrier.toUpperCase() as any)}
      </Badge>
      
      {/* 조건 CHIPs */}
      {conditions.map((condition, index) => {
        const { className } = getConditionStyle(condition);
        return (
          <Badge
            key={index}
            className={`${sizeClasses} ${className}`}
          >
            {condition}
          </Badge>
        );
      })}
    </div>
  );
}