// app/adminsetting/page.tsx   (or wherever your AdminSetting page is)

"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import AdminSetting from "../adminsetting/page";
import { useEffect } from "react";
import LoadingState from "@/components/LoadingState";

export default function AdminSettingPage() {
  const router = useRouter();
  const permissions = 
    useSelector((state: RootState) => state.admin.loggedInUser.permissions || [])
  ;

  const hasAdminSettingAccess = permissions.includes("Admin Setting");

  // Redirect if no permission
  useEffect(() => {
    if (!hasAdminSettingAccess) {
      router.replace("/broadcast"); // or "/unauthorized"
    }
  }, [hasAdminSettingAccess, router]);

  // Optional: Show nothing or a loader while checking
  if (!hasAdminSettingAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  // User has permission → render the full page
  return <AdminSetting />;
}
