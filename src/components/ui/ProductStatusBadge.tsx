import React from "react";
import { Badge } from "./badge";
import { ProductDisplayInfo } from "../../types/product";

interface ProductStatusBadgeProps {
  productInfo: ProductDisplayInfo;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function ProductStatusBadge({ 
  productInfo, 
  size = "sm", 
  showIcon = true 
}: ProductStatusBadgeProps) {
  // 삭제된 상품에 대한 배지 표시 제거
  return null;
}