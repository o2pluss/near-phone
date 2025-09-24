import React from 'react';
import { Badge } from './ui/badge';
import { getConditionStyle } from '../lib/conditionStyles';

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
        {productCarrier.toUpperCase()}
      </Badge>
      
      {/* 조건 CHIPs */}
      {conditions.map((condition, index) => {
        const { icon: IconComponent, className } = getConditionStyle(condition);
        return (
          <Badge
            key={index}
            className={`${sizeClasses} ${className}`}
          >
            <div className="flex items-center gap-0.5">
              {IconComponent && (
                <IconComponent className="h-2.5 w-2.5" />
              )}
              <span>{condition}</span>
            </div>
          </Badge>
        );
      })}
    </div>
  );
}