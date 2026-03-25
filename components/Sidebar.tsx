"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavLinks } from "@/assets/links";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/redux/slices/adminslice";
import { RootState } from "@/redux/store";
import { NAV_PERMISSIONS } from "@/constants/permission";
import { ChevronRight, ChevronRightIcon } from "lucide-react";

type SidebarProps = {
  onNavigate?: (label: string) => void;
};

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const path = usePathname();
  const dispatch = useDispatch();

  const permissions = useSelector(
    (state: RootState) => state.admin.loggedInUser.permissions || [],
  );

  const hasPermission = (featureName: string) => {
    const required = NAV_PERMISSIONS[featureName];
    return permissions.includes(required);
  };

  const visibleLinks = NavLinks.filter((item: any) => {
    if (
      item.name === "Change Password" ||
      item.name === "Overview" ||
      item.name === "Sellers Store" ||
      item.name === "Products" ||
      item.name === "Events" ||
      item.name === "Orders" ||
      item.name === "Payouts" ||
      item.name === "Hire" ||
      item.name === "Buyers" ||
      item.name === "Wallet" ||
      item.name === "Moderation"
    ) {
      return true;
    }

    return hasPermission(item.name);
  });

  // Separate links into Platform and Digital Store sections
  const platformLinks = visibleLinks.filter((item: any) =>
    [
      "Broadcast",
      "Users",
      "Challenge",
      "Campaign",
      "Payments",
      "Performance",
      "Report",
      "Investments",
      "Forum",
    ].includes(item.name),
  );

  const digitalStoreLinks = visibleLinks.filter((item: any) =>
    [
      "Overview",
      "Sellers Store",
      "Products",
      "Events",
      "Orders",
      "Payouts",
      "Hire",
      "Buyers",
      "Moderation",
    ].includes(item.name),
  );

  const settingsLinks = visibleLinks.filter((item: any) =>
    [
      "Admin Setting",
      "Change Password",
      "Access Control",
      // "Code Generator",
    ].includes(item.name),
  );

  const renderNavLink = (item: any) => {
    const isActive =
      (path.includes(`${item.href}`) && item.href !== "/") ||
      (item.href === "/" && path === "/");
    const pathColor = isActive ? "#F75803" : "#A4A4A4";

    if (item.accordion) {
      return (
        <Accordion key={item.href} type="single" collapsible className="w-full">
          <AccordionItem className="border-none" value="item-1">
            <AccordionTrigger
              className={cn(
                "flex hover:no-underline items-center justify-between py-2.5 px-3 w-full text-[14px] INT400 font-normal",
                isActive
                  ? "bg-[#FFEEE6] text-[#F75803]"
                  : "text-[#A4A4A4] text-[#808080] hover:text-[#808080]/80",
              )}
            >
              <span className="flex items-center gap-3">
                {React.cloneElement(item.icon, {
                  className: "h-5 w-5",
                  pathColor,
                })}
                {item.name}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col px-3 py-2 gap-1">
              {item.sublink.map((sublink: any) => {
                const isSubActive = path === sublink.href;
                return (
                  <Link
                    key={sublink.href}
                    className={cn(
                      "py-2 pl-4 text-[13px] INT400 transition-colors rounded-[12px]",
                      isSubActive
                        ? "text-[#808080] bg-[#F7F7F7]"
                        : "text-[#A4A4A4] hover:text-[#808080]",
                    )}
                    href={sublink.href}
                    onClick={() => onNavigate?.(sublink.title)}
                  >
                    {sublink.title}
                  </Link>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center justify-between text-[14px] INT400 py-2.5 px-3 transition-colors rounded-sm",
          isActive ? "bg-[#FFEEE6] text-[#F75803]" : "bg-none text-[#808080] hover:text-[#808080]/80",
        )}
        onClick={() => onNavigate?.(item.name)}
      >
        <span className="flex items-center gap-3">
          {React.cloneElement(item.icon, {
            className: "h-5 w-5",
            pathColor,
          })}
          {item.name}
        </span>
        {item.accordion && <ChevronRight className="h-4 w-4" />}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {/* Platform Section */}
        {platformLinks.length > 0 && (
          <div className="space-y-1">
            <p className="text-[14px] INT500 font-medium text-[#C8C8C8] uppercase tracking-wider px-1 mb-3">
              PLATFORM
            </p>
            <div className="space-y-0.5">
              {platformLinks.map(renderNavLink)}
            </div>
          </div>
        )}

        {/* Digital Store Section */}
        {digitalStoreLinks.length > 0 && (
          <div className="space-y-1">
            <p className="text-[14px] INT500  text-[#C8C8C8] uppercase tracking-wider px-1 mb-3">
              DIGITAL STORE
            </p>
            <div className="space-y-0.5">
              {digitalStoreLinks.map(renderNavLink)}
            </div>
          </div>
        )}

        {/* Settings Links */}
        {settingsLinks.length > 0 && (
          <div className="space-y-0.5 ">{settingsLinks.map(renderNavLink)}</div>
        )}
      </div>

      {/* Logout Button */}
      <div className="px-3 py-4 ">
        <button
          onClick={() => {
            dispatch(clearUser());
          }}
          className="flex items-center gap-2 w-full  text-[#C83532] INT500 text-[14px] font-medium hover:bg-[#FAFAFA] transition-all active:scale-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.16671 18.3327C3.70647 18.3327 3.33337 17.9596 3.33337 17.4993V2.49935C3.33337 2.03912 3.70647 1.66602 4.16671 1.66602H15.8334C16.2936 1.66602 16.6667 2.03912 16.6667 2.49935V4.99935H15V3.33268H5.00004V16.666H15V14.9993H16.6667V17.4993C16.6667 17.9596 16.2936 18.3327 15.8334 18.3327H4.16671ZM15 13.3327V10.8327H9.16671V9.16602H15V6.66602L19.1667 9.99935L15 13.3327Z"
              fill="#C83532"
            />
          </svg>

          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
