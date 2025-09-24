import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Camera, Upload, X } from "lucide-react";

interface StoreImageGalleryProps {
  images: string[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
}

export default function StoreImageGallery({
  images,
  onImageUpload,
  onImageRemove,
}: StoreImageGalleryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>매장 사진 ({images.length}/5)</span>
        </CardTitle>
        <div className="space-x-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={images.length >= 5}
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                사진 추가
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
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
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                  onClick={() => onImageRemove(index)}
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
      </CardContent>
    </Card>
  );
}