import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import { Star } from 'lucide-react';
import ReviewManagement from '../ReviewManagement';

export default function ReviewManagementTab() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">리뷰 관리</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/admin/reviews')}
        >
          자세히 보기
        </Button>
      </div>
      <ReviewManagement />
    </div>
  );
}
