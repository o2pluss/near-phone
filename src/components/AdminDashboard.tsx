import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useForm, Controller } from 'react-hook-form';
import { 
  Shield, 
  Users, 
  Store, 
  Package, 
  UserCheck, 
  Ban, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Plus,
  Edit,
  AlertTriangle,
  MessageSquare,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import ReviewManagement from './admin/ReviewManagement';

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

interface Store {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  businessNumber: string;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
}

interface Product {
  id: string;
  storeId: string;
  storeName: string;
  model: string;
  carrier: string;
  storage: string;
  price: number;
  status: 'active' | 'blocked';
  createdAt: string;
}

interface DeviceModel {
  id: string;
  carrier: string;
  manufacturer: string;
  model: string;
  imageUrl?: string; // 단말기 이미지 URL
  createdAt: string;
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
  }
];

const mockStores: Store[] = [
  {
    id: '1',
    name: '강남 휴대폰 매장',
    ownerName: '박판매자',
    email: 'seller1@example.com',
    phone: '02-1234-5678',
    address: '서울시 강남구 역삼동 123-45',
    businessNumber: '123-45-67890',
    status: 'active',
    createdAt: '2024-01-12'
  },
  {
    id: '2',
    name: '신청중 매장',
    ownerName: '최신청자',
    email: 'pending@example.com',
    phone: '02-9876-5432',
    address: '서울시 서초구 서초동 456-78',
    businessNumber: '987-65-43210',
    status: 'pending',
    createdAt: '2024-01-18'
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    storeId: '1',
    storeName: '강남 휴대폰 매장',
    model: 'iPhone 15 Pro',
    carrier: 'KT',
    storage: '256GB',
    price: 1200000,
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    storeId: '1',
    storeName: '강남 휴대폰 매장',
    model: 'Galaxy S24 Ultra',
    carrier: 'SKT',
    storage: '512GB',
    price: 980000,
    status: 'active',
    createdAt: '2024-01-16'
  }
];

