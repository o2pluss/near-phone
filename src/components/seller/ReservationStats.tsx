import React from "react";
import { Card, CardContent } from "../ui/card";
import { Calendar, Timer, CheckCircle } from "lucide-react";

interface ReservationStatsProps {
  todayStats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  pendingCount: number;
  onTodayClick: () => void;
  onPendingClick: () => void;
  onConfirmedClick: () => void;
}

export default function ReservationStats({
  todayStats,
  pendingCount,
  onTodayClick,
  onPendingClick,
  onConfirmedClick,
}: ReservationStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onTodayClick}
      >
        <CardContent className="p-2 md:p-4">
          <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
            <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-xs md:text-sm text-muted-foreground">
                오늘 예약
              </p>
              <p className="text-lg md:text-xl font-semibold">
                {todayStats.total}건
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onPendingClick}
      >
        <CardContent className="p-2 md:p-4">
          <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
            <div className="p-1 md:p-2 bg-yellow-100 rounded-lg">
              <Timer className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-xs md:text-sm text-muted-foreground">
                대기중
              </p>
              <p className="text-lg md:text-xl font-semibold">
                {pendingCount}건
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onConfirmedClick}
      >
        <CardContent className="p-2 md:p-4">
          <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
            <div className="p-1 md:p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-xs md:text-sm text-muted-foreground">
                확정/완료
              </p>
              <p className="text-lg md:text-xl font-semibold">
                {todayStats.confirmed + todayStats.completed}건
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}