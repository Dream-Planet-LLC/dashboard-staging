"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "@/components/UserTable";
import { forumAnalytics } from "@/mock/row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, SearchIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import useForum from "@/hooks/useForum";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LoadingState from "@/components/LoadingState";

const ForumAnalytics = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const {allForums, forumMembers} = useSelector((state: RootState) => state.forum);
  const {getAllForums, getForumMembers, deleteForumMember, forumLoading, forumSheetLoading, forumPage, setForumPage} = useForum();
  const {hasNextPage, hasPrevPage, limit, page, totalDocs} = useSelector(
    (state: RootState) => state.forum.pagination
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchForum, setSearchForum] = useState('');
  const [forumId, setForumId] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const closeButton = document.querySelector(
        "button.absolute.right-4.top-4"
      );

      if (closeButton) {
        closeButton.remove();
      }
    }, 0); // Delay of 0 ensures it happens after the render cycle

    return () => clearTimeout(timer);
  }, [isSheetOpen, setIsSheetOpen]);

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => {setIsSheetOpen(false)
    setSearchTerm("")
  };
  
  useEffect(() => {
    setForumPage(1);
   getAllForums(searchForum)
  },[searchForum])

  useEffect(() => {
    setForumPage(1);
    getAllForums()
   },[])

  useEffect(() => {
    getAllForums(searchForum)
   },[forumPage])

  useEffect(() => {
    if (!forumLoading) {
      setIsInitialLoading(false);
    }
  }, [forumLoading]);

  useEffect(() => {
    getForumMembers(forumId, searchTerm);
  },[searchTerm])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name of forum",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
    
        if (status === null || status === undefined) {
          return (
            <div className="flex items-center space-x-1 border border-gray-400 bg-gray-100 text-xs font-medium w-max rounded-xl py-1 px-2">
              <p>Null</p>
            </div>
          );
        }
    
        return status === "active" ? (
          <div className="flex items-center space-x-1 border border-[#2BAC47] bg-green-100 text-xs font-medium w-max rounded-xl py-1 px-2">
            <span>
              <Image
                src={"/icons/ActivateIcon.svg"}
                width={10}
                height={10}
                alt="activateIcon"
              />
            </span>
            <p>Activated</p>
          </div>
        ) : (
          <div className="flex items-center space-x-1 border border-[#C83532] bg-red-100 text-xs font-medium w-max rounded-xl py-1 px-2">
            <span>
              <Image
                src={"/icons/DeactivateIcon.svg"}
                width={10}
                height={10}
                alt="deactivateIcon"
              />
            </span>
            <p>Deactivated</p>
          </div>
        );
      },
    },
    
    {
      accessorKey: "noOfMembers",
      header: "No. of members",
    },
    {
      accessorKey: "adminName",
      header: "Admin",
    },
    {
      accessorKey: "createdAt",
      header: "Created date",
      cell: ({ row }) => {
        const createdAt = new Date(row.getValue("createdAt"));
        const formattedDate = createdAt.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
    
        return <p>{formattedDate}</p>;
      }
    },
    {
      accessorKey: "options",
      header: "",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-2">
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={async() => {
                  setForumId(profile?.id);
                  setIsSheetOpen(true);
                 await getForumMembers(profile?.id, searchTerm);
                }}
              >
                <span>
                  <Image
                    src={"/icons/viewmembers.svg"}
                    width={18}
                    height={13}
                    alt="viewmembers"
                    className="mr-2"
                  />
                </span>
                <p>View Members</p>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center space-x-2">
                <span>
                  <Image
                    src={"/icons/activateforum.svg"}
                    width={18}
                    height={13}
                    alt="activateforum"
                    className="mr-2"
                  />
                </span>
                <p>Activate Forum</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  if (forumLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading analytics..." />
      </div>
    );
  }

  return (
      <div className="flex flex-col space-y-7">
      <div>
        <h2 className="text-2xl"> Forum Analytics</h2>
        <p className="text-sm text-[#A8A8A8]">
          analyze forum performance and member activity
        </p>
      </div>
      {/* <div className="flex items-center space-x-[50px] w-full">
        <div className="space-y-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#F79203] "></div>
            <p className="text-[#373737] text-[14px]">
              Total no. of forum in app
            </p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">10</p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#111810] "></div>
            <p className="text-[#373737] text-[14px]">Engagements on forums</p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">20m</p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#2BAC47] "></div>
            <p className="text-[#373737] text-[14px]">Active forums</p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">28</p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#BF3100] "></div>
            <p className="text-[#373737] text-[14px]">Inactive forums</p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">12</p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#BF3100] "></div>
            <p className="text-[#373737] text-[14px]">
              Total no. of likes on forum
            </p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">324k.3</p>
        </div>
      </div> */}
      <div>
        <div className="flex justify-between items-center">
          <div></div>
        <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md ">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Admin or Forum name..."
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                      value={searchForum}
                      onChange={(e) => setSearchForum(e.target.value)}
                    />
                  </div>
        </div>
        <UserTable
          
          data={allForums}
          columns={columns}
        />
         {totalDocs !== 0 && 
                   <div className="flex items-center justify-start space-x-2 px-4 py-4">
                   <div>
                   <p className="text-[14px]">
                  {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, totalDocs)} of {totalDocs}
                  </p>
                   </div>
                   <Button
                     className="p-0 bg-transparent hover:bg-transparent"
                     size="sm"
                     onClick={() => {
                       if (hasPrevPage) {
                         setForumPage((prevPage) => prevPage - 1); 
                       }
                     }}
                     disabled={page <= 1}
                   >
                     <Image
                       src={"/icons/backbutton.svg"}
                       height={20}
                       width={20}
                       alt="backbutton"
                     />
                   </Button>
                   <Button
                     className="p-0 bg-transparent hover:bg-transparent"
                     size="sm"
                     onClick={() => {
                       if (hasNextPage) {
                         setForumPage((prevPage) => prevPage + 1); 
                       }
                     }}
                     disabled={page * limit >=
                     totalDocs
                     }
                   >
                     <Image
                       src={"/icons/forwardbutton.svg"}
                       height={20}
                       width={20}
                       alt="forwardbutton"
                     />
                   </Button>
                 </div>
                }
      </div>

      <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
        <SheetContent className="sm:max-w-[519px] overflow-y-auto scrollbar-hide">
          <SheetHeader>
            <SheetTitle className="flex justify-between mb-[40px]">
              <p className="text-[#111810] font-medium text-[20px]">
                Forum Members{" "}
                <span className="font-Recoleta text-[#808080]">({forumMembers?.length})</span>
              </p>
              <Image
                src="/DASHBOARDASSETS/ICONS/CANCEL WITH FILL.svg"
                alt="cancelIcon"
                className="cursor-pointer transition-all active:scale-95 "
                onClick={() => {
                  setIsSheetOpen(false);
                  setSearchTerm("");
                }}
                width={26}
                height={26}
              />
            </SheetTitle>
          </SheetHeader>
          <div className="">
            <div className="flex w-full items-center border px-2 rounded-md ">
              <Image
                src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                width={20}
                height={19.88}
                alt="searchIcon"
              />
              <Input
                placeholder="Search Member name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="max-w-sm  focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8] "
              />
            </div>
            <div className="space-y-[20px]">
              {forumMembers?.map((member: any) => (
                  <div className="flex justify-between items-center mt-[24px] pb-[16px] border-b">
                  <div className="flex items-center space-x-1">
                    <Avatar>
                      <AvatarImage
                        className="object-cover"
                        src={member?.image}
                        alt="@shadcn"
                      />
  {member?.username ? member.username[0] : "?"}
  </Avatar>
                    <div>
                      <p>{member?.username}</p>
                      <p className="text-[#A4A4A4]">@{member.username}</p>
                    </div>
                  </div>
                  <button onClick={async() => {
                    await deleteForumMember(forumId, member?.id);
                    setSearchTerm('');
                    await getForumMembers(forumId);
                  }} className="text-[#C83532]">Delete</button>
                </div>
              ))}
             
             
            </div>
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ForumAnalytics;
