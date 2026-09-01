"use client";

import { canAccessPath, getLandingRoute } from "@/constants/permission";
import { RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const SessionAccessController = () => {
  const user = useSelector((state: RootState) => state.admin.loggedInUser);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user.id || canAccessPath(user.permissions, pathname)) {
      return;
    }

    router.replace(getLandingRoute(user.permissions));
  }, [pathname, router, user.id, user.permissions]);

  return null;
};

export default SessionAccessController;
