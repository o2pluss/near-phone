'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SellerPageHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function SellerPageHeader({ 
  title, 
  showBackButton = true 
}: SellerPageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/seller');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
    </div>
  );
}
