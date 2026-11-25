"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LoadingState from "@/components/LoadingState";
import { SalesWorkspace } from "@/components/sales/SalesWorkspace";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { AeonikFont, RecoletaFont } from "@/utils/customFonts";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.admin.loggedInUser);
  const router = useRouter();
  const pathname = usePathname();
  const isSalesRoute = ["/orders", "/listings", "/categories", "/shipping"].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeLoadingMessage, setRouteLoadingMessage] = useState("Loading...");

  useEffect(() => {
    if (!user?.id) {
      router.push("/login");
    }
  }, [user, router]);
  useEffect(() => {
    setIsRouteLoading(false);
  }, [pathname]);
  useEffect(() => {
    if (!isRouteLoading) return;
    const timer = setTimeout(() => {
      setIsRouteLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isRouteLoading]);

  return (
    <div className={`${AeonikFont.className} ${RecoletaFont.variable}`}>
      <div className="min-h-screen flex flex-col px-4">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
        <div className="flex flex-grow">
          <div className="hidden md:flex sticky shrink-0 border-r overflow-hidden top-12 w-[210px] py-4 h-[calc(100vh-3rem)]">
            <div className="w-full overflow-y-scroll overflow-x-hidden h-full scrollbar-hide">
              <Sidebar
                onNavigate={(label) => {
                  setRouteLoadingMessage(`Loading ${label.toLowerCase()}...`);
                  setIsRouteLoading(true);
                }}
              />
            </div>
          </div>




          <div
            className={cn(
              "fixed inset-0 z-40 md:hidden transition-opacity duration-200",
              isSidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-[270px] bg-white shadow-xl transition-transform duration-300",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="overflow-y-scroll overflow-x-hidden h-full scrollbar-hide py-4">
                <Sidebar
                  onNavigate={(label) => {
                    setIsSidebarOpen(false);
                    setRouteLoadingMessage(`Loading ${label.toLowerCase()}...`);
                    setIsRouteLoading(true);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 p-5 w-full">
            <SalesWorkspace enabled={isSalesRoute}>{isRouteLoading ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingState message={routeLoadingMessage} />
              </div>
            ) : (
              children
            )}</SalesWorkspace>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
