'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import DashboardLayout from '@/components/dashboard-layout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}