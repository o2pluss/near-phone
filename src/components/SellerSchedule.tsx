import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Clock,
  ArrowLeft,
  Calendar,
  Search,
  X,
} from "lucide-react";

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

interface SellerScheduleProps {
  onBack: () => void;
}

// 동적으로 오늘 날짜 생성
const getTodayDate = () =>
  new Date().toISOString().split("T")[0];

const mockReservations: Reservation[] = [
  {
    id: "1",
    customerName: "김고객",
    customerPhone: "010-1234-5678",
    date: getTodayDate(),
    time: "14:30",
    model: "iPhone 15 Pro",
    price: 1200000,
    status: "pending",
    createdAt: "2025-01-20T10:30:00",
  },
  {
    id: "2",
    customerName: "이사용",
    customerPhone: "010-2345-6789",
    date: getTodayDate(),
    time: "11:00",
    model: "Galaxy S24 Ultra",
    price: 980000,
    status: "confirmed",
    createdAt: "2025-01-21T15:20:00",
  },
  {
    id: "3",
    customerName: "박고객",
    customerPhone: "010-3456-7890",
    date: getTodayDate(),
    time: "16:00",
    model: "iPhone 15",
    price: 950000,
    status: "pending",
    createdAt: "2025-01-22T09:15:00",
  },
  {
    id: "4",
    customerName: "최사용",
    customerPhone: "010-4567-8901",
    date: getTodayDate(),
    time: "10:30",
    model: "Galaxy S24",
    price: 850000,
    status: "completed",
    createdAt: "2025-01-18T14:20:00",
  },
  {
    id: "6",
    customerName: "홍길동",
    customerPhone: "010-9876-5432",
    date: getTodayDate(),
    time: "09:30",
    model: "Galaxy S24 Ultra",
    price: 1100000,
    status: "confirmed",
    createdAt: "2025-01-21T08:20:00",
  },
  {
    id: "7",
    customerName: "신고객",
    customerPhone: "010-1111-2222",
    date: getTodayDate(),
    time: "18:00",
    model: "iPhone 15 Pro Max",
    price: 1400000,
    status: "pending",
    createdAt: "2025-01-22T12:15:00",
  },
  {
    id: "8",
    customerName: "정고객",
    customerPhone: "010-5555-6789",
    date: getTodayDate(),
    time: "15:30",
    model: "Galaxy Z Fold5",
    price: 1550000,
    status: "confirmed",
    createdAt: "2025-01-22T13:30:00",
  },
];

