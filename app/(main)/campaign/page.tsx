"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EllipsisVertical, PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserTable } from "@/components/UserTable";
import { campaignData } from "@/mock/row";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import useCampaign from "@/hooks/useCampaign";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LoadingState from "@/components/LoadingState";

const profile = {
  name: "Randall_Henn",
  reason: "Video Project",
  raised: "$8,000",
  starter: "@RandallHenn89",
};

const Campaign = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<any>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const hideChevronsInTrigger = () => {
      // Select all AccordionTrigger elements
      const triggers = document.querySelectorAll(".accordion-trigger");

      triggers.forEach((trigger) => {
        const chevrons = trigger.querySelectorAll(".lucide-chevron-down");
        chevrons.forEach((chevron) => {
          (chevron as HTMLElement).style.display = "none"; // Completely remove the element from layout
        });
      });
    };

    // Create a MutationObserver to monitor changes in the DOM
    const observer = new MutationObserver(() => {
      hideChevronsInTrigger();
    });

    // Observe changes in the entire document
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    hideChevronsInTrigger();

    // Clean up the observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);
  const {
    getActiveCampaigns,
    getStoppedCampaigns,
    getCompletedCampaigns,
    getMostPerformedCampaigns,
    getAllDonations,
    stopCampaign,
    campaignLoading,
    getProcessingCampaigns,
    campaignLoadingSheet,
    activateCampaign, activePage, setActivePage, mostPerformedPage, setMostPerformedPage, processingPage, setProcessingPage, completedPage, setCompletedPage, stoppedPage, setStoppedPage
  } = useCampaign();
  useEffect(() => {
    getActiveCampaigns();
    getStoppedCampaigns();
    getCompletedCampaigns();
    getMostPerformedCampaigns();
    getProcessingCampaigns();
  }, []);
  useEffect(() => {
    if (!campaignLoading) {
      setIsInitialLoading(false);
    }
  }, [campaignLoading]);
  useEffect(() => {
    getActiveCampaigns(); 
  }, [activePage]);

  useEffect(() => {
    getMostPerformedCampaigns(); 
  }, [mostPerformedPage]);

  useEffect(() => {
    getProcessingCampaigns(); 
  }, [processingPage]);

  useEffect(() => {
    getCompletedCampaigns(); 
  }, [completedPage]);

  useEffect(() => {
    getStoppedCampaigns(); 
  }, [stoppedPage]);
  const {
    campaignActive,
    campaignCompleted,
    campaignMostPerformed,
    campaignStopped,
    campaignProcessing,
    groupedCampaigns,
    donations,
    paginationActive, paginationOther
  } = useSelector((state: RootState) => state.campaign);

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "creators_name",
      header: "Creator",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={profile?.user_image}
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[14px] text-[#373737]">
                {profile?.creators_name}
              </p>
              <p className="text-[14px] text-[#A4A4A4]">
                @{profile?.user_username}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "goal_amount",
      header: "Amount",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <p className="text-[14px] space-x-1 flex text-[#373737]">
            <span className="text-[14px] text-[#2BAC47] font-bold">
              ${profile?.amount_raised}
            </span>
            <p>of ${profile?.goal_amount}</p>
          </p>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("reason")}</p>
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Duration",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;

        if (!createdAt) {
          return <p className="text-[14px] text-[#373737]">Null</p>;
        }

        const daysDifference = Math.floor(
          (new Date().getTime() - new Date(createdAt).getTime()) /
            (1000 * 3600 * 24)
        );

        if (daysDifference === 0) {
          return <p className="text-[14px] text-[#373737]">Today</p>;
        }

        return <p className="text-[14px] text-[#373737]">{daysDifference}d</p>;
      },
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
                onClick={() => {
                  setDetailsData(profile);
                  openSheet();
                  getAllDonations(profile?.id);
                 
                }}
              >
                <span>
                  <Image
                    src={"/icons/more.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>View info</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={async() => {
                 await stopCampaign(profile?.id)
                }}
              >
                <span>
                  <Image
                    src={"/icons/stop.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Stop Campaign</p>
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={openSheet}
              >
                <span>
                  <Image
                    src={"/icons/delete.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Delete</p>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  const stoppedColumns: ColumnDef<any>[] = [
    {
      accessorKey: "creators_name",
      header: "Creator",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={profile?.user_image}
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[14px] text-[#373737]">
                {profile?.creators_name}
              </p>
              <p className="text-[14px] text-[#A4A4A4]">
                @{profile?.user_username}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "goal_amount",
      header: "Amount",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <p className="text-[14px] space-x-1 flex text-[#373737]">
            <span className="text-[14px] text-[#2BAC47] font-bold">
              ${profile?.amount_raised}
            </span>
            <p>of ${profile?.goal_amount}</p>
          </p>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("reason")}</p>
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Duration",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;

        if (!createdAt) {
          return <p className="text-[14px] text-[#373737]">Null</p>;
        }

        const daysDifference = Math.floor(
          (new Date().getTime() - new Date(createdAt).getTime()) /
            (1000 * 3600 * 24)
        );

        if (daysDifference === 0) {
          return <p className="text-[14px] text-[#373737]">Today</p>;
        }

        return <p className="text-[14px] text-[#373737]">{daysDifference}d</p>;
      },
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
                onClick={() => {
                  setDetailsData(profile);
                  openSheet();
                  getAllDonations(profile?.id);
                 
                }}
              >
                <span>
                  <Image
                    src={"/icons/more.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>View info</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={async() => {
                   await activateCampaign(profile?.id)
                }}
              >
                <span>
                  <Image
                    src={"/icons/stop.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Activate Campaign</p>
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={openSheet}
              >
                <span>
                  <Image
                    src={"/icons/delete.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Delete</p>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (campaignLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading campaigns..." />
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-8 space-x-4">
      <section className="col-span-6 flex flex-col space-y-7">
        <div>
          <h2 className="text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]">Invest (campaign)</h2>
          <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
         View and Manage Creator Campaigns
          </p>
        </div>

        <div>
          <Tabs defaultValue="active">
            <TabsList className="space-x-7 bg-transparent border-b rounded-none px-0 w-full justify-start pb-0">
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                onClick={() => {
                  getActiveCampaigns();
                }}
                value="active"
              >
                Active 
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4]  px-0  py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                onClick={() => {
                  getProcessingCampaigns();
                }}
                value="processing"
              >
                Processing 
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4]  px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                onClick={() => {
                  getStoppedCampaigns();
                }}
                value="stopped"
              >
                Stopped 
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4]  px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                onClick={() => {
                  getMostPerformedCampaigns();
                }}
                value="performed"
              >
                Most Performed 
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4]  px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                onClick={() => getCompletedCampaigns()}
                value="completed"
              >
                Completed 
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <UserTable
                placeholder="Search for creator"
                data={campaignActive}
                columns={columns}
              />
               {paginationActive?.totalDocs !== 0 && (
                         <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                           <p>
                             SHOWING {campaignActive.length > 0 ? (paginationActive?.page - 1) * paginationActive?.limit + 1 : 0}-
                             {campaignActive.length > 0 ? Math.min(paginationActive?.page * paginationActive?.limit, paginationActive?.totalDocs) : 0} OF{" "}
                             {paginationActive?.totalDocs?.toLocaleString()}
                           </p>
                           <div className="flex items-center gap-2">
                             <button  
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationActive?.hasPrevPage) {
                                   setActivePage((prevPage) => prevPage - 1); 
                                 }
                               }}
                               disabled={!paginationActive?.hasPrevPage}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M7.21885 8.00047L10.5187 11.3003L9.57592 12.2431L5.33325 8.00047L9.57592 3.75781L10.5187 4.70062L7.21885 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg> 
                             </button>

                             <button  
                               disabled={!paginationActive?.hasNextPage}
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationActive?.hasNextPage) {
                                   setActivePage((prevPage) => prevPage + 1); 
                                 }
                               }}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M8.78105 8.00047L5.4812 4.70062L6.42401 3.75781L10.6667 8.00047L6.42401 12.2431L5.4812 11.3003L8.78105 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg>
                             </button>
                           </div>
                         </div>
                      )}
            </TabsContent>
            <TabsContent value="processing">
              <UserTable
                placeholder="Search for creator"
                data={campaignProcessing}
                columns={columns}
              />
               {paginationOther?.totalDocs !== 0 && (
                         <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                           <p>
                             SHOWING {campaignProcessing.length > 0 ? (paginationOther?.page - 1) * paginationOther?.limit + 1 : 0}-
                             {campaignProcessing.length > 0 ? Math.min(paginationOther?.page * paginationOther?.limit, paginationOther?.totalDocs) : 0} OF{" "}
                             {paginationOther?.totalDocs?.toLocaleString()}
                           </p>
                           <div className="flex items-center gap-2">
                             <button  
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationOther?.hasPrevPage) {
                                   setProcessingPage((prevPage) => prevPage - 1); 
                                 }
                               }}
                               disabled={!paginationOther?.hasPrevPage}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M7.21885 8.00047L10.5187 11.3003L9.57592 12.2431L5.33325 8.00047L9.57592 3.75781L10.5187 4.70062L7.21885 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg> 
                             </button>

                             <button  
                               disabled={!paginationOther?.hasNextPage}
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationOther?.hasNextPage) {
                                   setProcessingPage((prevPage) => prevPage + 1); 
                                 }
                               }}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M8.78105 8.00047L5.4812 4.70062L6.42401 3.75781L10.6667 8.00047L6.42401 12.2431L5.4812 11.3003L8.78105 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg>
                             </button>
                           </div>
                         </div>
                      )}
            </TabsContent>
            <TabsContent value="stopped">
              <UserTable
                placeholder="Search for creator"
                data={campaignStopped}
                columns={stoppedColumns}
              />
                {paginationOther?.totalDocs !== 0 && (
                         <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                           <p>
                             SHOWING {campaignStopped.length > 0 ? (paginationOther?.page - 1) * paginationOther?.limit + 1 : 0}-
                             {campaignStopped.length > 0 ? Math.min(paginationOther?.page * paginationOther?.limit, paginationOther?.totalDocs) : 0} OF{" "}
                             {paginationOther?.totalDocs?.toLocaleString()}
                           </p>
                           <div className="flex items-center gap-2">
                             <button  
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationOther?.hasPrevPage) {
                                   setStoppedPage((prevPage) => prevPage - 1); 
                                 }
                               }}
                               disabled={!paginationOther?.hasPrevPage}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M7.21885 8.00047L10.5187 11.3003L9.57592 12.2431L5.33325 8.00047L9.57592 3.75781L10.5187 4.70062L7.21885 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg> 
                             </button>

                             <button  
                               disabled={!paginationOther?.hasNextPage}
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationOther?.hasNextPage) {
                                   setStoppedPage((prevPage) => prevPage + 1); 
                                 }
                               }}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M8.78105 8.00047L5.4812 4.70062L6.42401 3.75781L10.6667 8.00047L6.42401 12.2431L5.4812 11.3003L8.78105 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg>
                             </button>
                           </div>
                         </div>
                      )}
            </TabsContent>
            <TabsContent value="performed">
              <UserTable
                placeholder="Search for creator"
                data={campaignMostPerformed}
                columns={columns}
              />
                {paginationOther?.totalDocs !== 0 && (
                         <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                           <p>
                             SHOWING {campaignMostPerformed.length > 0 ? (paginationOther?.page - 1) * paginationOther?.limit + 1 : 0}-
                             {campaignMostPerformed.length > 0 ? Math.min(paginationOther?.page * paginationOther?.limit, paginationOther?.totalDocs) : 0} OF{" "}
                             {paginationOther?.totalDocs?.toLocaleString()}
                           </p>
                           <div className="flex items-center gap-2">
                             <button  
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationOther?.hasPrevPage) {
                                   setMostPerformedPage((prevPage) => prevPage - 1); 
                                 }
                               }}
                               disabled={!paginationOther?.hasPrevPage}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M7.21885 8.00047L10.5187 11.3003L9.57592 12.2431L5.33325 8.00047L9.57592 3.75781L10.5187 4.70062L7.21885 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg> 
                             </button>

                             <button  
                               disabled={!paginationOther?.hasNextPage}
                               className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                               onClick={() => {
                                 if (paginationOther?.hasNextPage) {
                                   setMostPerformedPage((prevPage) => prevPage + 1); 
                                 }
                               }}
                             >
                               <svg
                                 width="16"
                                 height="16"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M8.78105 8.00047L5.4812 4.70062L6.42401 3.75781L10.6667 8.00047L6.42401 12.2431L5.4812 11.3003L8.78105 8.00047Z"
                                   fill="#111810"
                                 />
                               </svg>
                             </button>
                           </div>
                         </div>
                      )}
            </TabsContent>
            <TabsContent value="completed">
              <UserTable
                placeholder="Search for creator"
                data={campaignCompleted}
                columns={columns}
              />
                {paginationOther?.totalDocs !== 0 && 
                         <div className="flex items-center justify-start space-x-2 px-4 py-4">
                         <div>
                         <p className="text-[14px]">
                        {(paginationOther?.page - 1) * paginationOther?.limit + 1} -{" "}
                        {Math.min(paginationOther?.page * paginationOther?.limit, paginationOther?.totalDocs)} of {paginationOther?.totalDocs}
                        </p>
                         </div>
                         <Button
                           className="p-0 bg-transparent hover:bg-transparent"
                           size="sm"
                           onClick={() => {
                             if (paginationOther?.hasPrevPage) {
                               setCompletedPage((prevPage) => prevPage - 1); 
                             }
                           }}
                           disabled={paginationOther?.page <= 1}
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
                             if (paginationOther?.hasNextPage) {
                               setCompletedPage((prevPage) => prevPage + 1); 
                             }
                           }}
                           disabled={paginationOther?.page * paginationOther?.limit >=
                            paginationOther?.totalDocs
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
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <section className="col-span-2 border-2 border-[#F1F1F1]">
        <h2 className="p-[20px] pb-[12px] border-b font-medium">
          Campaign Purpose{" "}
          <span className="text-[#808080] font-Recoleta">
            ({groupedCampaigns?.length})
          </span>
        </h2>
        <Accordion type="single" collapsible>
          {groupedCampaigns?.map((campaign: any, index: number) => (
            <AccordionItem
              key={index}
              className="px-[20px] pb-[16px]"
              value={campaign?.campaigns[0]?.username}
            >
              <AccordionTrigger className=" accordion-trigger hover:no-underline  pt-[32px] pb-0 relative">
                <div className="flex items-center space-x-1 relative w-3/6">
                  <p className="text-[#373737] font-normal whitespace-nowrap overflow-hidden">
                    {campaign?.creator_type}
                  </p>
                  <span className="font-Recoleta font-medium text-[#F75803] ml-1">
                    ({campaign?.total_campaigns})
                  </span>
                </div>

                <div>
                  <Image
                    src={"/DASHBOARDASSETS/ICONS/RIGHT ARROW.svg"}
                    alt="right arrow"
                    width={16}
                    height={16}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-[16px] space-y-[18px]">
                {campaign?.campaigns.map((campaign: any, idx: number) => (
                  <p
                    key={idx}
                    className="text-[#7E2D02] text-[14px] flex items-center"
                  >
                    <span>
                      <Image
                        src={"/DASHBOARDASSETS/ICONS/PROFILE.svg"}
                        width={13.01}
                        height={12.51}
                        alt="profile Icon"
                        className="mr-[8px]"
                      />
                    </span>
                    {campaign?.username}
                  </p>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
     
        <SheetContent className=" sm:max-w-[519px] overflow-y-auto scrollbar-hide">
          <SheetHeader>
         
            <SheetTitle className="flex justify-between">
              <p className="text-[#111810] font-medium text-[20px]">Campaign</p>
              <Image
                src="/DASHBOARDASSETS/ICONS/CANCEL WITH FILL.svg"
                alt="cancelIcon"
                className="cursor-pointer transition-all active:scale-95 "
                onClick={() => {
                  setIsSheetOpen(false);
                }}
                width={26}
                height={26}
              />
            </SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
        
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full  grid-cols-3 mb-[32px]">
                <TabsTrigger value="details">
                  <p className="text-[14px]">Details</p>
                </TabsTrigger>
                <TabsTrigger value="donation">
                  <p className="text-[14px]">Donation</p>
                </TabsTrigger>
                <TabsTrigger value="verification">
                  <p className="text-[14px]">Verification Details</p>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="flex items-center space-x-[12px]">
                  <Avatar>
                    <AvatarImage
                      className="object-cover"
                      src={detailsData?.user_image}
                      alt="userImage"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[20px] font-medium text-[#111810]">
                      {detailsData?.creators_name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="flex items-center space-x-1">
                        <span>
                          <Image
                            src={"/icons/profile.svg"}
                            height={14}
                            width={14}
                            alt="profileIcon"
                          />
                        </span>
                        <p className="text-[#808080]">
                          {detailsData?.creators_type}
                        </p>
                      </p>
                      {/* <p className="h-1 w-1 rounded-full bg-[#C8C8C8]"></p>
                      <p className="flex items-center space-x-1">
                        <span>
                          <Image
                            src={"/icons/music.svg"}
                            height={14}
                            width={14}
                            alt="musicIcon"
                          />
                        </span>
                        <p className="text-[#808080]">Artist/Musician</p>
                      </p> */}
                    </div>
                  </div>
                </div>
                <div className="space-y-[24px] mt-[32px] mb-[48px]">
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4] text-[16px]">Creator Name</p>
                    <p>{detailsData?.creators_name}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Reason</p>
                    <p>{detailsData?.reason}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Status</p>
                    <p>{detailsData?.status}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Target</p>
                    <p>{detailsData?.goal_amount}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Raised</p>
                    <p className="text-[#2BAC47]">{profile.raised}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Donation Number</p>
                    <p>{detailsData?.number_of_donations}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Starter</p>
                    <p className="text-[#F75803] ">
                      {detailsData?.starter_name}
                    </p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Start Date</p>
                    <p>{detailsData?.createdAt?.substring(0, 10)}</p>
                  </div>
                  <div className="flex w-full justify-between items-center border-b py-2">
                    <p className="text-[#A4A4A4]">Duration</p>
                    <p className="text-[14px] text-[#373737]">
                      {(() => {
                        const createdAt = detailsData?.createdAt;

                        if (!createdAt) {
                          return "Null";
                        }

                        const daysDifference = Math.floor(
                          (new Date().getTime() -
                            new Date(createdAt).getTime()) /
                            (1000 * 3600 * 24)
                        );

                        return daysDifference === 0
                          ? "Today"
                          : `${daysDifference} days`;
                      })()}
                    </p>
                  </div>
                </div>
                {detailsData?.status === 'active' ? <Button
                  className="w-full bg-[#C83532] transition-all hover:bg-[#C83532] active:scale-95 text-white py-2 text-[14px]"
                  onClick={async () => {
                    await stopCampaign(detailsData?.id);
                    closeSheet();
                  }}
                >
                  Stop Campaign
                </Button> :
                <Button
                className="w-full bg-[#2BAC47] transition-all hover:bg-[#2BAC47] active:scale-95 text-white py-2 text-[14px]"
                onClick={async () => {
                  await activateCampaign(detailsData?.id);
                  closeSheet()
                }}
              >
                Activate Campaign
              </Button>
                }
                
              </TabsContent>
              <TabsContent value="donation">
                <div className="space-y-[20px]">
                  {donations?.map((donation) => {
                    const createdAt = donation?.createdAt;
                    const now = new Date();
                    const createdDate = new Date(createdAt);
                    const differenceInMs =
                      now.getTime() - createdDate.getTime();

                    const differenceInHours = Math.floor(
                      differenceInMs / (1000 * 60 * 60)
                    );
                    const differenceInDays = Math.floor(
                      differenceInMs / (1000 * 60 * 60 * 24)
                    );
                    const differenceInMonths = Math.floor(
                      differenceInMs / (1000 * 60 * 60 * 24 * 30)
                    );
                    const differenceInYears = Math.floor(
                      differenceInMs / (1000 * 60 * 60 * 24 * 365)
                    );

                    let timeAgo = "";

                    if (differenceInYears > 0) {
                      timeAgo = `${differenceInYears}y ago`;
                    } else if (differenceInMonths > 0) {
                      timeAgo = `${differenceInMonths}mo ago`;
                    } else if (differenceInDays > 0) {
                      timeAgo = `${differenceInDays}d ago`;
                    } else if (differenceInHours > 0) {
                      timeAgo = `${differenceInHours}h ago `;
                    } else {
                      timeAgo = "Just now";
                    }
                    return (
                      <div
                        key={donation?.id}
                        className="flex justify-between items-center py-2 w-full border-b"
                      >
                        <div className="flex items-center space-x-[12px]">
                          <Avatar>
                            <AvatarImage
                              className="object-cover"
                              src={donation?.image}
                              alt="@shadcn"
                            />
                            <AvatarFallback>
                              {donation?.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[14px] font-medium">
                              {donation?.username}
                            </p>
                            <p className="text-[#A4A4A4] text-[14px]">
                              {timeAgo}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[#2BAC47]">
                            + ${donation?.amount}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="verification">
                <div className="py-4">
                  <div>
                    <p className="text-[14px] font-semibold">Media</p>
                    <Image
                      src={"/mediaImage.png"}
                      alt="mediaImage"
                      width={440}
                      height={240}
                    />
                  </div>
                  <div className="my-[48px] space-y-[20px]">
                    <p className="text-[14px] font-semibold">Information</p>
                    <div className="flex w-full justify-between items-center border-b py-2">
                      <p className="text-[#A4A4A4] text-[14px]">Creator Name</p>
                      <p className="text-[14px]">{profile.name}</p>
                    </div>
                    <div className="flex w-full justify-between items-center border-b py-2 ">
                      <p className="text-[#A4A4A4] text-[14px]">Reason</p>
                      <p className="text-[14px]">{profile.reason}</p>
                    </div>
                    <div className="flex w-full justify-between items-center border-b py-2">
                      <p className="text-[#A4A4A4] text-[14px]">Raised</p>
                      <p className="text-[#2BAC47] text-[14px]">
                        {profile.raised}
                      </p>
                    </div>
                    <div className="flex w-full justify-between items-center border-b py-2">
                      <p className="text-[#A4A4A4] text-[14px]">Reason</p>
                      <p className="text-[14px]">{profile.reason}</p>
                    </div>
                    <p className="text-[14px] ">
                      Who else is ready to turn up at the meet and greet for
                      Raba? 🎉 Hit that like button if you're joining us! Let's
                      make this gathering unforgettable with good vibes, great
                      music, and even better company. See you there! 🔥
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">
                      Starter's Facial Verification
                    </p>
                    <Image
                      src={"/facial.png"}
                      width={148}
                      height={119}
                      alt="facial"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chrisbel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex items-center justify-between">
              <Avatar>
                <AvatarImage
                  className="object-cover"
                  src="https://s3-alpha-sig.figma.com/img/f3d2/faf9/56ae76eb7b82a102364b9b9a8f5a7056?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Ha4KHcz4sEhTV8h5L5zQyOmupyW9L1aum5W3cIH38owlyw3W7rbpChkO6wOvyK878~Eip92GyS7vrpFKsBEqI2Kij6uPHmMmRnqD5EYycd8eN8x1d0xYBYMz2ZQ28sXQAVgH0JJbSbkxQ83x5XJLxp78sQ5XHjtBVDbSPqKH6~f79xTlW197QFqU5dJTSJ7~dI4YmdsX-h6~CxYMBXln8nDASyJjSmj6QypyE7ic5yN4A9qLIsf0-vbc-rm7oGaYueyVnP6oJzNwvqrvPS1vbQjywznBk2GG0~ovSkz6MrhKgxEeBDK1bL-ln1u9gGcB2sS5HwBCBhnb3LLOKjUj0Q__"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Button className="bg-[#F75803] hover:bg-[#F75803] text-white rounded-3xl hover:scale-105 active:scale-95 transition-all">
                <PlusIcon size={15} /> <p className="text-14px">Join Forum</p>
              </Button>
            </div>
            <div className="border-b py-2">
              <p className="font-semibold">Chrisbel Otu</p>
              <p className="text-[14px] text-[#A4A4A4]">Fan</p>
              <p className="text-[14px]">
                Discovering new tunes is my passion! 🎶.💫 Also, I sell musical
                equipment—join my forum for all things music!
              </p>
            </div>
            <div>
              <p className="text-[#A4A4A4] text-[14px] mb-2">My forum</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      className="object-cover"
                      src="https://s3-alpha-sig.figma.com/img/92ef/bb4d/d3cdf215882d1ea824e192e5d759849c?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=G2Qc1~tTvteQ1HYetrN2qN1-gshG1A8t~1gCMxNOyXUSoowKUgs0sQs2OQfV46IZa4G8P1eyyegluErwU6K9YcEA56SX-E10pP9CWt9h~EJDGISE39OxaaZD0U3cH6w9v7oNd71ZP0fh~0879EYlOl~sRJpx~n~raRrDJWcGspeRhGpe2St70RbtQ4hU8r7l1QWlEmh-9WX9Ac0cZFUUeqCTNgQ5Dhk26J8gxAhgHNOh7ZXy3qQoYlhiju9FgHRsBNYZcrO2KMy~waH9j-SViWPIPW4DyaShSCWau4td2OdOUbjtX1OjnymYI~hQEn6SOixUZilUbvoAJGonBRJptg__"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Chris quality sounds</p>
                    <p className="text-[14px] text-[#808080]">589k members</p>
                  </div>
                </div>
                <div>
                  <PlusIcon
                    color="#F75803"
                    size={18}
                    className="hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[#A4A4A4] text-[14px] mb-2">
                Other forums they engage with
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      className="object-cover"
                      src="https://s3-alpha-sig.figma.com/img/2432/050e/ed50c86e382b5738589ccdcca698436b?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=FBi~2K9PmPLSsvVf-rIyH5enfvD4Kc0hofkMylJAxUKQbOz46XYUxxhxQ2gwyuhFebyts2~9ZeJQHJjjtiTzHGLwMPDidgNoxzdzgFcuWjVy7lJsuXGEHj5cC2eUjrVUlHZ1urpxghQR0bI79HHU7oIVzJ6gYEbbbPUBL8uUmtmSvNyfb1VdljAw~ME6CtmnlIapRk~-lpIy~IrWeybgv~zL07sYUSkW2FV-m5jDLhPywvBi83mMzrR7bIr5phJc23dnuubhNPBE9B6C5M3NRhm5wxwVkDqygX5EW7puJyunUVWppeKpqPIG0tu0sDD6iUPEZ1dZpjhXqc1ove5Xgw__"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Chris quality sounds</p>
                    <p className="text-[14px] text-[#808080]">5m members</p>
                  </div>
                </div>
                <div>
                  <PlusIcon
                    color="#F75803"
                    size={18}
                    className="hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaign;
