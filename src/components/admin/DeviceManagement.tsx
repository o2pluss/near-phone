import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Package, 
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { getDeviceModels, type DeviceModel } from '../../lib/api/deviceModels';
import { 
  CARRIER_LABELS, 
  MANUFACTURER_LABELS, 
  STORAGE_LABELS 
} from '../../lib/constants/codes';

export default function DeviceManagement() {
  const router = useRouter();
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 단말기 모델 데이터 로드
  const fetchDeviceModels = async () => {
    try {
      setIsLoading(true);
      const response = await getDeviceModels(1, 50); // 페이지네이션 없이 모든 데이터 로드
      setDeviceModels(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('단말기 모델 데이터 로드 실패:', error);
      setDeviceModels([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceModels();
  }, []);

  const handleDeviceModelDelete = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/device-models/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('단말기 모델 삭제에 실패했습니다.');
      }

      await fetchDeviceModels();
    } catch (error) {
      console.error('단말기 모델 삭제 실패:', error);
      alert('단말기 모델 삭제에 실패했습니다.');
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
              단말기 관리
            </h1>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          단말기 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-xs text-muted-foreground">등록된 단말기</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">단말기 목록 ({totalCount})</h3>
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
              {(deviceModels || []).length === 0 ? (
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
                (deviceModels || []).map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {device.imageUrl ? (
                        <img 
                          src={device.imageUrl} 
                          alt={device.deviceName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{MANUFACTURER_LABELS[device.manufacturer as keyof typeof MANUFACTURER_LABELS] || device.manufacturer || '알 수 없음'}</TableCell>
                  <TableCell className="font-medium">{device.deviceName}</TableCell>
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
      </div>
    </div>
  );
}
