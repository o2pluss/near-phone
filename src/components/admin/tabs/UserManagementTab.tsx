import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  Users, 
  UserCheck, 
  Ban, 
  Eye
} from 'lucide-react';

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

export default function UserManagementTab() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  const handleUserBlock = (userId: string, block: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: block ? 'blocked' : 'active' }
        : user
    ));
  };

  const blockedUsers = users.filter(user => user.status === 'blocked');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">회원 목록 ({users.length})</h3>
        <div className="flex space-x-2">
          <Badge variant="outline">{blockedUsers.length}명 차단됨</Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/users')}
          >
            자세히 보기
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>최근 접속</TableHead>
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
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserBlock(user.id, user.status === 'active')}
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
      </Card>
    </div>
  );
}
