import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { 
  Users, 
  UserCheck, 
  Ban, 
  Eye,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { InlineLoadingSpinner } from '../ui/loading-spinner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'seller';
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // 확인 다이얼로그 상태
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default' as 'default' | 'destructive',
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  // 사용자 데이터 로드
  const fetchUsers = async (page: number = 1, search: string = '', role: string = '', status: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(role && role !== 'all' && { role }),
        ...(status && status !== 'all' && { status }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '사용자 데이터를 불러오는데 실패했습니다.');
      }
      
      const data: UsersResponse = await response.json();

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchUsers();
  }, []);

  // 검색 및 필터 변경 시 데이터 새로고침
  const handleSearch = () => {
    fetchUsers(1, searchTerm, roleFilter, statusFilter);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    fetchUsers(1, '', '', '');
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm, roleFilter, statusFilter);
  };

  // 사용자 차단/해제 확인 다이얼로그 표시
  const showConfirmDialog = (user: User, action: 'block' | 'unblock') => {
    const isBlocking = action === 'block';
    const userRole = user.role === 'seller' ? '판매자' : '사용자';
    
    setConfirmDialog({
      open: true,
      title: isBlocking ? '사용자 차단' : '사용자 차단 해제',
      description: isBlocking 
        ? `"${user.name}" ${userRole}를 차단하시겠습니까?\n차단된 사용자는 로그인할 수 없습니다.`
        : `"${user.name}" ${userRole}의 차단을 해제하시겠습니까?\n해제된 사용자는 다시 로그인할 수 있습니다.`,
      confirmText: isBlocking ? '차단하기' : '해제하기',
      variant: isBlocking ? 'destructive' : 'default',
      onConfirm: () => handleUserBlock(user.id, isBlocking),
    });
  };

  // 사용자 차단/해제 실행
  const handleUserBlock = async (userId: string, block: boolean) => {
    setActionLoading(true);
    setConfirmDialog(prev => ({ ...prev, open: false }));
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: block ? 'block' : 'unblock',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '사용자 상태 변경에 실패했습니다.');
      }

      // 성공 시 현재 페이지 데이터 새로고침
      await fetchUsers(pagination.page, searchTerm, roleFilter, statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              회원 관리
            </h1>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="이름, 이메일, 연락처로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter || undefined} onValueChange={(value) => setRoleFilter(value || '')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                  <SelectItem value="seller">판매자</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value || '')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="blocked">차단</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <InlineLoadingSpinner /> : <Search className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            회원 목록 ({pagination.total}명)
            {pagination.total > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                ({pagination.page} / {pagination.totalPages} 페이지)
              </span>
            )}
          </h3>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <InlineLoadingSpinner text="로딩 중..." />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>최근 접속 시간</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'seller' ? 'default' : 'secondary'}>
                        {user.role === 'seller' ? '판매자' : '사용자'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status === 'active' ? '활성' : '차단'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="whitespace-nowrap">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => showConfirmDialog(user, user.status === 'active' ? 'block' : 'unblock')}
                          disabled={loading || actionLoading}
                        >
                          {user.status === 'active' ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {pagination.total}명 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}명 표시
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
