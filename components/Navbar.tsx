"use client";
import { RootState } from "@/redux/store";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";
import { getLandingRoute } from "@/constants/permission";
import { DesignIcon } from "./sales/DesignIcon";

type NavbarProps = {
  onMenuToggle?: () => void;
  salesLayout?: boolean;
};

const Navbar = ({ onMenuToggle, salesLayout = false }: NavbarProps) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.admin.loggedInUser);

  return (
    <div className={`${salesLayout ? "mr-2 h-[88px] pt-10 pb-[15px] border-[#F1F1F1]" : "pt-[40px] pb-4"} sticky top-0 flex items-center bg-white justify-between border-b z-30`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 rounded-md border border-transparent hover:bg-[#F7F7F7]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-[#111810]" />
        </button>
        <div
          className="cursor-pointer"
          onClick={() => {
            router.push(getLandingRoute(user.permissions));
          }}
        >
          {salesLayout ? <img src="/icons/sales/logo.svg" width={166.48} height={32.38} alt="Dream Planet Admin Portal" className="shrink-0" /> : <Image
            src={"/DASHBOARDASSETS/LOGO/DASHBOARD LOGO.svg"}
            width={184}
            height={24}
            alt="Logo"
          />}
        </div>
      </div>
      {salesLayout ? <div className="flex items-center gap-4">
        <DesignIcon name="nav-search" size={20} />
        <DesignIcon name="bell" size={20} />
        <span aria-label={`${user?.first_name || "Admin"} ${user?.last_name || ""}`} className="INT500 flex h-5 w-5 items-center justify-center rounded-full bg-[#FCE7F3] text-[10px] text-[#DB2777]">{user?.first_name?.slice(0, 1).toUpperCase() || "A"}</span>
      </div> : <div className="flex items-center space-x-1">
        <div className="flex items-center space-x-3">
          <Image
            src={"/DASHBOARDASSETS/ICONS/NOTIFICATION [TOP BAR].svg"}
            width={24}
            height={24}
            alt="notificationIcon"
          />
          <Image
            src={"/DASHBOARDASSETS/ICONS/PROFILE [TOP BAR].svg"}
            width={24}
            height={24}
            alt="profileIcon"
          />
        </div>

        <h2 className="leading-[16.8px] text-[14px]">{user?.first_name} {user?.last_name}</h2>
      </div>}
    </div>
  );
};

export default Navbar;
