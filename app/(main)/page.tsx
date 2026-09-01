"use client";
import { getLandingRoute } from "@/constants/permission";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const page = () => {
  const router = useRouter();
  const permissions = useSelector(
    (state: RootState) => state.admin.loggedInUser.permissions || [],
  );

  useEffect(() => {
    router.replace(getLandingRoute(permissions));
  }, [permissions, router]);

  return null;
};

export default page;
