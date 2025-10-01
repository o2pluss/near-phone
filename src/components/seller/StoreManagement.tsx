import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Camera, MapPin, Building2, Phone, BadgeCheck, Info, Clock } from "lucide-react";

interface StoreInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  address_detail?: string;
  phone: string;
  business_number: string;
  hours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  images: string[];
}

interface StoreManagementProps {
  storeInfo: StoreInfo;
  storeImages: string[];
}

export default function StoreManagement({
  storeInfo,
  storeImages,
}: StoreManagementProps) {
  const thumbnail = storeImages && storeImages.length > 0 ? storeImages[0] : null;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 border">
              {thumbnail ? (
                <img src={thumbnail} alt="매장 썸네일" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="truncate">{storeInfo.name}</CardTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs">
                  <BadgeCheck className="h-3 w-3" /> 사업자 {storeInfo.business_number}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
              <Info className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="min-w-0">
                <Label className="text-xs text-gray-500">매장 설명</Label>
                <p className="font-medium">{storeInfo.description || '설명이 없습니다.'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="min-w-0">
                <Label className="text-xs text-gray-500">주소</Label>
                <p className="font-medium break-words">
                  {storeInfo.address}{storeInfo.address_detail && `, ${storeInfo.address_detail}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
              <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="min-w-0">
                <Label className="text-xs text-gray-500">연락처</Label>
                <p className="font-medium">{storeInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-white p-3 md:col-span-2 lg:col-span-3">
              <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="min-w-0 w-full">
                <Label className="text-xs text-gray-500">영업시간</Label>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="rounded-md bg-gray-50 px-3 py-2 border">
                    <p className="text-xs text-gray-500">평일 (월~금)</p>
                    <p className="font-medium">{storeInfo.hours.weekday}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 px-3 py-2 border">
                    <p className="text-xs text-gray-500">토요일</p>
                    <p className="font-medium">{storeInfo.hours.saturday}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 px-3 py-2 border">
                    <p className="text-xs text-gray-500">일요일</p>
                    <p className="font-medium">{storeInfo.hours.sunday}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 매장 사진 갤러리 */}
      {storeImages && storeImages.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>매장 사진 ({storeImages.length}/5)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {storeImages.map((image, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border bg-gray-50">
                  <div className="aspect-square">
                    <img
                      src={image}
                      alt={`매장 사진 ${index + 1}`}
                      className="w-full h-full object-cover transform transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>매장 사진</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="font-medium">등록된 사진이 없습니다</p>
                  <p className="text-sm text-muted-foreground">매장 외관, 내부, 진열 사진 등을 등록해 보세요.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}