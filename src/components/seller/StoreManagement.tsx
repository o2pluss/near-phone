import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Camera } from "lucide-react";

interface StoreInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  businessNumber: string;
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
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>매장 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>매장명</Label>
              <p className="font-medium">
                {storeInfo.name}
              </p>
            </div>
            <div>
              <Label>사업자등록번호</Label>
              <p className="font-medium">
                {storeInfo.businessNumber}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label>매장 설명</Label>
              <p className="text-muted-foreground">
                {storeInfo.description}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label>주소</Label>
              <p className="font-medium">
                {storeInfo.address}
              </p>
            </div>
            <div>
              <Label>연락처</Label>
              <p className="font-medium">
                {storeInfo.phone}
              </p>
            </div>
            <div>
              <Label>평일 영업시간 (월~금)</Label>
              <p className="font-medium">
                {storeInfo.hours.weekday}
              </p>
            </div>
            <div>
              <Label>토요일 영업시간</Label>
              <p className="font-medium">
                {storeInfo.hours.saturday}
              </p>
            </div>
            <div>
              <Label>일요일 영업시간</Label>
              <p className="font-medium">
                {storeInfo.hours.sunday}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 매장 사진 갤러리 */}
      {storeImages && storeImages.length > 0 && (
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
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`매장 사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}