import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  MapPin,
  Star,
  Phone,
  TrendingUp,
  Gift,
  ChevronRight,
} from "lucide-react";
import { getPhoneModels } from "../lib/phoneModels";

interface MainScreenProps {
  onSearch: () => void;
  onReviews: () => void;
}

export default function MainScreen({
  onSearch,
  onReviews,
}: MainScreenProps) {
  const phoneModels = getPhoneModels();

  // 추천 폰 3개 (인기 모델들)
  const recommendedPhones = phoneModels
    .filter((phone) => phone.isFavorite)
    .slice(0, 3);

  const handlePhoneSelect = (phone: any) => {
    // 선택한 폰으로 매장 검색으로 이동하는 로직을 여기에 추가
    onSearch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">
            가장 저렴한 휴대폰 매장을
          </h1>
          <h2 className="text-2xl font-bold mb-4">
            쉽고 빠르게 찾아보세요
          </h2>
          <p className="text-blue-100 mb-8">
            내 주변 매장 가격을 한눈에 비교하고
            <br />
            최저가로 휴대폰을 구매하세요
          </p>
          <Button
            onClick={onSearch}
            className="bg-white text-blue-500 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl shadow-lg"
          >
            <MapPin className="h-5 w-5 mr-2 fill-current" />내 주변 매장 찾기
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6 -mt-6">
        {/* 추천 인기 모델 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-400 fill-current" />
                <h3 className="font-semibold">
                  이번 주 인기 모델
                </h3>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-600">
                HOT
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {recommendedPhones.map((phone, index) => (
                <div
                  key={phone.id}
                  className="text-center cursor-pointer group"
                  onClick={() => handlePhoneSelect(phone)}
                >
                  <div className="relative mb-2">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group-hover:shadow-md transition-shadow">
                      <img
                        src={phone.image}
                        alt={phone.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Badge className="text-xs px-1.5 py-0.5 bg-purple-300 text-white">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors">
                    {phone.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {phone.brand === "samsung"
                      ? "삼성"
                      : "애플"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 이벤트 배너 */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-pink-300 to-rose-300">
            <img
              src="https://images.unsplash.com/photo-1741569409778-e7a23b87cfd7?w=400&h=128&fit=crop"
              alt="이벤트 배너"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-between p-6">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">
                    특별 이벤트
                  </span>
                </div>
                <h4 className="font-bold text-lg">
                  신규 가입 혜택
                </h4>
                <p className="text-sm text-pink-100">
                  최대 20만원 할인
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-white fill-current" />
            </div>
          </div>
        </Card>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
            onClick={onReviews}
          >
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
                <Star className="h-6 w-6 text-amber-400 fill-current" />
              </div>
              <h4 className="font-medium mb-2">후기</h4>
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-3 w-3 text-amber-400 fill-current" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-xs text-muted-foreground">
                  (1,234)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-sky-100 rounded-full mx-auto mb-4">
                <Phone className="h-6 w-6 text-sky-400 fill-current" />
              </div>
              <h4 className="font-medium mb-2">고객센터</h4>
              <div className="flex items-center justify-center space-x-1">
                <Badge
                  variant="outline"
                  className="text-xs border-sky-200 text-sky-500 bg-sky-50"
                >
                  카카오채널
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}