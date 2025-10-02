import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Eye,
  AlertTriangle,
  ArrowLeft,
  X,
  MapPin,
  Phone,
  Calendar,
  Building
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  business_license: string;
  business_description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
}

interface Store {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  address: string;
  address_detail: string;
  latitude: number;
  longitude: number;
  phone: string;
  business_number: string;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  review_count: number;
  view_count: number;
  facilities: string[] | null;
  special_services: string[] | null;
  created_at: string;
  updated_at: string;
  hours: {
    sunday: string;
    weekday: string;
    saturday: string;
  };
  images: string[];
}

export default function StoreManagement() {
  const router = useRouter();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(false);

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
          if (error.code === 'PGRST205') {
            console.log('seller_applications 테이블이 없습니다. 빈 배열로 설정합니다.');
            setApplications([]);
            setIsLoading(false);
            return;
          }
          setApplications([]);
          setIsLoading(false);
          return;
        }

        setApplications(data || []);
      } catch (error) {
        console.error('판매자 신청 데이터 조회 오류:', error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerApplications();
  }, []);



  const handleViewStore = async (application: SellerApplication) => {
    setIsLoadingStore(true);
    try {
      // seller_id로 stores 테이블에서 매장 정보 조회
      const { data: storeData, error } = await supabase
        .from('stores')
        .select('*')
        .eq('seller_id', application.user_id)
        .single();

      if (error) {
        console.error('매장 정보 조회 실패:', error);
        alert('매장 정보를 찾을 수 없습니다.');
        return;
      }

      if (storeData) {
        setSelectedStore(storeData);
        setIsModalOpen(true);
      } else {
        alert('등록된 매장이 없습니다.');
      }
    } catch (error) {
      console.error('매장 정보 조회 오류:', error);
      alert('매장 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingStore(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

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
              매장 관리
            </h1>
          </div>
        </div>
        
        {pendingApplications.length > 0 && (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{pendingApplications.length}개 승인 대기</span>
          </Badge>
        )}
      </div>


      {/* Store List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            판매자 목록 ({isLoading ? '로딩 중...' : applications.length})
          </h3>
          <div className="flex space-x-2">
            <Badge variant="destructive">{pendingApplications.length}개 승인 대기</Badge>
            <Badge variant="default">{approvedApplications.length}개 승인됨</Badge>
            <Badge variant="outline">{rejectedApplications.length}개 거부됨</Badge>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사업자명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.contact_name}</TableCell>
                  <TableCell>{application.contact_email}</TableCell>
                  <TableCell>{application.contact_phone}</TableCell>
                  <TableCell>{application.business_license}</TableCell>
                  <TableCell className="max-w-xs truncate">{application.business_address}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        application.status === 'approved' ? 'default' : 
                        application.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {application.status === 'approved' ? '승인됨' : 
                       application.status === 'pending' ? '승인 대기' : '거부됨'}
                    </Badge>
                  </TableCell>
                  <TableCell>{application.created_at.split('T')[0]}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewStore(application)}
                        title="매장 정보 보기"
                        disabled={isLoadingStore}
                      >
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

      {/* 매장 정보 모달 */}
      {isModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                {selectedStore.name} 정보
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">매장명</h3>
                  <p className="text-gray-700">{selectedStore.name}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">사업자등록번호</h3>
                  <p className="text-gray-700">{selectedStore.business_number}</p>
                </div>
              </div>

              {/* 매장 설명 */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">매장 설명</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {selectedStore.description}
                </p>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">연락처 정보</h3>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{selectedStore.phone}</span>
                </div>
              </div>

              {/* 주소 정보 */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">주소</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-gray-700">{selectedStore.address}</p>
                    {selectedStore.address_detail && (
                      <p className="text-gray-600 text-sm mt-1">{selectedStore.address_detail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 영업시간 */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">영업시간</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">평일</p>
                    <p className="text-gray-700">{selectedStore.hours.weekday}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">토요일</p>
                    <p className="text-gray-700">{selectedStore.hours.saturday}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">일요일</p>
                    <p className="text-gray-700">{selectedStore.hours.sunday}</p>
                  </div>
                </div>
              </div>

              {/* 상태 및 등록일 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">상태</h3>
                  <div className="flex gap-2">
                    <Badge variant={selectedStore.is_active ? 'default' : 'destructive'}>
                      {selectedStore.is_active ? '활성' : '비활성'}
                    </Badge>
                    {selectedStore.is_verified && (
                      <Badge variant="secondary">인증됨</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">등록일</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedStore.created_at.split('T')[0]}</span>
                  </div>
                </div>
              </div>

              {/* 통계 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-2xl font-bold text-blue-600">{selectedStore.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">평점</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-2xl font-bold text-green-600">{selectedStore.review_count}</p>
                  <p className="text-sm text-gray-600">리뷰 수</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-2xl font-bold text-purple-600">{selectedStore.view_count}</p>
                  <p className="text-sm text-gray-600">조회 수</p>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">위치 정보</h3>
                <p className="text-sm text-gray-600">
                  위도: {selectedStore.latitude}, 경도: {selectedStore.longitude}
                </p>
              </div>

              {/* 매장 이미지 */}
              {selectedStore.images && selectedStore.images.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">매장 이미지</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedStore.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`매장 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={closeModal}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
