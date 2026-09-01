// components/ProtectedRoute.tsx

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  getLandingRoute,
  hasPermission,
  NAV_PERMISSIONS,
} from "@/constants/permission";

interface Props {
  children: React.ReactNode;
  feature: keyof typeof NAV_PERMISSIONS; 
}

export default function ProtectedRoute({ children, feature }: Props) {
  const permissions = useSelector((state: RootState) => 
    state.admin.loggedInUser.permissions || []
  );
  const router = useRouter();

  const hasAccess = hasPermission(permissions, feature);

  useEffect(() => {
    if (!hasAccess) {
      router.replace(getLandingRoute(permissions));
    }
  }, [hasAccess, permissions, router]);

  if (!hasAccess) return null;

  return <>{children}</>;
}
