"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Filter, 
  ArrowUpDown, 
  X, 
  FileText,
  Calendar,
  Clock
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
import { getProductTables, deleteProductTable, type ProductTable } from "../../lib/api/productTables";

export default function ProductTableManagement() {
  const router = useRouter();
  
  // 서버에서 데이터 로드
  const [productTables, setProductTables] = useState<ProductTable[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 및 검색 상태
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // 테이블 데이터 로드 함수
  const loadProductTables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductTables({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter as 'all' | 'active' | 'expired'
      });
      
      console.log('API 응답:', response);
      console.log('받아온 테이블 데이터:', response.tables);
      
      setProductTables(response.tables);
      setTotalCount(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('상품 테이블 데이터 로드 실패:', err);
      setError('매장 정보 등록 후 상품을 등록할 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadProductTables();
  }, []);

  // 페이지가 변경될 때마다 데이터 로드
  useEffect(() => {
    loadProductTables();
  }, [currentPage]);

  // 검색어나 필터가 변경될 때는 자동 조회하지 않음 (검색 버튼 클릭 시에만 조회)

  // 서버에서 이미 필터링되고 페이지네이션된 데이터를 받으므로 그대로 사용
  const paginatedTables = productTables;

  // 테이블 생성
  const handleCreateTable = () => {
    router.push('/seller/products/create');
  };

  // 테이블 편집
  const handleEditTable = (table: ProductTable) => {
    router.push(`/seller/products/edit/${table.id}`);
  };

  // 테이블 삭제
  const handleDeleteTable = async (tableId: string) => {
    try {
      await deleteProductTable(tableId);
      // 삭제 후 목록 새로고침
      const response = await getProductTables({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter as 'all' | 'active' | 'expired'
      });
      setProductTables(response.tables);
      setTotalCount(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('테이블 삭제 실패:', err);
      setError('테이블 삭제에 실패했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 노출기간 포맷팅
  const formatExposurePeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = `${start.getMonth() + 1}.${start.getDate()}`;
    const endStr = `${end.getMonth() + 1}.${end.getDate()}`;
    return `${startStr} ~ ${endStr}`;
  };

  // 상태 확인 (노출기간 기반)
  const getTableStatus = (table: ProductTable) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 오늘 00:00:00
    
    // 날짜 문자열을 로컬 시간대로 파싱 (시간대 문제 해결)
    const startDate = new Date(table.exposureStartDate + 'T00:00:00');
    const endDate = new Date(table.exposureEndDate + 'T23:59:59');
    
    console.log('상태 확인:', {
      tableName: table.name,
      today: today.toISOString().split('T')[0],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      todayTime: today.getTime(),
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      comparison: {
        todayVsStart: today >= startDate,
        todayVsEnd: today <= endDate,
        isActive: today >= startDate && today <= endDate
      }
    });
    
    // 오늘이 노출기간 내에 있으면 활성
    if (today >= startDate && today <= endDate) {
      console.log('상태: 활성');
      return { status: 'active', label: '활성', color: 'bg-green-100 text-green-800' };
    } else if (today < startDate) {
      console.log('상태: 예정');
      return { status: 'scheduled', label: '예정', color: 'bg-blue-100 text-blue-800' };
    } else {
      console.log('상태: 만료');
      return { status: 'expired', label: '만료', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상품 테이블을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="테이블명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // 검색 실행
                    setCurrentPage(1);
                    loadProductTables();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="expired">만료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => {
              setCurrentPage(1);
              loadProductTables();
            }} 
            className="flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>검색</span>
          </Button>
        </div>

        <Button onClick={handleCreateTable} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>가격표 추가</span>
        </Button>
      </div>

      {/* 테이블 목록 */}
      {paginatedTables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">등록된 가격표가 없습니다</h3>
            <p className="text-gray-600 mb-4">새로운 가격표를 추가해보세요</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>테이블명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>노출기간</TableHead>
                <TableHead>상품 개수</TableHead>
                <TableHead>업데이트일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTables.map((table) => {
                const status = getTableStatus(table);
                return (
                  <TableRow key={table.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatExposurePeriod(table.exposureStartDate, table.exposureEndDate)}
                    </TableCell>
                    <TableCell>{table.productCount}개</TableCell>
                    <TableCell>
                      {formatDate(table.updatedAt)}
                      {table.createdAt !== table.updatedAt && (
                        <span className="text-xs text-gray-500 ml-1">(수정)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTable(table)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>테이블 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{table.name}" 테이블을 삭제하시겠습니까? 
                                이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTable(table.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 페이지네이션 */}
      {paginatedTables.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            총 {totalCount}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}개 표시
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
