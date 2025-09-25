"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Users, 
  UserCheck, 
  Ban, 
  Eye, 
  Search,
  Filter
} from 'lucide-react';
import { Input } from '../ui/input';

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

const mockUsers: User[] = [
  {
    id: '1',
    name: '김사용자',
    email: 'user1@example.com',
    phone: '010-1234-5678',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20'
  },
  {
    id: '2',
    name: '이구매자',
    email: 'user2@example.com',
    phone: '010-2345-6789',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-10',
    lastLogin: '2024-01-19'
  },
  {
    id: '3',
    name: '박고객',
    email: 'user3@example.com',
    phone: '010-3456-7890',
    role: 'user',
    status: 'blocked',
    createdAt: '2024-01-05',
    lastLogin: '2024-01-18'
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUserBlock = (userId: string, isCurrentlyActive: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: isCurrentlyActive ? 'blocked' : 'active' }
        : user
    ));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const blockedUsers = users.filter(user => user.status === 'blocked');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="text-muted-foreground">고객 정보를 관리하고 상태를 변경할 수 있습니다</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{blockedUsers.length}명 차단됨</Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="이름, 이메일, 연락처로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>회원 목록 ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredUsers.map((user) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