export default function SellerSchedule({
  onBack,
}: SellerScheduleProps) {
  const [reservations, setReservations] =
    useState<Reservation[]>(mockReservations);
  const [searchQuery, setSearchQuery] = useState("");

  // 오늘 날짜
  const today = getTodayDate();

  // 검색 필터링 함수
  const filterReservationsBySearch = (
    reservations: Reservation[],
    query: string,
  ) => {
    if (!query.trim()) return reservations;

    const searchTerm = query.toLowerCase().trim();

    return reservations.filter((reservation) => {
      // 고객명으로 검색
      const nameMatch = reservation.customerName
        .toLowerCase()
        .includes(searchTerm);

      // 연락처 뒷자리 4글자로 검색 (010-1234-5678 → 5678)
      const phoneLastFour = reservation.customerPhone.slice(-4);
      const phoneMatch = phoneLastFour.includes(searchTerm);

      return nameMatch || phoneMatch;
    });
  };

  // 당일 예약 필터링 (확정된 예약만)
  let todayConfirmedReservations = reservations.filter(
    (r) => r.date === today && r.status === "confirmed",
  );

  // 검색어가 있으면 검색 필터 적용
  if (searchQuery.trim()) {
    todayConfirmedReservations = filterReservationsBySearch(
      todayConfirmedReservations,
      searchQuery,
    );
  }

  const clearSearch = () => {
    setSearchQuery("");
  };

  // 검색어 하이라이트 함수
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-yellow-200 font-semibold"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            오늘의 예약 스케줄
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
      </div>

      {/* 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>예약 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                placeholder="고객명 또는 연락처 뒷자리 4자리로 검색 (예: 홍길동, 5432)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                /* 검색 실행은 실시간으로 이미 적용됨 */
              }}
              className="px-4"
            >
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>
          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              '
              <span className="font-medium">{searchQuery}</span>
              ' 검색 결과: {todayConfirmedReservations.length}건
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시간대별 스케줄 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {searchQuery
                    ? "검색된 확정 예약"
                    : "확정된 예약"}
                </h3>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-lg px-3 py-1"
            >
              {todayConfirmedReservations.length}건
            </Badge>
          </div>
        </CardContent>
        <CardContent>
          {todayConfirmedReservations.length > 0 ? (
            <div className="space-y-3">
              {/* 시간대별 그룹화 */}
              {(() => {
                // 검색어가 있을 때와 없을 때 다른 로직 적용
                if (searchQuery.trim()) {
                  // 검색 시: 예약이 있는 시간대만 표시 (시간순 정렬)
                  const sortedReservations = [
                    ...todayConfirmedReservations,
                  ].sort((a, b) =>
                    a.time.localeCompare(b.time),
                  );

                  return sortedReservations.map(
                    (reservation, index) => {
                      return (
                        <div
                          key={reservation.id}
                          className="border-b border-border pb-3 last:border-b-0"
                        >
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            {/* HH:MM */}
                            <div className="text-xl font-bold text-primary mb-2">
                              {reservation.time}
                            </div>

                            {/* 고객명 · 연락처 */}
                            <div className="text-base font-medium mb-1">
                              <span>
                                {searchQuery
                                  ? highlightText(
                                      reservation.customerName,
                                      searchQuery,
                                    )
                                  : reservation.customerName}
                              </span>
                              <span className="text-muted-foreground mx-2">
                                ·
                              </span>
                              <span className="text-muted-foreground">
                                {searchQuery
                                  ? highlightText(
                                      reservation.customerPhone,
                                      searchQuery,
                                    )
                                  : reservation.customerPhone}
                              </span>
                            </div>

                            {/* 모델명 */}
                            <div className="text-muted-foreground mb-1">
                              {reservation.model}
                            </div>

                            {/* 가격 */}
                            <div className="text-right">
                              <span className="font-bold text-blue-600">
                                {reservation.price.toLocaleString()}
                                원
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  );
                } else {
                  // 일반 시간대별 표시
                  const timeSlots = Array.from(
                    { length: 12 },
                    (_, i) => {
                      const hour = i + 9; // 9시부터 20시까지
                      const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
                      const nextTimeSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;

                      const reservationsInSlot =
                        todayConfirmedReservations
                          .filter(
                            (r) =>
                              r.time >= timeSlot &&
                              r.time < nextTimeSlot,
                          )
                          .sort((a, b) =>
                            a.time.localeCompare(b.time),
                          );

                      return {
                        slot: `${timeSlot} - ${nextTimeSlot}`,
                        hour: hour,
                        reservations: reservationsInSlot,
                      };
                    },
                  );

                  return timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 border-b border-border pb-3 last:border-b-0 min-h-[60px]"
                    >
                      {/* 시간대 */}
                      <div className="col-span-3 flex items-center">
                        <div className="text-center">
                          <div className="font-medium text-sm">
                            {slot.hour
                              .toString()
                              .padStart(2, "0")}
                            :00
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ~
                            {(slot.hour + 1)
                              .toString()
                              .padStart(2, "0")}
                            :00
                          </div>
                        </div>
                      </div>

                      {/* 예약 정보 */}
                      <div className="col-span-9">
                        {slot.reservations.length > 0 ? (
                          <div className="space-y-2">
                            {slot.reservations.map(
                              (reservation) => {
                                return (
                                  <div
                                    key={reservation.id}
                                    className="bg-green-50 border border-green-200 rounded-lg p-3"
                                  >
                                    {/* HH:MM */}
                                    <div className="text-lg font-bold text-primary mb-2">
                                      {reservation.time}
                                    </div>

                                    {/* 고객명 · 연락처 */}
                                    <div className="text-sm font-medium mb-1">
                                      <span>
                                        {
                                          reservation.customerName
                                        }
                                      </span>
                                      <span className="text-muted-foreground mx-2">
                                        ·
                                      </span>
                                      <span className="text-muted-foreground">
                                        {
                                          reservation.customerPhone
                                        }
                                      </span>
                                    </div>

                                    {/* 모델명 */}
                                    <div className="text-muted-foreground text-sm mb-1">
                                      {reservation.model}
                                    </div>

                                    {/* 가격 */}
                                    <div className="text-right">
                                      <span className="font-bold text-blue-600">
                                        {reservation.price.toLocaleString()}
                                        원
                                      </span>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center h-full text-muted-foreground text-sm">
                            예약 없음
                          </div>
                        )}
                      </div>
                    </div>
                  ));
                }
              })()}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">
                {searchQuery
                  ? "검색 결과가 없습니다"
                  : "확정된 예약이 없습니다"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? (
                  <>
                    '
                    <span className="font-medium">
                      {searchQuery}
                    </span>
                    ' 검색어에 해당하는 확정 예약이 없습니다.
                    <br />
                    다른 검색어를 시도해보세요.
                  </>
                ) : (
                  <>
                    오늘 확정된 예약이 없습니다.
                    <br />
                    예약 관리에서 대기 중인 예약을 확인해보세요.
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}