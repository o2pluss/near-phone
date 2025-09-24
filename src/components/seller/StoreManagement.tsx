import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Edit } from "lucide-react";
import StoreImageGallery from "./StoreImageGallery";

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
    holiday: string;
  };
  images: string[];
}

interface StoreManagementProps {
  storeInfo: StoreInfo;
  storeImages: string[];
  onEditClick: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
}

export default function StoreManagement({
  storeInfo,
  storeImages,
  onEditClick,
  onImageUpload,
  onImageRemove,
}: StoreManagementProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>매장 정보</CardTitle>
          <Button onClick={onEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </Button>
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
            <div>
              <Label>예외 영업시간</Label>
              <p className="font-medium">
                {storeInfo.hours.holiday}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StoreImageGallery
        images={storeImages}
        onImageUpload={onImageUpload}
        onImageRemove={onImageRemove}
      />
    </div>
  );
}