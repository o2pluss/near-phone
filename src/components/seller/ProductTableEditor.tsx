"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { PageLoadingSpinner } from "../ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Save, Copy, X, Plus } from "lucide-react";
import { 
  ADDITIONAL_CONDITIONS, 
  CONDITION_DISPLAY_NAMES, 
  type AdditionalConditionKey,
  convertKeysToTexts,
  convertTextsToKeys
} from "@/lib/constants";
import { getAllDeviceModels } from "../../lib/api/deviceModels";
import { type DeviceModel } from "../../types/product";
import { MANUFACTURER_LABELS, STORAGE_LABELS, type StorageCode } from "../../lib/constants/codes";
import DeviceModelSelectionModal from "./DeviceModelSelectionModal";
import { createProductsBulk } from "../../lib/api/productBulk";
import { getCurrentUserStore } from "../../lib/store";

// 모델과 용량 조합을 생성하는 함수
const generateModelStorageCombinations = (deviceModels: DeviceModel[]) => {
  const combinations: Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string; // 실제 device_models 테이블의 ID
  }> = [];

  (deviceModels || []).forEach(model => {
    // deviceName이 없는 모델은 건너뛰기
    if (!model.deviceName) {
      console.warn('DeviceModel with missing deviceName:', model);
      return;
    }
    
    (model.supportedStorage || []).forEach((storage: StorageCode) => {
      combinations.push({
        id: `${model.id}-${storage}`,
        name: model.deviceName,
        storage: storage,
        brand: model.manufacturer === 'SAMSUNG' ? 'samsung' : 'apple',
        manufacturer: model.manufacturer,
        deviceModelId: model.id // 실제 device_models 테이블의 ID
      });
    });
  });

  return combinations;
};

const CARRIERS = ['KT', 'SKT', 'LG_U_PLUS'];
const CONDITIONS = ['번호이동', '기기변경'];

// 통신사 표시명 매핑
const CARRIER_DISPLAY_NAMES = {
  'KT': 'KT',
  'SKT': 'SKT', 
  'LG_U_PLUS': 'LGU+'
};

interface ProductTableData {
  [modelId: string]: {
    [carrier: string]: {
      [condition: string]: {
        price: number | string | '';
        additionalConditions: AdditionalConditionKey[];
      };
    };
  };
}

interface CellPosition {
  modelId: string;
  carrier: string;
  condition: string;
}

interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}

interface ClipboardData {
  data: ProductTableData;
  range: SelectionRange;
}

interface ProductTableEditorProps {
  onSave: (products: any[]) => void;
  onCancel: () => void;
  existingProducts?: any[];
  editingProducts?: any[];
  mode?: 'bulk' | 'edit';
  tableInfo?: {
    id: string;
    name: string;
    exposureStartDate: string;
    exposureEndDate: string;
  };
}

