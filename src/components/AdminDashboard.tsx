import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { 
  Shield, 
  Users, 
  Store, 
  Package, 
  AlertTriangle,
  MessageSquare,
  Upload,
  X,
  Image as ImageIcon,
  Menu,
  X as XIcon
} from 'lucide-react';
import UserManagementTab from './admin/tabs/UserManagementTab';
import StoreManagementTab from './admin/tabs/StoreManagementTab';
import ProductManagementTab from './admin/tabs/ProductManagementTab';
import ReviewManagementTab from './admin/tabs/ReviewManagementTab';
import DeviceManagementTab from './admin/tabs/DeviceManagementTab';
import { supabase } from '../lib/supabaseClient';
import { getDeviceModels, getDeviceModelById, type DeviceModelsResponse } from '../lib/api/deviceModels';
import { type Product as BaseProduct, type DeviceModel } from '../types/product';

// AdminDashboard에서 사용하는 Product 인터페이스
interface Product extends BaseProduct {
  storeId: string;
  storeName: string;
  status: 'active' | 'blocked';
}
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




export default function AdminDashboard() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [activeMenu, setActiveMenu] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10); // 페이지당 10개
  
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

  // 단말기 모델 데이터 로드 (페이지네이션)
  const fetchDeviceModels = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await getDeviceModels(page, pageSize);
      setDeviceModels(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('단말기 모델 데이터 로드 실패:', error);
      setDeviceModels([]);
      setTotalPages(1);
      setTotalCount(0);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceModels(1);
  }, []);


  const deviceForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      manufacturer: MANUFACTURER_CODES.SAMSUNG,
      deviceName: '',
      modelName: '',
      supportedCarriers: [],
      supportedStorage: []
    }
  });
  
  const editForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      manufacturer: MANUFACTURER_CODES.SAMSUNG,
      deviceName: '',
      modelName: '',
      supportedCarriers: [],
      supportedStorage: []
    }
  });



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
          device_name: data.deviceName,
          model_name: data.modelName,
          supported_carriers: data.supportedCarriers,
          supported_storage: data.supportedStorage,
          image_url: imagePreview || null
        }),
      });

      if (!response.ok) {
        throw new Error('단말기 모델 추가에 실패했습니다.');
      }

      const newDevice = await response.json();
      // 새 단말기 추가 후 현재 페이지 새로고침
      await fetchDeviceModels(currentPage);
      setIsDeviceDialogOpen(false);
      deviceForm.reset({
        manufacturer: MANUFACTURER_CODES.SAMSUNG,
        deviceName: '',
        modelName: '',
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
      deviceName: '',
      modelName: '',
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

      // 단말기 삭제 후 현재 페이지 새로고침
      await fetchDeviceModels(currentPage);
    } catch (error) {
      console.error('단말기 모델 삭제 실패:', error);
      alert('단말기 모델 삭제에 실패했습니다.');
    }
  };

  const handleDeviceEdit = (device: DeviceModel) => {
    setEditingDevice(device);
    editForm.reset({
      manufacturer: device.manufacturer,
      deviceName: device.deviceName,
      modelName: device.modelName,
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
          device_name: data.deviceName,
          model_name: data.modelName,
          supported_carriers: data.supportedCarriers,
          supported_storage: data.supportedStorage,
          image_url: imagePreview || null
        }),
      });

      if (!response.ok) {
        throw new Error('단말기 모델 수정에 실패했습니다.');
      }

      const updatedDevice = await response.json();
      // 단말기 수정 후 현재 페이지 새로고침
      await fetchDeviceModels(currentPage);
      
      setIsEditDialogOpen(false);
      setEditingDevice(null);
      editForm.reset({
        manufacturer: MANUFACTURER_CODES.SAMSUNG,
        deviceName: '',
        modelName: '',
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
      deviceName: '',
      modelName: '',
      supportedCarriers: [],
      supportedStorage: []
    });
    handleImageRemove();
  };

  // DeviceManagementTab에서 사용할 핸들러들
  const handleAddDevice = () => {
    setIsDeviceDialogOpen(true);
  };

  const handleEditDevice = (device: DeviceModel) => {
    handleDeviceEdit(device);
  };

  const handleDeleteDevice = (deviceId: string) => {
    handleDeviceModelDelete(deviceId);
  };

  const pendingStores = stores.filter(store => store.status === 'pending');

  const menuItems = [
    { id: 'home', label: '홈', icon: Shield, href: '/admin' },
    { id: 'users', label: '회원 관리', icon: Users, href: '/admin/users' },
    { id: 'stores', label: '매장 관리', icon: Store, href: '/admin/stores' },
    { id: 'products', label: '상품 관리', icon: Package, href: '/admin/products' },
    { id: 'reviews', label: '리뷰 관리', icon: MessageSquare, href: '/admin/reviews' },
    { id: 'devices', label: '단말기 관리', icon: AlertTriangle, href: '/admin/devices' }
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="space-y-4">
              {/* 첫 번째 행 - 3개 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/users')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">총 사용자</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/stores')}
                >
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
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/stores')}
                >
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
              
              {/* 두 번째 행 - 2개 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/products')}
                >
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
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/reviews')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">활성 리뷰</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pending Stores Alert */}
            {pendingStores.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-orange-800">
                        {pendingStores.length}개의 매장 승인 대기 중
                      </p>
                      <p className="text-sm text-orange-600">
                        매장 관리에서 승인 처리를 진행해주세요.
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveMenu('stores')}
                      className="ml-auto"
                    >
                      확인하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'users':
        return <UserManagementTab />;
      case 'stores':
        return <StoreManagementTab />;
      case 'products':
        return <ProductManagementTab />;
      case 'reviews':
        return <ReviewManagementTab />;
      case 'devices':
        return (
          <DeviceManagementTab 
            onAddDevice={handleAddDevice}
            onEditDevice={handleEditDevice}
            onDeleteDevice={handleDeleteDevice}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="space-y-4">
              {/* 첫 번째 행 - 3개 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/users')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">총 사용자</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/stores')}
                >
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
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/stores')}
                >
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
              
              {/* 두 번째 행 - 2개 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/products')}
                >
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
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/admin/reviews')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">활성 리뷰</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pending Stores Alert */}
            {pendingStores.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-orange-800">
                        {pendingStores.length}개의 매장 승인 대기 중
                      </p>
                      <p className="text-sm text-orange-600">
                        매장 관리에서 승인 처리를 진행해주세요.
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveMenu('stores')}
                      className="ml-auto"
                    >
                      확인하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <span>ADMIN</span>
              </h1>
              <p className="text-muted-foreground">서비스 전체 관리</p>
            </div>
          </div>
          
          {pendingStores.length > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{pendingStores.length}개 승인 대기</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 lg:w-64`}>
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                    return (
                  <Button
                    key={item.id}
                    variant={activeMenu === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      if (item.id === 'home') {
                        setActiveMenu('home');
                      } else {
                        router.push(item.href);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                    );
                  })}
            </div>
                </div>
                
          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
              </div>
            </div>
      </div>


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
              <Label>기기명</Label>
              <Input 
                {...deviceForm.register('deviceName', { required: '기기명을 입력해주세요' })}
                placeholder="예: 갤럭시 S25"
              />
              {deviceForm.formState.errors.deviceName && (
                <p className="text-sm text-destructive">
                  {deviceForm.formState.errors.deviceName.message}
                </p>
              )}
              
              <Label>모델명</Label>
              <Input 
                {...deviceForm.register('modelName', { required: '모델명을 입력해주세요' })}
                placeholder="예: SM-S931N"
              />
              {deviceForm.formState.errors.modelName && (
                <p className="text-sm text-destructive">
                  {deviceForm.formState.errors.modelName.message}
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
              <Label>기기명</Label>
              <Input 
                {...editForm.register('deviceName', { required: '기기명을 입력해주세요' })}
                placeholder="예: 갤럭시 S25"
              />
              {editForm.formState.errors.deviceName && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.deviceName.message}
                </p>
              )}
              
              <Label>모델명</Label>
              <Input 
                {...editForm.register('modelName', { required: '모델명을 입력해주세요' })}
                placeholder="예: SM-S931N"
              />
              {editForm.formState.errors.modelName && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.modelName.message}
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