import React, { useState, useEffect } from 'react';
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
import { supabase } from '../lib/supabaseClient';
import { getDeviceModels, getDeviceModelById } from '../lib/api/deviceModels';
import { 
  CARRIER_CODES, 
  CARRIER_LABELS, 
  MANUFACTURER_CODES, 
  MANUFACTURER_LABELS, 
  STORAGE_CODES, 
  STORAGE_LABELS,
  getAllCarrierCodes,
  getAllManufacturerCodes,
  getAllStorageCodes,
  type CarrierCode,
  type ManufacturerCode,
  type StorageCode
} from '../lib/constants/codes';

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
  manufacturer: ManufacturerCode;
  model: string;
  supportedCarriers: CarrierCode[]; // 지원하는 통신사 목록
  supportedStorage: StorageCode[]; // 지원하는 용량 목록
  imageUrl?: string; // 단말기 이미지 URL
  createdAt: string;
}


export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 판매자 신청 데이터 가져오기
  useEffect(() => {
    const fetchSellerApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('seller_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('판매자 신청 데이터 조회 실패:', error);
          // 테이블이 없는 경우 빈 배열로 설정
          if (error.code === 'PGRST205') {
            console.log('seller_applications 테이블이 없습니다. 빈 배열로 설정합니다.');
            setStores([]);
            setIsLoading(false);
            return;
          }
          // 다른 오류의 경우에도 빈 배열로 설정
          setStores([]);
          setIsLoading(false);
          return;
        }

        // 데이터를 Store 형태로 변환
        const storeData: Store[] = data.map((app: any) => ({
          id: app.id,
          name: app.business_name,
          ownerName: app.contact_name,
          email: app.contact_email,
          phone: app.contact_phone,
          address: app.business_address,
          businessNumber: app.business_license,
          status: app.status === 'pending' ? 'pending' : 
                  app.status === 'approved' ? 'active' : 'blocked',
          createdAt: app.created_at.split('T')[0]
        }));

        setStores(storeData);
      } catch (error) {
        console.error('판매자 신청 데이터 조회 오류:', error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerApplications();
  }, []);

  // 단말기 모델 데이터 로드
  useEffect(() => {
    const fetchDeviceModels = async () => {
      try {
        const models = await getDeviceModels();
        setDeviceModels(models);
      } catch (error) {
        console.error('단말기 모델 데이터 로드 실패:', error);
        setDeviceModels([]);
        
        // 사용자에게 알림
        if (error instanceof Error) {
          if (error.message.includes('device_models 테이블이 존재하지 않습니다')) {
            alert('데이터베이스 테이블이 생성되지 않았습니다.\n\n해결 방법:\n1. Supabase 대시보드에서 SQL Editor 열기\n2. scripts/create-device-models-table.sql 파일의 내용 실행\n3. 페이지 새로고침');
          } else if (error.message.includes('RLS 정책')) {
            alert('데이터베이스 권한 문제가 발생했습니다.\n\n해결 방법:\n1. Supabase에서 RLS 정책 확인\n2. 개발용으로 RLS 비활성화 고려');
          } else {
            alert(`단말기 모델 데이터 로드 실패: ${error.message}`);
          }
        } else {
          alert('단말기 모델 데이터 로드에 실패했습니다. 데이터베이스 연결을 확인해주세요.');
        }
      }
    };

    fetchDeviceModels();
  }, []);

  // 리뷰 통계 (실제 데이터에서 계산)
  const reviewStats = {
    total: 0,
    blocked: 0,
    averageRating: 0
  };

  const deviceForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      manufacturer: MANUFACTURER_CODES.SAMSUNG,
      model: '',
      supportedCarriers: [],
      supportedStorage: []
    }
  });
  
  const editForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      manufacturer: MANUFACTURER_CODES.SAMSUNG,
      model: '',
      supportedCarriers: [],
      supportedStorage: []
    }
  });

  const handleUserBlock = (userId: string, block: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: block ? 'blocked' : 'active' }
        : user
    ));
  };

  const handleStoreApproval = async (storeId: string, approve: boolean) => {
    try {
      const status = approve ? 'approved' : 'rejected';
      
      // 먼저 신청 정보를 가져와서 user_id 확인
      const { data: application } = await supabase
        .from('seller_applications')
        .select('user_id, contact_email')
        .eq('id', storeId)
        .single();

      if (!application) {
        alert('신청 정보를 찾을 수 없습니다.');
        return;
      }

      // seller_applications 테이블 업데이트
      const { error } = await supabase
        .from('seller_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) {
        console.error('승인/거부 처리 실패:', error);
        alert('처리에 실패했습니다: ' + error.message);
        return;
      }

      // 승인된 경우 사용자의 user_metadata 업데이트
      if (approve) {
        try {
          // Supabase Admin API를 사용하여 사용자 메타데이터 업데이트
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            application.user_id,
            {
              user_metadata: {
                role: 'seller',
                name: application.contact_email.split('@')[0] || '판매자'
              }
            }
          );

          if (updateError) {
            console.error('사용자 메타데이터 업데이트 실패:', updateError);
            // 메타데이터 업데이트 실패해도 승인은 완료된 것으로 처리
          } else {
            console.log('사용자 메타데이터 업데이트 완료');
          }
        } catch (updateError) {
          console.error('사용자 메타데이터 업데이트 중 오류:', updateError);
        }
      }

      // 로컬 상태 업데이트
      setStores(stores.map(store => 
        store.id === storeId 
          ? { ...store, status: approve ? 'active' : 'blocked' }
          : store
      ));

      alert(approve ? '승인되었습니다.' : '거부되었습니다.');
    } catch (error) {
      console.error('승인/거부 처리 오류:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
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

  const handleDeviceModelAdd = async (data: Omit<DeviceModel, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/device-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manufacturer: data.manufacturer,
          model: data.model,
          supported_carriers: data.supportedCarriers,
          supported_storage: data.supportedStorage,
          image_url: imagePreview || null
        }),
      });

      if (!response.ok) {
        throw new Error('단말기 모델 추가에 실패했습니다.');
      }

      const newDevice = await response.json();
      setDeviceModels([...deviceModels, newDevice]);
      setIsDeviceDialogOpen(false);
      deviceForm.reset({
        manufacturer: MANUFACTURER_CODES.SAMSUNG,
        model: '',
        supportedCarriers: [],
        supportedStorage: []
      });
      handleImageRemove();
    } catch (error) {
      console.error('단말기 모델 추가 실패:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('device_models 테이블이 존재하지 않습니다')) {
          alert('데이터베이스 테이블이 생성되지 않았습니다.\n\n해결 방법:\n1. Supabase 대시보드에서 SQL Editor 열기\n2. scripts/create-device-models-table.sql 파일의 내용 실행\n3. 다시 시도');
        } else if (error.message.includes('RLS 정책')) {
          alert('데이터베이스 권한 문제가 발생했습니다.\n\n해결 방법:\n1. Supabase에서 RLS 정책 확인\n2. 개발용으로 RLS 비활성화 고려');
        } else {
          alert(`단말기 모델 추가 실패: ${error.message}`);
        }
      } else {
        alert('단말기 모델 추가에 실패했습니다.');
      }
    }
  };

  const handleDialogClose = () => {
    setIsDeviceDialogOpen(false);
    deviceForm.reset({
      manufacturer: MANUFACTURER_CODES.SAMSUNG,
      model: '',
      supportedCarriers: [],
      supportedStorage: []
    });
    handleImageRemove(); // 이미지 상태 초기화
  };

  const handleDeviceModelDelete = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/device-models/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('단말기 모델 삭제에 실패했습니다.');
      }

      setDeviceModels(deviceModels.filter(device => device.id !== deviceId));
    } catch (error) {
      console.error('단말기 모델 삭제 실패:', error);
      alert('단말기 모델 삭제에 실패했습니다.');
    }
  };

  const handleDeviceEdit = (device: DeviceModel) => {
    setEditingDevice(device);
    editForm.reset({
      manufacturer: device.manufacturer,
      model: device.model,
      supportedCarriers: device.supportedCarriers,
      supportedStorage: device.supportedStorage,
      imageUrl: device.imageUrl
    });
    setImagePreview(device.imageUrl || '');
    setIsEditDialogOpen(true);
  };

  const handleDeviceUpdate = async (data: Omit<DeviceModel, 'id' | 'createdAt'>) => {
    if (!editingDevice) return;
    
    try {
      const response = await fetch(`/api/device-models/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manufacturer: data.manufacturer,
          model: data.model,
          supported_carriers: data.supportedCarriers,
          supported_storage: data.supportedStorage,
          image_url: imagePreview || null
        }),
      });

      if (!response.ok) {
        throw new Error('단말기 모델 수정에 실패했습니다.');
      }

      const updatedDevice = await response.json();
      setDeviceModels(deviceModels.map(device => 
        device.id === editingDevice.id ? updatedDevice : device
      ));
      
      setIsEditDialogOpen(false);
      setEditingDevice(null);
      editForm.reset({
        manufacturer: MANUFACTURER_CODES.SAMSUNG,
        model: '',
        supportedCarriers: [],
        supportedStorage: []
      });
      handleImageRemove();
    } catch (error) {
      console.error('단말기 모델 수정 실패:', error);
      alert('단말기 모델 수정에 실패했습니다.');
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingDevice(null);
    editForm.reset({
      manufacturer: MANUFACTURER_CODES.SAMSUNG,
      model: '',
      supportedCarriers: [],
      supportedStorage: []
    });
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
                <p className="text-2xl font-bold">{reviewStats.total - reviewStats.blocked}</p>
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
            <h3 className="text-lg font-semibold">
              매장 목록 ({isLoading ? '로딩 중...' : stores.length})
            </h3>
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
            <h3 className="text-lg font-semibold">단말기 ({deviceModels.length})</h3>
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
                  <TableHead>제조사</TableHead>
                  <TableHead>모델명</TableHead>
                  <TableHead>지원 통신사</TableHead>
                  <TableHead>지원 용량</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">등록된 단말기가 없습니다</p>
                        <p className="text-sm text-gray-400">
                          {isLoading ? '데이터를 불러오는 중...' : '새로운 단말기를 추가해보세요'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  deviceModels.map((device) => (
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
                    <TableCell>{MANUFACTURER_LABELS[device.manufacturer as keyof typeof MANUFACTURER_LABELS] || device.manufacturer || '알 수 없음'}</TableCell>
                    <TableCell className="font-medium">{device.model}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(device.supportedCarriers || []).map((carrier) => (
                          <Badge key={carrier} variant="outline" className="text-xs">
                            {CARRIER_LABELS[carrier as keyof typeof CARRIER_LABELS] || carrier}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(device.supportedStorage || []).map((size) => (
                          <Badge key={size} variant="secondary" className="text-xs">
                            {STORAGE_LABELS[size as keyof typeof STORAGE_LABELS] || size}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Model Add Dialog */}
      <Dialog open={isDeviceDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>단말기 추가</DialogTitle>
            <DialogDescription>
              새로운 모델을 등록하세요
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={deviceForm.handleSubmit(handleDeviceModelAdd)} className="space-y-4">
            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label>단말기 이미지T</Label>
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
              <Label>지원 통신사</Label>
              <div className="grid grid-cols-3 gap-2">
                {getAllCarrierCodes().map((carrierCode) => (
                  <div key={carrierCode} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`carrier-${carrierCode}`}
                      value={carrierCode}
                      checked={deviceForm.watch('supportedCarriers')?.includes(carrierCode) || false}
                      onChange={(e) => {
                        const currentCarriers = deviceForm.getValues('supportedCarriers') || [];
                        if (e.target.checked) {
                          deviceForm.setValue('supportedCarriers', [...currentCarriers, carrierCode]);
                        } else {
                          deviceForm.setValue('supportedCarriers', currentCarriers.filter(c => c !== carrierCode));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`carrier-${carrierCode}`} className="text-sm">
                      {CARRIER_LABELS[carrierCode]}
                    </Label>
                  </div>
                ))}
              </div>
              {deviceForm.formState.errors.supportedCarriers && (
                <p className="text-sm text-destructive">
                  {deviceForm.formState.errors.supportedCarriers.message}
                </p>
              )}
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
                      {getAllManufacturerCodes().map((manufacturerCode) => (
                        <SelectItem key={manufacturerCode} value={manufacturerCode}>
                          {MANUFACTURER_LABELS[manufacturerCode]}
                        </SelectItem>
                      ))}
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

            <div className="space-y-2">
              <Label>지원 용량</Label>
              <div className="grid grid-cols-2 gap-2">
                {getAllStorageCodes().map((storageCode) => (
                  <div key={storageCode} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`storage-${storageCode}`}
                      value={storageCode}
                      checked={deviceForm.watch('supportedStorage')?.includes(storageCode) || false}
                      onChange={(e) => {
                        const currentStorage = deviceForm.getValues('supportedStorage') || [];
                        if (e.target.checked) {
                          deviceForm.setValue('supportedStorage', [...currentStorage, storageCode]);
                        } else {
                          deviceForm.setValue('supportedStorage', currentStorage.filter(s => s !== storageCode));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`storage-${storageCode}`} className="text-sm">
                      {STORAGE_LABELS[storageCode]}
                    </Label>
                  </div>
                ))}
              </div>
              {deviceForm.formState.errors.supportedStorage && (
                <p className="text-sm text-destructive">
                  {deviceForm.formState.errors.supportedStorage.message}
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
            <DialogTitle>단말기 편집</DialogTitle>
            <DialogDescription>
              단말기 정보를 수정하세요
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
              <Label>지원 통신사</Label>
              <div className="grid grid-cols-3 gap-2">
                {getAllCarrierCodes().map((carrierCode) => (
                  <div key={carrierCode} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-carrier-${carrierCode}`}
                      value={carrierCode}
                      checked={editForm.watch('supportedCarriers')?.includes(carrierCode) || false}
                      onChange={(e) => {
                        const currentCarriers = editForm.getValues('supportedCarriers') || [];
                        if (e.target.checked) {
                          editForm.setValue('supportedCarriers', [...currentCarriers, carrierCode]);
                        } else {
                          editForm.setValue('supportedCarriers', currentCarriers.filter(c => c !== carrierCode));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`edit-carrier-${carrierCode}`} className="text-sm">
                      {CARRIER_LABELS[carrierCode]}
                    </Label>
                  </div>
                ))}
              </div>
              {editForm.formState.errors.supportedCarriers && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.supportedCarriers.message}
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
                      {getAllManufacturerCodes().map((manufacturerCode) => (
                        <SelectItem key={manufacturerCode} value={manufacturerCode}>
                          {MANUFACTURER_LABELS[manufacturerCode]}
                        </SelectItem>
                      ))}
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

            <div className="space-y-2">
              <Label>지원 용량</Label>
              <div className="grid grid-cols-2 gap-2">
                {getAllStorageCodes().map((storageCode) => (
                  <div key={storageCode} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-storage-${storageCode}`}
                      value={storageCode}
                      checked={editForm.watch('supportedStorage')?.includes(storageCode) || false}
                      onChange={(e) => {
                        const currentStorage = editForm.getValues('supportedStorage') || [];
                        if (e.target.checked) {
                          editForm.setValue('supportedStorage', [...currentStorage, storageCode]);
                        } else {
                          editForm.setValue('supportedStorage', currentStorage.filter(s => s !== storageCode));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`edit-storage-${storageCode}`} className="text-sm">
                      {STORAGE_LABELS[storageCode]}
                    </Label>
                  </div>
                ))}
              </div>
              {editForm.formState.errors.supportedStorage && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.supportedStorage.message}
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