"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Save, X, AlertCircle } from "lucide-react";
import { type Product } from "../../types/product";
import ProductTableEditor from "./ProductTableEditor";

interface ProductBulkEditorProps {
  products: Product[];
  editingProduct?: Product;
  editingProducts?: Product[];
  mode?: 'bulk' | 'edit';
  onSave: (products: Product[]) => void;
  onCancel: () => void;
}

export default function ProductBulkEditor({
  products,
  editingProduct,
  editingProducts = [],
  mode = 'bulk',
  onSave,
  onCancel,
}: ProductBulkEditorProps) {
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = (tableProducts: Product[]) => {
    onSave(tableProducts);
  };

  return (
    <div className="space-y-6">

      {/* 사용법 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">사용법</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• 단말기 선택: 등록할 단말기를 선택하면 테이블에 입력됩니다</p>
          <p>• 가격: 만원 단위로 입력하세요 (예: 1,000,000 = 100만원)</p>
          <p>• 부가 조건: + 버튼을 클릭하면 설정창이 나옵니다</p>
          <p>• 행 복사: 선택한 행을 복사하여 아래행에 추가합니다</p>
        </div>
      </div>

      {/* 테이블 입력 */}
        <ProductTableEditor
          onSave={handleSave}
          onCancel={onCancel}
          existingProducts={products}
          editingProducts={editingProducts}
          mode={mode}
        />
    </div>
  );
}