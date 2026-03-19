"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { AeonikFont, RecoletaFont } from "@/utils/customFonts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.admin.loggedInUser);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className={`${AeonikFont.className} ${RecoletaFont.variable}`}>
      <div className="px-4 min-h-screen flex flex-col">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
        <div className="flex flex-grow">
          <div className="hidden md:flex sticky top-12 w-[270px] py-4  border-r h-[calc(100vh-3rem)] overflow-hidden">
            <div className="overflow-y-scroll overflow-x-hidden h-full scrollbar-hide">
              <Sidebar />
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
                <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
              </div>
            </div>
          </div>
          <div className="p-5 w-full">{children}</div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
