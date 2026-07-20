"use client"

import { Toaster } from "@/components/ui/toaster";
import { RootState } from "@/redux/store";
import { AeonikFont, RecoletaFont } from "@/utils/customFonts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  
    const user = useSelector((state: RootState) => state.admin.loggedInUser);
    const router = useRouter();
  
    useEffect(() => {
      if (user?.id) {
        router.push("/overview");
      }
    }, [user, router]);

  return (
    <div className={`${AeonikFont.className} ${RecoletaFont.variable}`}>
      
          {children}
          <Toaster />
    </div>
  );
};

export default MainLayout;
