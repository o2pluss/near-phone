import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  Package, 
  UserCheck, 
  Ban, 
  Eye
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

export default function ProductManagementTab() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  const handleProductBlock = (productId: string, block: boolean) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, status: block ? 'blocked' : 'active' }
        : product
    ));
  };

  const blockedProducts = products.filter(p => p.status === 'blocked');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">상품 목록 ({products.length})</h3>
        <div className="flex space-x-2">
          <Badge variant="outline">
            {blockedProducts.length}개 차단됨
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/products')}
          >
            자세히 보기
          </Button>
        </div>
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
  );
}