export default function ProductTableEditor({
  onSave,
  onCancel,
  existingProducts = [],
  editingProducts = [],
  mode = 'bulk',
  tableInfo
}: ProductTableEditorProps) {
  // UI 상태 관리용 - 사용자 입력 데이터를 임시 저장
  const [tableData, setTableData] = useState<ProductTableData>({});
  const [activeTab, setActiveTab] = useState<'samsung' | 'apple'>('samsung');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{modelId: string, carrier: string, condition: string} | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [modelCombinations, setModelCombinations] = useState<Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
  }>>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [copyPositions, setCopyPositions] = useState<Record<string, { insertAfter: string }>>({});
  const [exposureStartDate, setExposureStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [exposureEndDate, setExposureEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [tableName, setTableName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  
  // Excel 기능을 위한 상태들
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<CellPosition | null>(null);
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  
  // refs
  const tableRef = useRef<HTMLTableElement>(null);
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());

  // Excel 기능 유틸리티 함수들
  const getCellKey = (modelId: string, carrier: string, condition: string) => {
    return `${modelId}-${carrier}-${condition}`;
  };

  const parseCellKey = (cellKey: string): CellPosition => {
    const parts = cellKey.split('-');
    // modelId는 복사본 ID를 포함할 수 있으므로 더 정확하게 파싱
    if (parts.length >= 3) {
      const condition = parts[parts.length - 1];
      const carrier = parts[parts.length - 2];
      const modelId = parts.slice(0, -2).join('-');
      return { modelId, carrier, condition };
    }
    return { modelId: parts[0] || '', carrier: parts[1] || '', condition: parts[2] || '' };
  };

  const getCellPosition = (modelId: string, carrier: string, condition: string): { row: number; col: number } => {
    const modelIndex = allModels.findIndex(m => m.id === modelId);
    const carrierIndex = CARRIERS.indexOf(carrier);
    const conditionIndex = CONDITIONS.indexOf(condition);
    return {
      row: modelIndex,
      col: carrierIndex * 2 + conditionIndex + 2 // +2 for checkbox and model info columns
    };
  };

  const getCellFromPosition = (row: number, col: number): CellPosition | null => {
    if (row < 0 || row >= allModels.length) return null;
    if (col < 2) return null; // Skip checkbox and model info columns
    
    const model = allModels[row];
    const adjustedCol = col - 2;
    const carrierIndex = Math.floor(adjustedCol / 2);
    const conditionIndex = adjustedCol % 2;
    
    if (carrierIndex >= CARRIERS.length || conditionIndex >= CONDITIONS.length) return null;
    
    return {
      modelId: model.id,
      carrier: CARRIERS[carrierIndex],
      condition: CONDITIONS[conditionIndex]
    };
  };

  const isCellInRange = (cell: CellPosition, range: SelectionRange): boolean => {
    const cellPos = getCellPosition(cell.modelId, cell.carrier, cell.condition);
    const startPos = getCellPosition(range.start.modelId, range.start.carrier, range.start.condition);
    const endPos = getCellPosition(range.end.modelId, range.end.carrier, range.end.condition);
    
    const minRow = Math.min(startPos.row, endPos.row);
    const maxRow = Math.max(startPos.row, endPos.row);
    const minCol = Math.min(startPos.col, endPos.col);
    const maxCol = Math.max(startPos.col, endPos.col);
    
    return cellPos.row >= minRow && cellPos.row <= maxRow && 
           cellPos.col >= minCol && cellPos.col <= maxCol;
  };

  const getRangeCells = (range: SelectionRange): CellPosition[] => {
    const cells: CellPosition[] = [];
    const startPos = getCellPosition(range.start.modelId, range.start.carrier, range.start.condition);
    const endPos = getCellPosition(range.end.modelId, range.end.carrier, range.end.condition);
    
    const minRow = Math.min(startPos.row, endPos.row);
    const maxRow = Math.max(startPos.row, endPos.row);
    const minCol = Math.min(startPos.col, endPos.col);
    const maxCol = Math.max(startPos.col, endPos.col);
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = getCellFromPosition(row, col);
        if (cell) cells.push(cell);
      }
    }
    
    return cells;
  };

  // 셀 선택 관련 함수들
  const selectCell = (cell: CellPosition, addToSelection: boolean = false, focusInput: boolean = false) => {
    const cellKey = getCellKey(cell.modelId, cell.carrier, cell.condition);
    
    if (addToSelection) {
      setSelectedCells(prev => new Set([...prev, cellKey]));
    } else {
      setSelectedCells(new Set([cellKey]));
      setSelectionRange({ start: cell, end: cell });
    }
    setFocusedCell(cell);
    
    // 입력 필드에 포커스가 필요한 경우
    if (focusInput) {
      setTimeout(() => {
        const cellElement = cellRefs.current.get(cellKey);
        if (cellElement) {
          const inputElement = cellElement.querySelector('input');
          if (inputElement) {
            inputElement.focus();
            inputElement.select(); // 텍스트 전체 선택
          }
        }
      }, 0);
    }
  };

  const selectRange = (start: CellPosition, end: CellPosition) => {
    const range = { start, end };
    setSelectionRange(range);
    
    const cells = getRangeCells(range);
    const cellKeys = cells.map(cell => getCellKey(cell.modelId, cell.carrier, cell.condition));
    setSelectedCells(new Set(cellKeys));
    setFocusedCell(end);
  };

  const clearSelection = () => {
    setSelectedCells(new Set());
    setSelectionRange(null);
    setFocusedCell(null);
  };

  // 드래그 관련 함수들
  const handleCellMouseDown = (e: React.MouseEvent, cell: CellPosition) => {
    // 입력 필드나 버튼이 아닌 경우에만 preventDefault
    const target = e.target as HTMLElement;
    const isInput = target.tagName.toLowerCase().includes('input');
    const isButton = target.tagName.toLowerCase().includes('button') || target.closest('button');
    
    if (!isInput && !isButton) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+클릭: 다중 선택
      selectCell(cell, true);
    } else if (e.shiftKey && focusedCell) {
      // Shift+클릭: 범위 선택
      selectRange(focusedCell, cell);
    } else {
      // 일반 클릭: 단일 선택
      selectCell(cell);
    }
    
    // 입력 필드가 아닌 경우에만 드래그 시작
    if (!isInput && !isButton) {
      setIsSelecting(true);
      setDragStartCell(cell);
    }
  };

  const handleCellMouseEnter = (cell: CellPosition) => {
    if (isSelecting && dragStartCell) {
      selectRange(dragStartCell, cell);
    }
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
    setDragStartCell(null);
  };


  // 복사/붙여넣기 함수들
  const copySelectedCells = useCallback(() => {
    if (selectedCells.size === 0) {
      return;
    }
    
    const copiedData: ProductTableData = {};
    const cells = Array.from(selectedCells).map(parseCellKey);
    
    cells.forEach(cell => {
      const data = tableData[cell.modelId]?.[cell.carrier]?.[cell.condition];
      if (data) {
        if (!copiedData[cell.modelId]) {
          copiedData[cell.modelId] = {};
        }
        if (!copiedData[cell.modelId][cell.carrier]) {
          copiedData[cell.modelId][cell.carrier] = {};
        }
        copiedData[cell.modelId][cell.carrier][cell.condition] = { 
          price: data.price,
          additionalConditions: [...data.additionalConditions]
        };
      }
    });
    
    if (selectionRange) {
      setClipboardData({
        data: copiedData,
        range: selectionRange
      });
    }
  }, [selectedCells, selectionRange, tableData]);

  const pasteToSelectedCells = useCallback(() => {
    if (!clipboardData || selectedCells.size === 0) {
      return;
    }
    
    const targetCells = Array.from(selectedCells).map(parseCellKey);
    const sourceCells = getRangeCells(clipboardData.range);
    
    // 복사된 영역의 크기 계산
    const sourceStartPos = getCellPosition(clipboardData.range.start.modelId, clipboardData.range.start.carrier, clipboardData.range.start.condition);
    const sourceEndPos = getCellPosition(clipboardData.range.end.modelId, clipboardData.range.end.carrier, clipboardData.range.end.condition);
    
    const sourceWidth = Math.abs(sourceEndPos.col - sourceStartPos.col) + 1;
    const sourceHeight = Math.abs(sourceEndPos.row - sourceStartPos.row) + 1;
    
    // 범위 붙여넣기: 복사된 영역 크기만큼 붙여넣기
    // 시작점은 선택된 영역의 첫 번째 셀 (드래그 시작점)
    const startTarget = targetCells[0]; // 드래그 시작점
    const startTargetPos = getCellPosition(startTarget.modelId, startTarget.carrier, startTarget.condition);
    
    // 복사된 영역의 모든 셀을 순회하면서 붙여넣기
    for (let row = 0; row < sourceHeight; row++) {
      for (let col = 0; col < sourceWidth; col++) {
        const sourceRow = Math.min(sourceStartPos.row, sourceEndPos.row) + row;
        const sourceCol = Math.min(sourceStartPos.col, sourceEndPos.col) + col;
        const targetRow = startTargetPos.row + row;
        const targetCol = startTargetPos.col + col;
        
        // 소스 셀 찾기 (복사된 데이터에서)
        const sourceCell = getCellFromPosition(sourceRow, sourceCol);
        
        if (sourceCell) {
          const sourceData = clipboardData.data[sourceCell.modelId]?.[sourceCell.carrier]?.[sourceCell.condition];
          
          if (sourceData) {
            // 타겟 셀 찾기 (붙여넣기할 위치)
            const targetCell = getCellFromPosition(targetRow, targetCol);
            
            if (targetCell) {
              // 가격 설정
              handlePriceChange(
                targetCell.modelId,
                targetCell.carrier,
                targetCell.condition,
                sourceData.price
              );
              
              // 기존 추가 조건 모두 제거
              const currentData = tableData[targetCell.modelId]?.[targetCell.carrier]?.[targetCell.condition];
              if (currentData) {
                currentData.additionalConditions.forEach(condition => {
                  handleAdditionalConditionChange(
                    targetCell.modelId,
                    targetCell.carrier,
                    targetCell.condition,
                    condition,
                    false
                  );
                });
              }
              
              // 새로운 추가 조건 설정
              sourceData.additionalConditions.forEach(condition => {
                handleAdditionalConditionChange(
                  targetCell.modelId,
                  targetCell.carrier,
                  targetCell.condition,
                  condition,
                  true
                );
              });
            }
          }
        }
      }
    }
  }, [clipboardData, selectedCells, tableData]);


  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // 단말기 데이터 로드
  useEffect(() => {
    const loadDeviceModels = async () => {
      try {
        const models = await getAllDeviceModels();
        setDeviceModels(models);
        const combinations = generateModelStorageCombinations(models);
        setModelCombinations(combinations);
        // 모든 모델+용량 조합을 기본 선택
        const allCombinations: string[] = [];
        if (models && Array.isArray(models)) {
          models.forEach(model => {
            if (model.supportedStorage) {
              model.supportedStorage.forEach((storage: StorageCode) => {
                allCombinations.push(`${model.id}-${storage}`);
              });
            }
          });
        }
        setSelectedCombinations(allCombinations);
        
        // 모든 모델을 기본 선택
        const allModelIds = new Set((combinations || []).map(combo => combo.id));
        setSelectedModels(allModelIds);
      } catch (error) {
        console.error('단말기 데이터 로드 실패:', error);
      }
    };
    
    loadDeviceModels();
  }, []);

  // 테이블 정보 설정 (편집 모드)
  useEffect(() => {
    if (tableInfo && mode === 'edit') {
      setTableName(tableInfo.name);
      setExposureStartDate(tableInfo.exposureStartDate);
      setExposureEndDate(tableInfo.exposureEndDate);
    }
  }, [tableInfo, mode]);

  // 기존 상품 데이터를 테이블 형태로 변환
  useEffect(() => {
    const initialData: ProductTableData = {};
    
    // 기존 상품들을 테이블 데이터로 변환
    existingProducts.forEach(product => {
      // 안전한 접근을 위한 null 체크 (deviceName 사용)
      if (!product.deviceName || !product.storage || !product.carrier) {
        console.warn('상품 데이터에 필수 필드가 누락되었습니다:', product);
        return;
      }
      
      // modelCombinations의 ID 형식과 일치하도록 수정: ${deviceModelId}-${storage}
      const modelId = `${product.device_model_id}-${product.storage}`;
      const carrier = product.carrier;
      const condition = product.conditions?.includes('번호이동') ? '번호이동' : '기기변경';
      
      if (!initialData[modelId]) {
        initialData[modelId] = {};
      }
      if (!initialData[modelId][carrier]) {
        initialData[modelId][carrier] = {};
      }
      
      // 추가 조건들을 추출 (기존 conditions에서 기본 조건 제외)
      const additionalConditionTexts = product.conditions.filter((c: string) => 
        !['번호이동', '기기변경'].includes(c)
      );
      const additionalConditions = convertTextsToKeys(additionalConditionTexts);
      
      initialData[modelId][carrier][condition] = {
        price: product.price,
        additionalConditions: additionalConditions
      };
    });
    
    setTableData(initialData);
  }, [existingProducts]);

  // 선택된 모델들이 변경될 때 tableData 초기화
  useEffect(() => {
    const filteredModels = (modelCombinations || []).filter(model => {
      const isBrandMatch = activeTab === 'samsung' ? model.brand === 'samsung' : model.brand === 'apple';
      const isSelected = selectedCombinations.includes(model.id);
      return isBrandMatch && isSelected;
    });

    const newTableData = { ...tableData };
    let hasChanges = false;

    filteredModels.forEach(model => {
      if (!newTableData[model.id]) {
        newTableData[model.id] = {};
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setTableData(newTableData);
    }
  }, [selectedCombinations, activeTab, modelCombinations]);

  const handlePriceChange = (modelId: string, carrier: string, condition: string, value: number | string) => {
    // 빈 문자열, - 기호, 또는 숫자 값을 그대로 저장 (음수 포함)
    const numericValue = value === '' || value === '-' ? value : (typeof value === 'number' ? value : parseFloat(value));
    
    setTableData(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [carrier]: {
          ...prev[modelId]?.[carrier],
          [condition]: {
            price: numericValue,
            additionalConditions: prev[modelId]?.[carrier]?.[condition]?.additionalConditions || []
          }
        }
      }
    }));

    // 에러 제거
    const errorKey = `${modelId}-${carrier}-${condition}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleAdditionalConditionChange = (modelId: string, carrier: string, condition: string, additionalCondition: AdditionalConditionKey, checked: boolean) => {
    setTableData(prev => {
      const currentData = prev[modelId]?.[carrier]?.[condition];
      const currentConditions = currentData?.additionalConditions || [];
      
      const newConditions = checked
        ? [...currentConditions, additionalCondition]
        : currentConditions.filter(c => c !== additionalCondition);
      
      return {
        ...prev,
        [modelId]: {
          ...prev[modelId],
          [carrier]: {
            ...prev[modelId]?.[carrier],
            [condition]: {
              price: currentData?.price || '',
              additionalConditions: newConditions
            }
          }
        }
      };
    });
  };

  const formatPrice = (value: number | string | '') => {
    if (value === '' || value === '-') return value;
    // 원 단위를 만원 단위로 변환하여 표시 (음수 포함)
    if (typeof value === 'number') {
      const result = Math.trunc(value / 10000);
      return result.toString();
    }
    return value;
  };

  const parsePrice = (value: string) => {
    // 만원 단위 입력을 원 단위로 변환 (음수 허용, 3자리수 제한)
    if (value === '' || value === '-') return '';
    
    // 숫자와 음수 기호만 허용
    const cleanValue = value.replace(/[^0-9-]/g, '');
    
    // 음수 기호가 맨 앞이 아니면 제거
    if (cleanValue.indexOf('-') > 0) {
      const withoutMinus = cleanValue.replace(/-/g, '');
      return withoutMinus === '' ? '' : parseInt(withoutMinus) * 10000;
    }
    
    // 음수 기호가 여러 개면 첫 번째만 유지
    if (cleanValue.startsWith('-')) {
      const withoutExtraMinus = '-' + cleanValue.substring(1).replace(/-/g, '');
      const numValue = parseInt(withoutExtraMinus);
      if (isNaN(numValue)) return '';
      
      // 3자리수 제한 (-999 ~ 999)
      const clampedValue = Math.max(-999, Math.min(999, numValue));
      return clampedValue * 10000;
    } else {
      const numValue = parseInt(cleanValue);
      if (isNaN(numValue)) return '';
      
      // 3자리수 제한 (0 ~ 999)
      const clampedValue = Math.max(0, Math.min(999, numValue));
      return clampedValue * 10000;
    }
  };

  const copyRow = (modelId: string) => {
    // 원본 모델 ID 찾기 (복사된 모델인 경우 원본 ID로 변환)
    const originalModelId = modelId.replace(/-copy-\d+$/, '');
    const model = (modelCombinations || []).find(m => m.id === originalModelId);
    if (!model) {
      return;
    }

    const newModelId = `${originalModelId}-copy-${Date.now()}`;
    
    // 데이터 복사 (기존 데이터가 있으면 복사, 없으면 빈 구조 생성)
    const copiedData: ProductTableData = {};
    CARRIERS.forEach(carrier => {
      CONDITIONS.forEach(condition => {
        const originalData = tableData[modelId]?.[carrier]?.[condition];
        if (originalData) {
          if (!copiedData[newModelId]) {
            copiedData[newModelId] = {};
          }
          if (!copiedData[newModelId][carrier]) {
            copiedData[newModelId][carrier] = {};
          }
          copiedData[newModelId][carrier][condition] = { ...originalData };
        } else {
          // 기존 데이터가 없어도 빈 구조 생성
          if (!copiedData[newModelId]) {
            copiedData[newModelId] = {};
          }
          if (!copiedData[newModelId][carrier]) {
            copiedData[newModelId][carrier] = {};
          }
          copiedData[newModelId][carrier][condition] = {
            price: '',
            additionalConditions: []
          };
        }
      });
    });

    // 복사본의 위치 정보를 별도 상태에 저장
    setCopyPositions(prev => ({
      ...prev,
      [newModelId]: {
        insertAfter: modelId // 현재 선택된 행 바로 아래에 삽입
      }
    }));

    console.log('=== copyRow 실행 ===');
    console.log('복사할 모델 ID:', modelId);
    console.log('새로운 모델 ID:', newModelId);
    console.log('insertAfter:', modelId);

    setTableData(prev => ({
      ...prev,
      ...copiedData
    }));
  };

  const deleteRow = (modelId: string) => {
    console.log('Deleting row:', modelId);
    
    // tableData에서 해당 행 삭제
    setTableData(prev => {
      const newData = { ...prev };
      delete newData[modelId];
      return newData;
    });
    
    // copyPositions에서도 해당 행 삭제
    setCopyPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[modelId];
      return newPositions;
    });
    
    // selectedCombinations에서도 해당 모델 제거 (복사본인 경우 원본 ID로 변환하여 제거)
    setSelectedCombinations(prev => {
      const originalModelId = modelId.replace(/-copy-\d+$/, '');
      const newCombinations = prev.filter(combo => {
        // 복사본인 경우 원본 ID와 비교하여 제거
        if (modelId.includes('-copy-')) {
          return combo !== originalModelId;
        }
        // 원본인 경우 직접 비교하여 제거
        return combo !== modelId;
      });
      console.log('Updated selectedCombinations after single delete:', newCombinations);
      return newCombinations;
    });
    
    // 선택된 행에서도 제거
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(modelId);
      return newSet;
    });
  };

  // 체크박스 관련 함수들
  const toggleRowSelection = (modelId: string) => {
    console.log('Toggling row selection for:', modelId);
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      console.log('New selected rows:', Array.from(newSet));
      return newSet;
    });
  };

  const toggleAllRowsSelection = () => {
    const allModelIds = allModels.map(model => model.id);
    const allSelected = allModelIds.every(id => selectedRows.has(id));
    
    console.log('Toggle all rows - allModelIds:', allModelIds);
    console.log('Toggle all rows - allSelected:', allSelected);
    
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(allModelIds));
    }
  };

  const deleteSelectedRows = () => {
    console.log('Deleting selected rows:', Array.from(selectedRows));
    console.log('Current tableData keys:', Object.keys(tableData));
    
    // tableData에서 선택된 행들 삭제
    setTableData(prev => {
      const newData = { ...prev };
      selectedRows.forEach(modelId => {
        console.log('Deleting modelId:', modelId, 'exists:', modelId in newData);
        delete newData[modelId];
      });
      return newData;
    });
    
    // selectedCombinations에서도 해당 모델들 제거 (복사본인 경우 원본 ID로 변환하여 제거)
    setSelectedCombinations(prev => {
      const newCombinations = prev.filter(combo => {
        // 선택된 행들 중에서 해당 조합이 포함되지 않은 것만 유지
        return !Array.from(selectedRows).some(modelId => {
          const originalModelId = modelId.replace(/-copy-\d+$/, '');
          // 복사본인 경우 원본 ID와 비교
          if (modelId.includes('-copy-')) {
            return combo === originalModelId;
          }
          // 원본인 경우 직접 비교
          return combo === modelId;
        });
      });
      console.log('Updated selectedCombinations:', newCombinations);
      return newCombinations;
    });
    
    setSelectedRows(new Set());
  };


  const openConditionModal = (modelId: string, carrier: string, condition: string) => {
    setSelectedCell({ modelId, carrier, condition });
    setShowConditionModal(true);
  };

  const closeConditionModal = () => {
    setShowConditionModal(false);
    setSelectedCell(null);
  };

  const validateData = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 테이블명 검증
    if (!tableName.trim()) {
      newErrors['tableName'] = '테이블명을 입력해주세요';
    }
    
    // 유효성 검사 제거 - 모든 가격 입력 허용
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    // 데이터 초기화
    setTableData({});
    setSelectedRows(new Set());
    setTableName('');
    setExposureStartDate('');
    setExposureEndDate('');
    setErrors({});
    setSaveError('');
    
    // 부모 컴포넌트에 취소 알림
    onCancel();
  };

  const handleSave = async () => {
    if (!validateData()) {
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // 로그인 상태 확인
      const user = await getCurrentUser();
      
      if (!user) {
        setSaveError('로그인이 필요합니다. 페이지를 새로고침해주세요.');
        return;
      }

      // 현재 사용자의 스토어 ID 가져오기
      const { data: storeInfo, error: storeError } = await getCurrentUserStore();
      
      if (storeError || !storeInfo) {
        setSaveError('스토어 정보를 불러올 수 없습니다. 스토어 등록을 먼저 완료해주세요.');
        return;
      }

      // tableData를 products 배열로 변환 (API 전송용)
      const products: any[] = [];
      
      Object.keys(tableData).forEach(modelId => {
        // 복사된 모델인 경우 원본 모델 찾기
        const originalModelId = modelId.replace(/-copy-\d+$/, '');
        const model = (modelCombinations || []).find(m => m.id === originalModelId) as {
          id: string;
          name: string;
          storage: StorageCode;
          brand: 'samsung' | 'apple';
          manufacturer: string;
          deviceModelId: string;
        };
        if (!model) return;
        
        // 실제 device_models 테이블의 ID 사용
        const actualDeviceModelId = model.deviceModelId;
        
        Object.keys(tableData[modelId]).forEach(carrier => {
          Object.keys(tableData[modelId][carrier]).forEach(condition => {
            const data = tableData[modelId][carrier][condition];
            const price = data?.price;
            const additionalConditions = data?.additionalConditions || [];
            const conditionTexts = convertKeysToTexts(additionalConditions);
            
            if (price !== '' && price !== 0) {
              // carrier 값을 데이터베이스 형식으로 변환
              const dbCarrier = carrier === 'LGU+' ? 'LG_U_PLUS' : carrier;
              
              products.push({
                storeId: storeInfo.id, // 실제 스토어 ID 사용
                deviceModelId: actualDeviceModelId,
                carrier: dbCarrier,
                storage: model.storage,
                price: price,
                conditions: [condition, ...conditionTexts],
                isActive: true,
                exposureStartDate: exposureStartDate,
                exposureEndDate: exposureEndDate
              });
            }
          });
        });
      });

      if (products.length === 0) {
        setSaveError('저장할 상품이 없습니다.');
        return;
      }

      // 1. product_tables 테이블에 레코드 생성 또는 수정
      if (mode === 'edit' && tableInfo?.id) {
        // 편집 모드: 기존 테이블 업데이트
        const { updateProductTable } = await import('@/lib/api/productTables');
        await updateProductTable(tableInfo.id, {
          name: tableName,
          exposureStartDate: exposureStartDate,
          exposureEndDate: exposureEndDate,
          products: products // API용 products 배열만 전송
        });
      } else {
        // 생성 모드: 새 테이블 생성
        const { createProductTable } = await import('@/lib/api/productTables');
        const tableResult = await createProductTable({
          name: tableName,
          exposureStartDate: exposureStartDate,
          exposureEndDate: exposureEndDate,
          products: products // API용 products 배열만 전송
        });

        if (!tableResult.success) {
          setSaveError(tableResult.error || '가격표 생성에 실패했습니다.');
          return;
        }
      }

      // 성공 시 부모 컴포넌트에 저장된 상품 정보 전달
      onSave(products);
    } catch (error) {
      console.error('상품 저장 오류:', error);
      setSaveError(error instanceof Error ? error.message : '상품 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredModels = (modelCombinations || []).filter(model => {
    const isBrandMatch = activeTab === 'samsung' ? model.brand === 'samsung' : model.brand === 'apple';
    const isSelected = selectedCombinations.includes(model.id);
    return isBrandMatch && isSelected;
  }) as Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string;
  }>;

  // 선택된 모델과 복사본을 올바른 순서로 배치
  const allModels: Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string;
    originalId?: string;
    timestamp?: number;
  }> = [];
  
  // 먼저 선택된 모델들을 추가
  filteredModels.forEach(model => {
    allModels.push(model);
  });
  
  // 복사본들을 allModels에 추가 (원본 모델 바로 아래에 삽입)
  const copiedModels: Array<{
    id: string;
    name: string;
    storage: StorageCode;
    brand: 'samsung' | 'apple';
    manufacturer: string;
    deviceModelId: string;
    originalId?: string;
    timestamp?: number;
    insertAfter?: string; // 바로 앞에 위치해야 할 모델 ID
  }> = [];
  
  Object.keys(tableData || {}).forEach(modelId => {
    if (modelId.includes('-copy-')) {
      // 원본 모델 찾기
      const originalModelId = modelId.replace(/-copy-\d+$/, '');
      const model = (modelCombinations || []).find(m => m.id === originalModelId) as {
        id: string;
        name: string;
        storage: StorageCode;
        brand: 'samsung' | 'apple';
        manufacturer: string;
        deviceModelId: string;
      };
      if (model) {
        // 위치 정보 확인 (copyPositions 상태에서 읽기)
        const positionInfo = copyPositions[modelId];
        const insertAfter = positionInfo?.insertAfter || originalModelId;
        
        copiedModels.push({
          ...model,
          id: modelId,
          originalId: originalModelId,
          timestamp: parseInt(modelId.split('-copy-')[1]) || 0,
          insertAfter: insertAfter // 저장된 위치 정보 사용
        });
      }
    }
  });
  
  // 완전히 새로운 접근법: tableData의 _position 정보를 직접 사용
  const finalModels: typeof allModels = [];
  const processedIds = new Set<string>();
  
  // 원본 모델들을 먼저 추가
  filteredModels.forEach(model => {
    finalModels.push({
      id: model.id,
      name: model.name,
      storage: model.storage,
      brand: model.brand,
      manufacturer: model.manufacturer,
      deviceModelId: model.deviceModelId
    });
    processedIds.add(model.id);
  });
  
  // 복사본들을 insertAfter 정보에 따라 올바른 위치에 삽입
  const insertCopyAtPosition = (copyId: string) => {
    if (processedIds.has(copyId)) return;
    
    const copy = copiedModels.find(c => c.id === copyId);
    if (!copy) return;
    
    // insertAfter 모델의 위치를 찾기
    const insertAfterIndex = finalModels.findIndex(m => m.id === copy.insertAfter);
    if (insertAfterIndex === -1) return;
    
    // insertAfter 모델 바로 다음에 삽입
    const insertIndex = insertAfterIndex + 1;
    
    finalModels.splice(insertIndex, 0, {
      id: copy.id,
      name: copy.name,
      storage: copy.storage,
      brand: copy.brand,
      manufacturer: copy.manufacturer,
      deviceModelId: copy.deviceModelId,
      originalId: copy.originalId,
      timestamp: copy.timestamp
    });
    
    processedIds.add(copyId);
    
    // 이 복사본의 하위 복사본들도 처리
    const subCopies = copiedModels
      .filter(subCopy => subCopy.insertAfter === copyId)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    subCopies.forEach(subCopy => {
      insertCopyAtPosition(subCopy.id);
    });
  };
  
  // 모든 복사본들을 처리
  copiedModels
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    .forEach(copy => {
      insertCopyAtPosition(copy.id);
    });
  
  // 디버깅을 위한 로그
  console.log('=== copyRow 디버깅 ===');
  console.log('copiedModels:', copiedModels.map(c => ({ id: c.id, insertAfter: c.insertAfter, timestamp: c.timestamp })));
  console.log('finalModels:', finalModels.map(m => ({ id: m.id })));
  
  // allModels를 finalModels로 교체
  allModels.length = 0;
  allModels.push(...finalModels);

  // 전체 모델(삼성+애플)을 기반으로 개수 계산
  const getAllModelsWithCopies = () => {
    const allModelsWithCopies: Array<{
      id: string;
      name: string;
      storage: StorageCode;
      brand: 'samsung' | 'apple';
      manufacturer: string;
      deviceModelId: string;
      originalId?: string;
      timestamp?: number;
    }> = [];
    
    // 모든 선택된 모델 조합을 기반으로 생성
    (modelCombinations || []).forEach(model => {
      if (selectedCombinations.includes(model.id)) {
        allModelsWithCopies.push({
          id: model.id,
          name: model.name,
          storage: model.storage,
          brand: model.brand,
          manufacturer: model.manufacturer,
          deviceModelId: (model as any).deviceModelId || model.id
        });
      }
    });
    
    // 복사본들 추가
    Object.keys(tableData || {}).forEach(modelId => {
      if (modelId.includes('-copy-')) {
        const originalModelId = modelId.replace(/-copy-\d+$/, '');
        const model = (modelCombinations || []).find(m => m.id === originalModelId);
        if (model) {
          allModelsWithCopies.push({
            id: modelId,
            name: model.name,
            storage: model.storage,
            brand: model.brand,
            manufacturer: model.manufacturer,
            deviceModelId: (model as any).deviceModelId || model.id,
            originalId: originalModelId,
            timestamp: parseInt(modelId.split('-copy-')[1]) || 0
          });
        }
      }
    });
    
    return allModelsWithCopies;
  };

  const allModelsWithCopies = getAllModelsWithCopies();
  
  // 현재 활성 탭의 총 행 개수 계산 (원본 + 복사본)
  const currentTabRowCount = allModels.length;
  
  // 삼성/애플 전체 행 개수 계산 (복사본 포함)
  const samsungRowCount = allModelsWithCopies.filter(model => model.brand === 'samsung').length;
  const appleRowCount = allModelsWithCopies.filter(model => model.brand === 'apple').length;

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('키보드 이벤트:', e.key, 'ctrl:', e.ctrlKey, 'meta:', e.metaKey);
      
      // Ctrl+C: 복사
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        console.log('Ctrl+C 감지됨 - copySelectedCells 호출 시작');
        e.preventDefault();
        e.stopPropagation();
        
        // 직접 복사 로직 실행
        console.log('🚀 === copySelectedCells 함수 호출됨 ===');
        console.log('selectedCells.size:', selectedCells.size);
        console.log('selectedCells:', Array.from(selectedCells));
        
        if (selectedCells.size === 0) {
          console.log('❌ 복사 실패: 선택된 셀이 없음');
          return;
        }
        
        console.log('✅ 선택된 셀이 있음 - 복사 진행');
        
        // 디버깅용 함수
        const debugTableData = () => {
          console.log('=== tableData 디버깅 ===');
          console.log('tableData 전체:', tableData);
          console.log('tableData 키들:', Object.keys(tableData));
          Object.keys(tableData).forEach(modelId => {
            console.log(`${modelId}:`, tableData[modelId]);
            Object.keys(tableData[modelId] || {}).forEach(carrier => {
              console.log(`  ${carrier}:`, tableData[modelId][carrier]);
              Object.keys(tableData[modelId][carrier] || {}).forEach(condition => {
                console.log(`    ${condition}:`, tableData[modelId][carrier][condition]);
              });
            });
          });
          console.log('=== 디버깅 끝 ===');
        };
        
        debugTableData();
        console.log('선택된 셀들:', Array.from(selectedCells));
        
        const copiedData: ProductTableData = {};
        const cells = Array.from(selectedCells).map(parseCellKey);
        
        cells.forEach(cell => {
          console.log(`셀 파싱 결과:`, cell);
          console.log(`tableData에서 찾는 키: ${cell.modelId}-${cell.carrier}-${cell.condition}`);
          console.log(`tableData[${cell.modelId}]:`, tableData[cell.modelId]);
          console.log(`tableData[${cell.modelId}]?.[${cell.carrier}]:`, tableData[cell.modelId]?.[cell.carrier]);
          console.log(`최종 데이터:`, tableData[cell.modelId]?.[cell.carrier]?.[cell.condition]);
          
          const data = tableData[cell.modelId]?.[cell.carrier]?.[cell.condition];
          if (data) {
            if (!copiedData[cell.modelId]) {
              copiedData[cell.modelId] = {};
            }
            if (!copiedData[cell.modelId][cell.carrier]) {
              copiedData[cell.modelId][cell.carrier] = {};
            }
            copiedData[cell.modelId][cell.carrier][cell.condition] = { 
              price: data.price,
              additionalConditions: [...data.additionalConditions]
            };
            console.log(`복사됨: ${cell.modelId}-${cell.carrier}-${cell.condition}`, data);
          } else {
            console.log(`데이터 없음: ${cell.modelId}-${cell.carrier}-${cell.condition}`);
            console.log(`tableData의 모든 키들:`, Object.keys(tableData));
            if (tableData[cell.modelId]) {
              console.log(`${cell.modelId}의 모든 carrier들:`, Object.keys(tableData[cell.modelId]));
            }
          }
        });
        
        if (selectionRange) {
          setClipboardData({
            data: copiedData,
            range: selectionRange
          });
          console.log('최종 복사된 데이터:', copiedData);
        }
        
        console.log('Ctrl+C - copySelectedCells 호출 완료');
        return;
      }
      
      // Ctrl+V: 붙여넣기
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteToSelectedCells();
        return;
      }
      
      // Ctrl+A: 전체 선택
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const allCells: CellPosition[] = [];
        allModels.forEach(model => {
          CARRIERS.forEach(carrier => {
            CONDITIONS.forEach(condition => {
              allCells.push({ modelId: model.id, carrier, condition });
            });
          });
        });
        
        if (allCells.length > 0) {
          const cellKeys = allCells.map(cell => getCellKey(cell.modelId, cell.carrier, cell.condition));
          setSelectedCells(new Set(cellKeys));
          setSelectionRange({ start: allCells[0], end: allCells[allCells.length - 1] });
        }
        return;
      }
      
      // Escape: 선택 해제
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }
      
      // 엔터키: 아래 셀로 이동
      if (e.key === 'Enter' && focusedCell) {
        e.preventDefault();
        
        const currentPos = getCellPosition(focusedCell.modelId, focusedCell.carrier, focusedCell.condition);
        const newRow = Math.min(allModels.length - 1, currentPos.row + 1);
        const newCol = currentPos.col;
        
        const newCell = getCellFromPosition(newRow, newCol);
        if (newCell) {
          selectCell(newCell, false, true);
        }
        return;
      }
      
      // Tab키: 오른쪽 셀로 이동
      if (e.key === 'Tab' && focusedCell) {
        e.preventDefault();
        
        const currentPos = getCellPosition(focusedCell.modelId, focusedCell.carrier, focusedCell.condition);
        let newRow = currentPos.row;
        let newCol = currentPos.col;
        
        if (e.shiftKey) {
          // Shift+Tab: 왼쪽 셀로 이동
          newCol = Math.max(2, currentPos.col - 1);
        } else {
          // Tab: 오른쪽 셀로 이동
          newCol = Math.min(2 + CARRIERS.length * 2 - 1, currentPos.col + 1);
        }
        
        const newCell = getCellFromPosition(newRow, newCol);
        if (newCell) {
          selectCell(newCell, false, true);
        }
        return;
      }
      
      // 화살표 키로 셀 이동
      if (focusedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const currentPos = getCellPosition(focusedCell.modelId, focusedCell.carrier, focusedCell.condition);
        let newRow = currentPos.row;
        let newCol = currentPos.col;
        
        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, currentPos.row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(allModels.length - 1, currentPos.row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(2, currentPos.col - 1); // Skip checkbox and model info columns
            break;
          case 'ArrowRight':
            newCol = Math.min(2 + CARRIERS.length * 2 - 1, currentPos.col + 1);
            break;
        }
        
        const newCell = getCellFromPosition(newRow, newCol);
        if (newCell) {
          if (e.shiftKey) {
            // Shift+화살표: 범위 선택 확장
            if (selectionRange) {
              selectRange(selectionRange.start, newCell);
            } else {
              selectRange(focusedCell, newCell);
            }
          } else {
            // 일반 화살표: 셀 이동 (입력 필드에 포커스)
            selectCell(newCell, false, true);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, selectedCells, selectionRange, allModels, tableData]);

  // 인증 상태 확인 중
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <PageLoadingSpinner text="인증 상태를 확인하는 중..." />
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-yellow-400">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">로그인이 필요합니다</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>상품을 등록하려면 먼저 로그인해주세요.</p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">상품 등록</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowModelModal(true)}>
            단말기 선택
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeviceModelSelectionModal
        open={showModelModal}
        onOpenChange={setShowModelModal}
        onSelectionChange={(selectedCombinations) => {
          // 선택된 모델+용량 조합을 저장
          setSelectedCombinations(selectedCombinations);
          
          // 모델 ID 추출하여 selectedModels 업데이트
          const modelIds = new Set(selectedCombinations.map(combo => combo.split('-')[0]));
          setSelectedModels(modelIds);
          
          // 선택되지 않은 모델들의 tableData 정리
          setTableData(prev => {
            const newData = { ...prev };
            const selectedModelIds = new Set(selectedCombinations);
            
            // 선택되지 않은 모델들의 데이터 제거
            Object.keys(newData).forEach(modelId => {
              const originalModelId = modelId.replace(/-copy-\d+$/, '');
              if (!selectedModelIds.has(originalModelId)) {
                delete newData[modelId];
              }
            });
            
            return newData;
          });
        }}
        selectedCombinations={selectedCombinations}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'samsung' | 'apple')}>
        <TabsList>
          <TabsTrigger value="samsung">삼성 ({samsungRowCount}개)</TabsTrigger>
          <TabsTrigger value="apple">애플 ({appleRowCount}개)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* 테이블명 및 노출기간 설정 */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* 테이블명 입력 */}
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium w-20">테이블명:</Label>
                <div className="flex-1 max-w-md">
                  <Input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="예: 25-09-30 가격표"
                    className={errors['tableName'] ? 'border-red-500' : ''}
                  />
                  {errors['tableName'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['tableName']}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  상품 목록에서 표시될 이름입니다
                </span>
              </div>
              
              {/* 노출기간 설정 */}
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium w-20">노출기간:</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={exposureStartDate}
                    onChange={(e) => {
                      setExposureStartDate(e.target.value);
                      // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
                      if (e.target.value > exposureEndDate) {
                        setExposureEndDate(e.target.value);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-sm border rounded px-2 py-1"
                    placeholder="시작일"
                  />
                  <span className="text-sm text-muted-foreground">~</span>
                  <input
                    type="date"
                    value={exposureEndDate}
                    onChange={(e) => setExposureEndDate(e.target.value)}
                    min={exposureStartDate || new Date().toISOString().split('T')[0]}
                    className="text-sm border rounded px-2 py-1"
                    placeholder="종료일"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  설정한 기간에만 상품이 노출됩니다
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table 
                  ref={tableRef}
                  className="border-collapse w-auto table-auto select-none" 
                  style={{ minWidth: '600px' }}
                  onMouseUp={handleCellMouseUp}
                  onMouseLeave={handleCellMouseUp}
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r w-8 p-0">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={allModels.length > 0 && allModels.every(model => selectedRows.has(model.id))}
                            onCheckedChange={toggleAllRowsSelection}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="border-r text-center" colSpan={2}>
                        모델 정보 ({currentTabRowCount}개)
                      </TableHead>
                      {CARRIERS.map(carrier => (
                        <TableHead key={carrier} colSpan={2} className="text-center border-r last:border-r-0">
                          {CARRIER_DISPLAY_NAMES[carrier as keyof typeof CARRIER_DISPLAY_NAMES]}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableHead className="border-r text-center whitespace-nowrap">
                        {selectedRows.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedRows}
                            className="h-6 px-2 text-xs"
                          >
                            삭제 ({selectedRows.size})
                          </Button>
                        )}
                      </TableHead>
                      <TableHead className="border-r text-center whitespace-nowrap">모델명</TableHead>
                      <TableHead className="border-r text-center whitespace-nowrap">용량</TableHead>
                      {CARRIERS.map(carrier => (
                        <React.Fragment key={carrier}>
                          <TableHead className="text-center text-xs border-r whitespace-nowrap">번호이동</TableHead>
                          <TableHead className="text-center text-xs border-r last:border-r-0 whitespace-nowrap">기기변경</TableHead>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allModels.map(model => {
                      const isCopied = model.id.includes('-copy-');
                      const hasData = CARRIERS.some(carrier => 
                        CONDITIONS.some(condition => {
                          const data = tableData[model.id]?.[carrier]?.[condition];
                          return data && (data.price !== '' || data.additionalConditions.length > 0);
                        })
                      );
                      
                      return (
                        <React.Fragment key={model.id}>
                          <TableRow>
                            <TableCell className="border-r w-8 p-0">
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={selectedRows.has(model.id)}
                                  onCheckedChange={() => toggleRowSelection(model.id)}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium border-r whitespace-nowrap p-1 sm:p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm">{model.name}</span>
                                <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        copyRow(model.id);
                                      }}
                                      title="복사"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    {isCopied && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          deleteRow(model.id);
                                        }}
                                        title="삭제"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center border-r whitespace-nowrap p-1 sm:p-2">
                              <span className="text-sm text-muted-foreground">
                                {STORAGE_LABELS[model.storage as keyof typeof STORAGE_LABELS]}
                              </span>
                            </TableCell>
                            {CARRIERS.map(carrier => (
                              <React.Fragment key={carrier}>
                                {CONDITIONS.map(condition => {
                                  const errorKey = `${model.id}-${carrier}-${condition}`;
                                  const hasError = !!errors[errorKey];
                                  const data = tableData[model.id]?.[carrier]?.[condition];
                                  const isLastCarrier = carrier === CARRIERS[CARRIERS.length - 1];
                                  const isLastCondition = condition === CONDITIONS[CONDITIONS.length - 1];
                                  
                                  const cellKey = getCellKey(model.id, carrier, condition);
                                  const isSelected = selectedCells.has(cellKey);
                                  const isFocused = focusedCell && 
                                    focusedCell.modelId === model.id && 
                                    focusedCell.carrier === carrier && 
                                    focusedCell.condition === condition;
                                  
                                  return (
                                    <TableCell 
                                      key={`${carrier}-${condition}`} 
                                      ref={(el) => {
                                        if (el) cellRefs.current.set(cellKey, el);
                                      }}
                                      className={`p-0.5 sm:p-1 border-r ${isLastCarrier && isLastCondition ? 'border-r-0' : ''} ${
                                        isSelected ? 'bg-blue-100 border-blue-300' : ''
                                      } ${
                                        isFocused ? 'ring-2 ring-blue-500' : ''
                                      } cursor-cell`}
                                      onMouseDown={(e) => handleCellMouseDown(e, { modelId: model.id, carrier, condition })}
                                      onMouseEnter={() => handleCellMouseEnter({ modelId: model.id, carrier, condition })}
                                    >
                                      <div className="space-y-1">
                                        <div className="relative flex items-center">
                                          <input
                                            type="text"
                                            placeholder="0"
                                            value={formatPrice(data?.price || '')}
                                            onFocus={(e) => {
                                              e.stopPropagation();
                                              // 입력 필드 포커스 시 해당 셀 선택
                                              selectCell({ modelId: model.id, carrier, condition });
                                            }}
                                            onClick={(e) => {
                                              // 입력 필드 클릭 시 이벤트 전파 중지
                                              e.stopPropagation();
                                              // 해당 셀 선택
                                              selectCell({ modelId: model.id, carrier, condition });
                                            }}
                                            onChange={(e) => {
                                              e.stopPropagation(); // 이벤트 전파 중지
                                              
                                              let value = e.target.value;
                                              
                                              // 숫자와 음수 기호만 허용
                                              value = value.replace(/[^0-9-]/g, '');
                                              
                                              // 음수 기호가 맨 앞이 아니면 제거
                                              if (value.indexOf('-') > 0) {
                                                value = value.replace(/-/g, '');
                                              }
                                              
                                              // 음수 기호가 여러 개면 첫 번째만 유지
                                              if ((value.match(/-/g) || []).length > 1) {
                                                value = '-' + value.replace(/-/g, '');
                                              }
                                              
                                              // 길이 제한
                                              if (value.startsWith('-')) {
                                                value = value.substring(0, 4); // -999
                                              } else {
                                                value = value.substring(0, 3); // 999
                                              }
                                              
                                              // - 기호만 입력된 경우 임시로 저장
                                              if (value === '-') {
                                                handlePriceChange(model.id, carrier, condition, '-');
                                              } else {
                                                const priceInWon = parsePrice(value);
                                                handlePriceChange(model.id, carrier, condition, priceInWon);
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              e.stopPropagation(); // 키보드 이벤트 전파 중지
                                            }}
                                            className={`w-full text-center text-xs px-1 py-0.5 rounded ${hasError ? 'text-red-500 bg-red-50' : 'bg-transparent hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500'}`}
                                            style={{ 
                                              border: 'none', 
                                              outline: 'none',
                                              boxShadow: 'none',
                                              background: 'transparent'
                                            }}
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openConditionModal(model.id, carrier, condition);
                                            }}
                                            title={data?.additionalConditions && data.additionalConditions.length > 0 ? "조건 수정" : "조건 추가"}
                                          >
                                            <Plus className="h-2 w-2" />
                                          </Button>
                                          {hasError && (
                                            <div className="absolute -bottom-3 left-0 text-xs text-red-500">
                                              {errors[errorKey]}
                                            </div>
                                          )}
                                        </div>
                                        {/* 추가 조건 칩들 */}
                                        {data?.additionalConditions && data.additionalConditions.length > 0 && (
                                          <div className="flex flex-wrap gap-0.5">
                                            {data.additionalConditions.map(condition => (
                                              <Badge key={condition} variant="outline" className="text-xs px-0.5 py-0">
                                                {CONDITION_DISPLAY_NAMES[condition]}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 추가 조건 설정 모달 */}
      <Dialog open={showConditionModal} onOpenChange={setShowConditionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>추가 조건 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCell && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    // allModels에서 모델 정보 찾기 (복사본 포함)
                    const model = allModels.find(m => m.id === selectedCell.modelId);
                    if (model) {
                      return `${model.name} ${model.storage} - ${selectedCell.carrier} - ${selectedCell.condition}`;
                    }
                    // fallback: modelCombinations에서 찾기
                    const fallbackModel = (modelCombinations || []).find(m => m.id === selectedCell.modelId);
                    if (fallbackModel) {
                      return `${fallbackModel.name} ${fallbackModel.storage} - ${selectedCell.carrier} - ${selectedCell.condition}`;
                    }
                    return `${selectedCell.modelId} - ${selectedCell.carrier} - ${selectedCell.condition}`;
                  })()}
                </div>
                <div className="space-y-2">
                  <Label>선택</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ADDITIONAL_CONDITIONS).map(([key, label]) => {
                      const isChecked = tableData[selectedCell.modelId]?.[selectedCell.carrier]?.[selectedCell.condition]?.additionalConditions?.includes(key as AdditionalConditionKey) || false;
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`modal-${key}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => 
                              handleAdditionalConditionChange(
                                selectedCell.modelId, 
                                selectedCell.carrier, 
                                selectedCell.condition, 
                                key as AdditionalConditionKey, 
                                checked as boolean
                              )
                            }
                          />
                          <Label htmlFor={`modal-${key}`} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeConditionModal}>
                    닫기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
