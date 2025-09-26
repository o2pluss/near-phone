'use client';

import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Store, Package, Users, Star, Smartphone, CalendarDays, Building2, Package2, Users2, StarIcon, Smartphone as SmartphoneIcon } from 'lucide-react';
import Link from 'next/link';

export default function SellerPage() {

  return (
    <SellerDashboardMain>
      <div className="space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <Link href="/seller/store-management">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <Building2 className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">매장 관리</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/seller/products">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <Package2 className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">상품 관리</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/seller/reservations">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <CalendarDays className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">예약 관리</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/seller/users">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <Users2 className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">회원 관리</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/seller/reviews">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <StarIcon className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">리뷰 관리</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/seller/schedule">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <CalendarDays className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">스케줄</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/seller/devices">
             <Card className="hover:shadow-md transition-shadow cursor-pointer">
               <CardContent className="p-6">
                 <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                   <SmartphoneIcon className="h-8 w-8 text-slate-400" />
                   <div>
                     <h3 className="font-semibold text-center md:text-left">단말기 등록</h3>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
         </div>
      </div>
    </SellerDashboardMain>
  );
}
