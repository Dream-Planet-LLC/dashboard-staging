"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
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
import {
  hasPermission,
} from "@/constants/permission";
import { ChevronRight, ChevronRightIcon } from "lucide-react";
import { DesignIcon } from "./sales/DesignIcon";

const salesSidebarIcons: Record<string, string> = {
  Broadcast: "broadcast", Users: "users", Challenge: "challenge", Payments: "payments",
  Performance: "performance", Report: "report", Investments: "investments", Forum: "forum",
  Overview: "overview", "Sellers Store": "sellers-store", Products: "products", Events: "events",
  Orders: "orders", Listings: "listings", Categories: "categories", Payouts: "payouts",
  Withdrawal: "withdrawal", Hire: "hire", Buyers: "buyers", Moderation: "moderation",
  "Admin Setting": "admin", "Change Password": "password",
};

type SidebarProps = {
  onNavigate?: (label: string) => void;
};

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const path = usePathname();
  const isSalesRoute = ["/orders", "/listings", "/categories", "/shipping"].some((route) => path === route || path.startsWith(`${route}/`));
  const dispatch = useDispatch();
  const navScroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!path.startsWith("/shipping")) return;
    const scroller = navScroller.current;
    const activeLink = scroller?.querySelector<HTMLAnchorElement>('a[href="/shipping"]');
    if (scroller && activeLink) {
      const overflow = activeLink.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom;
      if (overflow > 0) scroller.scrollTop += overflow + 24;
    }
  }, [path]);

  const permissions = useSelector(
    (state: RootState) => state.admin.loggedInUser.permissions || [],
  );

  const visibleLinks = NavLinks.filter((item: any) => {
    if (item.name === "Change Password") {
      return true;
    }

    return hasPermission(permissions, item.permission ?? item.name);
  });

  // Group links by the area of the dashboard they belong to.
  const platformLinks = visibleLinks.filter((item: any) =>
    [
      "Broadcast",
      "Users",
      "Challenge",
      "Invest (campaign)",
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
      "Payouts",
      "Withdrawal",
      "Hire",
      "Buyers",
      "Moderation",
    ].includes(item.name),
  );

  const salesLinks = visibleLinks.filter((item: any) => item.section === "sales");

  const settingsLinks = visibleLinks.filter((item: any) =>
    [
      "Admin Setting",
      "Change Password",
      "Access Control",
      // "Code Generator",
    ].includes(item.name),
  );

  const engagementLinks = visibleLinks.filter(
    (item: any) => item.section === "engagement",
  );

  const renderNavLink = (item: any) => {
    const isActive =
      (item.href !== "/" &&
        (path === item.href || path.startsWith(`${item.href}/`))) ||
      (item.href === "/" && path === "/");
    const pathColor = isSalesRoute ? "#111810" : isActive ? "#F75803" : "#A4A4A4";

    const icon = isSalesRoute && salesSidebarIcons[item.name]
      ? <DesignIcon name={salesSidebarIcons[item.name]} size={20} />
      : React.cloneElement(item.icon, { className: "h-5 w-5", pathColor });

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
                isSalesRoute && "h-10 py-2 text-[16px] font-medium leading-6 tracking-[-0.015em] text-[#808080] [&>svg]:hidden",
              )}
            >
              <span className="flex items-center gap-3">
                {icon}
                {item.label ?? item.name}
              </span>
              {isSalesRoute && <DesignIcon name="nav-chevron" size={16} />}
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
          isSalesRoute && "h-10 py-2 text-[16px] font-medium leading-6 tracking-[-0.015em]",
          isSalesRoute && isActive && "rounded-xl bg-[#F7F7F7] text-[#111810]",
        )}
        onClick={() => onNavigate?.(item.name)}
      >
        <span className="flex items-center gap-3">
          {icon}
          {item.label ?? item.name}
        </span>
        {item.accordion && <ChevronRight className="h-4 w-4" />}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div ref={navScroller} className={cn("flex-1 overflow-y-auto space-y-6", isSalesRoute ? "py-6" : "py-4")}>
        {/* Platform Section */}
        {platformLinks.length > 0 && (
          <div className="space-y-1">
            <p className="text-[14px] INT500 font-medium text-[#C8C8C8] uppercase tracking-[0.06em] px-0 mb-4">
              PLATFORM
            </p>
            <div className={isSalesRoute ? "space-y-3" : "space-y-0.5"}>
              {platformLinks.map(renderNavLink)}
            </div>
          </div>
        )}

        {/* Digital Store Section */}
        {digitalStoreLinks.length > 0 && (
          <div className="space-y-1">
            <p className="text-[14px] INT500  text-[#C8C8C8] uppercase tracking-[0.06em] px-0 mb-4">
              DIGITAL STORE
            </p>
            <div className={isSalesRoute ? "space-y-3" : "space-y-0.5"}>
              {digitalStoreLinks.map(renderNavLink)}
            </div>
          </div>
        )}

        {salesLinks.length > 0 && (
          <div className="space-y-1">
            <p className="px-0 mb-4 text-[14px] INT500 font-medium text-[#C8C8C8] uppercase tracking-wider">
              SALES
            </p>
            <div className={isSalesRoute ? "space-y-3" : "space-y-0.5"}>{salesLinks.map(renderNavLink)}</div>
          </div>
        )}

        {engagementLinks.length > 0 && (
          <div className="space-y-1">
            <p className="px-0 mb-4 text-[14px] INT500 font-medium text-[#C8C8C8] uppercase tracking-wider">
              ENGAGEMENT
            </p>
            <div className={isSalesRoute ? "space-y-3" : "space-y-0.5"}>
              {engagementLinks.map(renderNavLink)}
            </div>
          </div>
        )}

        {/* Settings Links */}
        {settingsLinks.length > 0 && (
          <div className="space-y-0.5 ">{settingsLinks.map(renderNavLink)}</div>
        )}
      </div>

      {/* Logout Button */}
      <div className="px-3 py-4 my-2">
        <button
          onClick={() => {
            dispatch(clearUser());
          }}
          className="flex items-center gap-2 w-full  text-[#C83532] INT500 text-[14px] font-medium hover:bg-[#FAFAFA] transition-all active:scale-95"
        >
          {isSalesRoute ? <DesignIcon name="logout" size={20} /> : (
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
          )}


          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
