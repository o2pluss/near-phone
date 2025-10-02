"use client";

import React from "react";

interface SellerDashboardMainProps {
  children: React.ReactNode;
}

export default function SellerDashboardMain({
  children,
}: SellerDashboardMainProps) {

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="w-full p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}