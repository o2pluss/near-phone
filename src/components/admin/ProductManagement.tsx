import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Package, 
  UserCheck, 
  Ban, 
  Eye,
  ArrowLeft
} from 'lucide-react';

interface Product {
  id: string;
  deviceName: string;
  storeName: string;
  carrier: string;
  storage: string;
  price: number;
  status: 'active' | 'blocked';
  createdAt?: Date;
}

export default function ProductManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  const handleProductBlock = (productId: string, block: boolean) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, status: block ? 'blocked' : 'active' }
        : product
    ));
  };

  const activeProducts = products.filter(p => p.status === 'active');
  const blockedProducts = products.filter(p => p.status === 'blocked');

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
              상품 관리
            </h1>
            <p className="text-muted-foreground">등록된 상품 관리</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">총 상품</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeProducts.length}</p>
                <p className="text-xs text-muted-foreground">활성 상품</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ban className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{blockedProducts.length}</p>
                <p className="text-xs text-muted-foreground">차단된 상품</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">상품 목록 ({products.length})</h3>
          <Badge variant="outline">
            {blockedProducts.length}개 차단됨
          </Badge>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품명</TableHead>
                <TableHead>매장</TableHead>
                <TableHead>통신사</TableHead>
                <TableHead>용량</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.deviceName}</TableCell>
                  <TableCell>{product.storeName}</TableCell>
                  <TableCell>{product.carrier}</TableCell>
                  <TableCell>{product.storage}</TableCell>
                  <TableCell>{product.price.toLocaleString()}원</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'destructive'}>
                      {product.status === 'active' ? '활성' : '차단'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.createdAt?.toLocaleDateString() || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleProductBlock(product.id, product.status === 'active')}
                      >
                        {product.status === 'active' ? (
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
    </div>
  );
}
