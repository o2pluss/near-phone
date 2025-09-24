"use client";

import ReviewListPage from "@/components/ReviewListPage";
import { useRouter } from "next/navigation";

export default function ReviewsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <ReviewListPage onBack={handleBack} />
  );
}