"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-off-white flex font-sans text-text-main">
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="p-6 sm:p-8 flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