const mockDeviceModels: DeviceModel[] = [
  {
    id: '1',
    carrier: 'KT',
    manufacturer: '애플',
    model: 'iPhone 15 Pro',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    carrier: 'SKT',
    manufacturer: '삼성',
    model: 'Galaxy S24 Ultra',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    carrier: 'LG U+',
    manufacturer: '삼성',
    model: 'Galaxy Z Flip 6',
    createdAt: '2024-01-01'
  }
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>(mockDeviceModels);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Mock 리뷰 데이터 (통계용)
  const mockReviewStats = {
    total: 156,
    blocked: 12,
    averageRating: 4.2
  };

  const deviceForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      carrier: '',
      manufacturer: '',
      model: ''
    }
  });
  
  const editForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      carrier: '',
      manufacturer: '',
      model: ''
    }
  });

  const handleUserBlock = (userId: string, block: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: block ? 'blocked' : 'active' }
        : user
    ));
  };

  const handleStoreApproval = (storeId: string, approve: boolean) => {
    setStores(stores.map(store => 
      store.id === storeId 
        ? { ...store, status: approve ? 'active' : 'blocked' }
        : store
    ));
  };

  const handleStoreBlock = (storeId: string, block: boolean) => {
    setStores(stores.map(store => 
      store.id === storeId 
        ? { ...store, status: block ? 'blocked' : 'active' }
        : store
    ));
  };

  const handleProductBlock = (productId: string, block: boolean) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, status: block ? 'blocked' : 'active' }
        : product
    ));
  };

  // 이미지 업로드 관련 함수들
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 형식 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setSelectedImage(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleDeviceModelAdd = (data: Omit<DeviceModel, 'id' | 'createdAt'>) => {
    const newDevice: DeviceModel = {
      ...data,
      imageUrl: imagePreview || undefined, // 실제로는 서버에 업로드된 URL 사용
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDeviceModels([...deviceModels, newDevice]);
    setIsDeviceDialogOpen(false);
    deviceForm.reset();
    handleImageRemove(); // 이미지 상태 초기화
  };

  const handleDialogClose = () => {
    setIsDeviceDialogOpen(false);
    deviceForm.reset();
    handleImageRemove(); // 이미지 상태 초기화
  };

  const handleDeviceModelDelete = (deviceId: string) => {
    setDeviceModels(deviceModels.filter(device => device.id !== deviceId));
  };

  const handleDeviceEdit = (device: DeviceModel) => {
    setEditingDevice(device);
    editForm.reset({
      carrier: device.carrier,
      manufacturer: device.manufacturer,
      model: device.model,
      imageUrl: device.imageUrl
    });
    setImagePreview(device.imageUrl || '');
    setIsEditDialogOpen(true);
  };

  const handleDeviceUpdate = (data: Omit<DeviceModel, 'id' | 'createdAt'>) => {
    if (!editingDevice) return;
    
    const updatedDevice: DeviceModel = {
      ...editingDevice,
      ...data,
      imageUrl: imagePreview || undefined
    };
    
    setDeviceModels(deviceModels.map(device => 
      device.id === editingDevice.id ? updatedDevice : device
    ));
    
    setIsEditDialogOpen(false);
    setEditingDevice(null);
    editForm.reset();
    handleImageRemove();
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingDevice(null);
    editForm.reset();
    handleImageRemove();
  };

  const pendingStores = stores.filter(store => store.status === 'pending');
  const blockedUsers = users.filter(user => user.status === 'blocked');
  const blockedStores = stores.filter(store => store.status === 'blocked');

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>관리자 대시보드</span>
          </h1>
          <p className="text-muted-foreground">시스템 전체 관리</p>
        </div>
        
        {pendingStores.length > 0 && (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{pendingStores.length}개 승인 대기</span>
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">총 사용자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stores.filter(s => s.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">활성 매장</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">활성 상품</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{mockReviewStats.total - mockReviewStats.blocked}</p>
                <p className="text-xs text-muted-foreground">활성 리뷰</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pendingStores.length}</p>
                <p className="text-xs text-muted-foreground">승인 대기</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">회원 관리</TabsTrigger>
          <TabsTrigger value="stores">매장 관리</TabsTrigger>
          <TabsTrigger value="products">상품 관리</TabsTrigger>
          <TabsTrigger value="reviews">리뷰 관리</TabsTrigger>
          <TabsTrigger value="devices">단말기 등록</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">회원 목록 ({users.length})</h3>
            <div className="flex space-x-2">
              <Badge variant="outline">{blockedUsers.length}명 차단됨</Badge>
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
        </TabsContent>

        {/* Store Management */}
        <TabsContent value="stores" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">매장 목록 ({stores.length})</h3>
            <div className="flex space-x-2">
              <Badge variant="destructive">{pendingStores.length}개 승인 대기</Badge>
              <Badge variant="outline">{blockedStores.length}개 차단됨</Badge>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>매장명</TableHead>
                  <TableHead>사업자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.ownerName}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.phone}</TableCell>
                    <TableCell>{store.businessNumber}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          store.status === 'active' ? 'default' : 
                          store.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {store.status === 'active' ? '승인됨' : 
                         store.status === 'pending' ? '승인 대기' : '차단됨'}
                      </Badge>
                    </TableCell>
                    <TableCell>{store.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {store.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStoreApproval(store.id, true)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStoreApproval(store.id, false)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {store.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStoreBlock(store.id, true)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {store.status === 'blocked' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStoreBlock(store.id, false)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
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
        </TabsContent>

        {/* Product Management */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">상품 목록 ({products.length})</h3>
            <Badge variant="outline">
              {products.filter(p => p.status === 'blocked').length}개 차단됨
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
                    <TableCell className="font-medium">{product.model}</TableCell>
                    <TableCell>{product.storeName}</TableCell>
                    <TableCell>{product.carrier}</TableCell>
                    <TableCell>{product.storage}</TableCell>
                    <TableCell>{product.price.toLocaleString()}원</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'destructive'}>
                        {product.status === 'active' ? '활성' : '차단'}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.createdAt}</TableCell>
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
        </TabsContent>

        {/* Review Management */}
        <TabsContent value="reviews">
          <ReviewManagement />
        </TabsContent>

        {/* Device Model Management */}
        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">단말기 모델 ({deviceModels.length})</h3>
            <Button onClick={() => setIsDeviceDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              단말기 추가
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이미지</TableHead>
                  <TableHead>통신사</TableHead>
                  <TableHead>제조사</TableHead>
                  <TableHead>모델명</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceModels.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {device.imageUrl ? (
                          <img 
                            src={device.imageUrl} 
                            alt={device.model}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{device.carrier}</TableCell>
                    <TableCell>{device.manufacturer}</TableCell>
                    <TableCell className="font-medium">{device.model}</TableCell>
                    <TableCell>{device.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeviceEdit(device)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeviceModelDelete(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Model Add Dialog */}
      <Dialog open={isDeviceDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>단말기 모델 추가</DialogTitle>
            <DialogDescription>
              새로운 단말기 모델을 등록하세요
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={deviceForm.handleSubmit(handleDeviceModelAdd)} className="space-y-4">
            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label>단말기 이미지 (선택사항)</Label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="device-image-upload"
                    />
                    <label htmlFor="device-image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          클릭하여 이미지 선택
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP (최대 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="relative w-28 h-28 p-2">
                    <img 
                      src={imagePreview} 
                      alt="미리보기"
                      className="w-full h-full object-cover rounded-lg bg-gray-100 border"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>통신사</Label>
              <Controller
                name="carrier"
                control={deviceForm.control}
                rules={{ required: '통신사를 선택해주세요' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="통신사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KT">KT</SelectItem>
                      <SelectItem value="SKT">SKT</SelectItem>
                      <SelectItem value="LG U+">LG U+</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>제조사</Label>
              <Controller
                name="manufacturer"
                control={deviceForm.control}
                rules={{ required: '제조사를 선택해주세요' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="제조사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="삼성">삼성</SelectItem>
                      <SelectItem value="애플">애플</SelectItem>
                      <SelectItem value="LG">LG</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>모델명</Label>
              <Input 
                {...deviceForm.register('model', { required: '모델명을 입력해주세요' })}
                placeholder="예: 갤럭시 Z 플립 7"
              />
              {deviceForm.formState.errors.model && (
                <p className="text-sm text-destructive">
                  {deviceForm.formState.errors.model.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                취소
              </Button>
              <Button type="submit">등록</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Device Model Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>단말기 모델 편집</DialogTitle>
            <DialogDescription>
              단말기 모델 정보를 수정하세요
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(handleDeviceUpdate)} className="space-y-4">
            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label>단말기 이미지 (선택사항)</Label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="edit-device-image-upload"
                    />
                    <label htmlFor="edit-device-image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          클릭하여 이미지 선택
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP (최대 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="relative w-28 h-28 p-2">
                    <img 
                      src={imagePreview} 
                      alt="미리보기"
                      className="w-full h-full object-cover rounded-lg bg-gray-100 border"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>통신사</Label>
              <Controller
                name="carrier"
                control={editForm.control}
                rules={{ required: '통신사를 선택해주세요' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="통신사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KT">KT</SelectItem>
                      <SelectItem value="SKT">SKT</SelectItem>
                      <SelectItem value="LG U+">LG U+</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {editForm.formState.errors.carrier && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.carrier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>제조사</Label>
              <Controller
                name="manufacturer"
                control={editForm.control}
                rules={{ required: '제조사를 선택해주세요' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="제조사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="삼성">삼성</SelectItem>
                      <SelectItem value="애플">애플</SelectItem>
                      <SelectItem value="LG">LG</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {editForm.formState.errors.manufacturer && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.manufacturer.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>모델명</Label>
              <Input 
                {...editForm.register('model', { required: '모델명을 입력해주세요' })}
                placeholder="예: 갤럭시 Z 플립 7"
              />
              {editForm.formState.errors.model && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.model.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleEditDialogClose}>
                취소
              </Button>
              <Button type="submit">수정</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}