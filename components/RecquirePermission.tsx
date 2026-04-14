// components/ProtectedRoute.tsx

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NAV_PERMISSIONS } from "@/constants/permission";

interface Props {
  children: React.ReactNode;
  feature: keyof typeof NAV_PERMISSIONS; 
}

export default function ProtectedRoute({ children, feature }: Props) {
  const permissions = useSelector((state: RootState) => 
    state.admin.loggedInUser.permissions || []
  );
  const router = useRouter();

  const requiredPermission = NAV_PERMISSIONS[feature];
  const hasAccess =
    permissions.includes(NAV_PERMISSIONS.full_access) ||
    permissions.includes("full_access") ||
    permissions.includes(requiredPermission);

  useEffect(() => {
    if (!hasAccess) {
      router.replace("/broadcast");
    }
  }, [hasAccess, router]);

  if (!hasAccess) return null;

  return <>{children}</>;
}
