import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  Store, 
  UserCheck, 
  Ban, 
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

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

export default function StoreManagementTab() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
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
          if (error.code === 'PGRST205') {
            console.log('seller_applications 테이블이 없습니다. 빈 배열로 설정합니다.');
            setStores([]);
            setIsLoading(false);
            return;
          }
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

      // 승인된 경우 profiles 테이블의 is_active를 true로 업데이트
      if (approve) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', application.user_id);

          if (profileError) {
            console.error('프로필 활성화 실패:', profileError);
          } else {
            console.log('프로필 활성화 완료');
          }
        } catch (profileError) {
          console.error('프로필 활성화 중 오류:', profileError);
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

  const pendingStores = stores.filter(store => store.status === 'pending');
  const blockedStores = stores.filter(store => store.status === 'blocked');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          매장 목록 ({isLoading ? '로딩 중...' : stores.length})
        </h3>
        <div className="flex space-x-2">
          <Badge variant="destructive">{pendingStores.length}개 승인 대기</Badge>
          <Badge variant="outline">{blockedStores.length}개 차단됨</Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/stores')}
          >
            자세히 보기
          </Button>
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
    </div>
  );
}
