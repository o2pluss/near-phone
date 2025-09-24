import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import {
  FileText,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";

export interface ProductLog {
  id: string;
  productId: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "toggle_status"
    | "bulk_update";
  timestamp: Date;
  actor: string; // 작업자
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: {
    bulkCount?: number;
    [key: string]: any;
  };
}

interface ProductLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productModel: string;
  productId: string;
  logs: ProductLog[];
}

export default function ProductLogDialog({
  open,
  onOpenChange,
  productModel,
  productId,
  logs,
}: ProductLogDialogProps) {
  // 날짜 포맷 함수 (YY.MM.DD HH:mm:ss)
  const formatTimestamp = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear().toString().slice(-2);
    const month = (d.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds().toString().padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  // 액션 타입별 라벨
  const getActionLabel = (action: ProductLog["action"]) => {
    switch (action) {
      case "create":
        return "등록";
      case "update":
        return "수정";
      case "delete":
        return "삭제";
      case "toggle_status":
        return "노출상태 변경";
      case "bulk_update":
        return "일괄 수정";
      default:
        return "기타";
    }
  };

  // 액션 타입별 배지 색상
  const getActionBadgeVariant = (
    action: ProductLog["action"],
  ) => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "toggle_status":
        return "outline";
      case "bulk_update":
        return "secondary";
      default:
        return "outline";
    }
  };

  // 필드명 한글 변환
  const getFieldLabel = (field: string): string => {
    const fieldLabels: { [key: string]: string } = {
      model: "모델명",
      carrier: "통신사",
      storage: "용량",
      price: "가격",
      conditions: "조건",
      isActive: "노출상태",
    };
    return fieldLabels[field] || field;
  };

  // 값 포맷팅
  const formatValue = (value: any, field?: string): string => {
    if (value === null || value === undefined) return "-";

    if (field === "price") {
      return `${Number(value).toLocaleString()}원`;
    }

    if (field === "isActive") {
      return value ? "노출" : "미노출";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  };

  // 해당 상품의 로그만 필터링하고 최신순 정렬
  const productLogs = logs
    .filter((log) => log.productId === productId)
    .sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>상품 이력 조회</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-blue-600">
              {productModel}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 요약 정보 */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  총 {productLogs.length}건의 이력
                </span>
              </div>
              {productLogs.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    최근 업데이트:{" "}
                    {formatTimestamp(productLogs[0].timestamp)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 로그 목록 */}
          {productLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>이력이 없습니다.</p>
              <p className="text-sm mt-1">
                상품 등록 후 이력이 기록됩니다.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {productLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* 로그 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={getActionBadgeVariant(
                            log.action,
                          )}
                        >
                          {getActionLabel(log.action)}
                        </Badge>
                        {log.metadata?.bulkCount && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {log.metadata.bulkCount}개 상품
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{log.actor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 변경 내용 */}
                    {log.changes && log.changes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          변경 내용:
                        </h4>
                        <div className="grid gap-2">
                          {log.changes.map((change, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-background rounded border"
                            >
                              <span className="text-sm font-medium min-w-[80px]">
                                {getFieldLabel(change.field)}
                              </span>
                              <div className="flex items-center space-x-2 flex-1 justify-end">
                                <span className="text-sm text-red-600 line-through max-w-[150px] truncate">
                                  {formatValue(
                                    change.oldValue,
                                    change.field,
                                  )}
                                </span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-green-600 font-medium max-w-[150px] truncate">
                                  {formatValue(
                                    change.newValue,
                                    change.field,
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* 푸터 */}
          <div className="flex justify-end pt-3 border-t">
            <Button onClick={() => onOpenChange(false)}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}