"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DashboardComponent = dynamic(
  () => import('@/components/pages/dashboard/dashboard/dashboard'),
  { ssr: false }
);

export default function AdminDashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading dashboard…</div>}>
        <DashboardComponent />
      </Suspense>
    </div>
  );
}
