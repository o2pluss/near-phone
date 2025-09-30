"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, Upload, X, AlertCircle } from "lucide-react";
import { StoreInfo, getCurrentUserStore, createStore, updateStore, getSellerApplication } from "@/lib/store";
import OperatingHoursEditor, { OperatingHours } from "@/components/seller/OperatingHoursEditor";
import SellerPageHeader from "@/components/seller/SellerPageHeader";
import AddressSearch from "@/components/AddressSearch";

function StoreEditPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('mode') === 'edit';
  
  const [formData, setFormData] = useState<StoreInfo>({
    name: "",
    description: "",
    address: "",
    address_detail: "",
    phone: "",
    business_number: "",
    hours: {
      weekday: "09:00 - 18:00",
      saturday: "09:00 - 18:00",
      sunday: "휴무",
    },
    images: [],
    latitude: undefined,
    longitude: undefined,
  });

  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    sunday: { isOpen: false }
  });

  const [originalImages, setOriginalImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 영업시간 데이터 변환 함수들
  const convertToOperatingHours = (hours: any): OperatingHours => {
    const result: OperatingHours = {};
    
    // 기존 데이터가 있으면 변환
    if (hours.weekday) {
      const weekdayData = parseTimeString(hours.weekday);
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        result[day] = weekdayData;
      });
    }
    
    if (hours.saturday) {
      result.saturday = parseTimeString(hours.saturday);
    }
    
    if (hours.sunday) {
      result.sunday = parseTimeString(hours.sunday);
    }
    
    return result;
  };

  const parseTimeString = (timeStr: string) => {
    if (timeStr === '휴무' || timeStr === '휴무일') {
      return { isOpen: false };
    }
    
    const match = timeStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (match) {
      return {
        isOpen: true,
        openTime: match[1],
        closeTime: match[2]
      };
    }
    
    return { isOpen: true, openTime: '09:00', closeTime: '18:00' };
  };

  const convertFromOperatingHours = (operatingHours: OperatingHours) => {
    const result: any = {};
    
    // 평일 (월~금) - 첫 번째 요일의 설정을 사용
    const weekdayData = operatingHours.monday || operatingHours.tuesday || operatingHours.wednesday || operatingHours.thursday || operatingHours.friday;
    if (weekdayData) {
      result.weekday = weekdayData.isOpen 
        ? `${weekdayData.openTime} - ${weekdayData.closeTime}`
        : '휴무';
    }
    
    // 토요일
    const saturdayData = operatingHours.saturday;
    if (saturdayData) {
      result.saturday = saturdayData.isOpen 
        ? `${saturdayData.openTime} - ${saturdayData.closeTime}`
        : '휴무';
    }
    
    // 일요일
    const sundayData = operatingHours.sunday;
    if (sundayData) {
      result.sunday = sundayData.isOpen 
        ? `${sundayData.openTime} - ${sundayData.closeTime}`
        : '휴무';
    }
    
    
    return result;
  };

  // 매장 정보 로드
  const loadStoreInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEdit) {
        // 수정 모드: 기존 매장 정보 로드
        const { data: existingStore, error: storeError } = await getCurrentUserStore();
        
        if (storeError) {
          console.error('매장 정보 조회 오류:', storeError);
          setError('매장 정보를 불러오는데 실패했습니다.');
          return;
        }

        if (existingStore) {
          setFormData(existingStore);
          setOriginalImages(existingStore.images || []);
          setOperatingHours(convertToOperatingHours(existingStore.hours));
        } else {
          setError('매장 정보를 찾을 수 없습니다.');
        }
      } else {
        // 등록 모드: 판매자 신청 정보에서 기본값 가져오기
        const { data: applicationData } = await getSellerApplication();
        
        if (applicationData) {
          setFormData(prev => ({
            ...prev,
            name: applicationData.business_name || '',
            business_number: applicationData.business_license || '',
            phone: applicationData.contact_phone || '',
            address: applicationData.business_address || '',
            description: applicationData.business_description || '',
          }));
        }
      }
    } catch (err) {
      console.error('매장 정보 로드 오류:', err);
      setError('매장 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoreInfo();
  }, [isEdit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleOperatingHoursChange = (newOperatingHours: OperatingHours) => {
    setOperatingHours(newOperatingHours);
    const convertedHours = convertFromOperatingHours(newOperatingHours);
    setFormData(prev => ({
      ...prev,
      hours: convertedHours,
    }));
    
    // 영업시간 에러 메시지 제거
    if (errors.operatingHours) {
      setErrors(prev => ({
        ...prev,
        operatingHours: "",
      }));
    }
  };

  const handleAddressSelect = (address: string, latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      address: address,
      latitude: latitude,
      longitude: longitude,
    }));
    
    // 주소 에러 메시지 제거
    if (errors.address) {
      setErrors(prev => ({
        ...prev,
        address: "",
      }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const filesArray = Array.from(files);
      
      // 매장 ID가 있으면 즉시 서버에 업로드
      if (formData.id) {
        const { uploadStoreImages } = await import('@/lib/imageUpload');
        const { data: uploadedUrls, error: uploadError } = await uploadStoreImages(filesArray, formData.id);
        
        if (uploadError) {
          console.error('이미지 업로드 오류:', uploadError);
          setError('이미지 업로드에 실패했습니다.');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      } else {
        // 매장 ID가 없으면 로컬 URL로 임시 저장 (매장 생성 시 업로드됨)
        const newImages = filesArray.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
      }
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setError('이미지 업로드에 실패했습니다.');
    } finally {
      setIsSaving(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  const handleImageRemove = (index: number) => {
    // UI에서만 제거하고, 서버 삭제는 저장 시에 처리
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "매장명을 입력해주세요.";
    }

    if (!formData.business_number.trim()) {
      newErrors.business_number = "사업자등록번호를 입력해주세요.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "주소를 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "연락처를 입력해주세요.";
    }

    if (!formData.address_detail?.trim()) {
      newErrors.address_detail = "상세 주소를 입력해주세요.";
    }

    // 영업시간 검증 - 최소 하나의 요일은 영업해야 함
    const hasOpenDay = Object.values(operatingHours).some(day => day && day.isOpen);
    if (!hasOpenDay) {
      newErrors.operatingHours = "최소 하나의 요일은 영업해야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (isEdit) {
        // 삭제된 이미지들을 서버에서도 삭제
        const deletedImages = originalImages.filter(img => !formData.images.includes(img));
        if (deletedImages.length > 0) {
          const { deleteStoreImages } = await import('@/lib/imageUpload');
          await deleteStoreImages(deletedImages);
        }

        // 매장 수정
        const { data, error } = await updateStore(formData.id!, formData);
        
        if (error) {
          throw error;
        }
        
        router.push('/seller/store-management');
      } else {
        // 매장 등록
        const { data, error } = await createStore(formData);
        
        if (error) {
          throw error;
        }
        
        router.push('/seller/store-management');
      }
    } catch (err: any) {
      console.error('매장 저장 오류:', err);
      setError(err.message || '매장 정보 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/seller/store-management');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">매장 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerPageHeader title={isEdit ? "매장 정보 수정" : "매장 등록"} />
      <div className="max-w-4xl mx-auto p-6">

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* 기본 정보 */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">매장명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="매장명을 입력하세요"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_number">사업자등록번호 *</Label>
                  <Input
                    id="business_number"
                    value={formData.business_number}
                    onChange={(e) => handleInputChange("business_number", e.target.value)}
                    placeholder="123-45-67890"
                  />
                  {errors.business_number && (
                    <p className="text-sm text-destructive">{errors.business_number}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">매장 설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="제공 서비스, 외관, 주차정보 등"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* 연락처 및 주소 */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">연락처 및 주소</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="02-1234-5678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">주소 *</Label>
                  <AddressSearch
                    value={formData.address}
                    onAddressSelect={handleAddressSelect}
                    placeholder="주소를 검색하세요"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_detail">상세 주소 *</Label>
                <Input
                  id="address_detail"
                  value={formData.address_detail || ""}
                  onChange={(e) => handleInputChange("address_detail", e.target.value)}
                  placeholder="건물명, 층수 등"
                />
                {errors.address_detail && (
                  <p className="text-sm text-destructive">{errors.address_detail}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* 영업시간 */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">영업시간 *</h2>
            </div>
            <OperatingHoursEditor
              value={operatingHours}
              onChange={handleOperatingHoursChange}
            />
            {errors.operatingHours && (
              <p className="text-sm text-destructive">{errors.operatingHours}</p>
            )}
          </div>

          <div className="border-t border-gray-200"></div>

          {/* 매장 사진 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">매장 사진 ({formData.images.length}/5)</h2>
              </div>
              <div className="space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={formData.images.length >= 5 || isSaving}
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isSaving ? '업로드 중...' : '사진 추가'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            
            {formData.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`매장 사진 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 z-10"
                      onClick={() => handleImageRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  아직 업로드된 사진이 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  매장의 모습을 고객에게 보여주세요 (최대 5장)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "저장 중..." : isEdit ? "수정 완료" : "등록 완료"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StoreEditPage() {
  return (
    <Suspense fallback={null}>
      <StoreEditPageInner />
    </Suspense>
  );
}
