"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, EllipsisVertical } from "lucide-react";
import { UserTable } from "@/components/UserTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useBroadcast from "@/hooks/useBroadcast";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Input } from "@/components/ui/input";
import {
  BroadcastProps,
  updateBroadcastEdit,
} from "@/redux/slices/broadcastslice";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import LoadingState from "@/components/LoadingState";
import BroadcastThumbnail from "@/components/BroadcastThumbnail";

const getCreatorName = (broadcast: BroadcastProps) => {
  const fullName = [
    broadcast.creator?.first_name,
    broadcast.creator?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Unknown admin";
};

const BroadCast = () => {
  const { hasNextPage, hasPrevPage, limit, page, totalDocs } = useSelector(
    (state: RootState) => state.broadcast.pagination
  );
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const broadcast = useSelector(
    (state: RootState) => state.broadcast.broadcastAll
  );
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [broadcastId, setBroadcastId] = useState<number>(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const closeDeleteDialog = () => setisDeleteOpen(false);

  
  const { getAllBroadCast, deleteBroadcast, allLoading, deleteLoading, broadcastPage, setBroadcastPage } = useBroadcast();
  useEffect(() => {
    setBroadcastPage(1);
    getAllBroadCast(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    getAllBroadCast(searchTerm);
  }, [broadcastPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const closeButton = document.querySelector(
        "button.absolute.right-4.top-4"
      );

      if (closeButton) {
        closeButton.remove();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isDeleteOpen, setisDeleteOpen]);

  const columns: ColumnDef<BroadcastProps>[] = [
    {
      id: "broadcast",
      header: "Broadcast",
      cell: ({ row }) => (
        <BroadcastThumbnail
          mediaUrl={row.original.media_url?.[0]}
          title={row.original.title}
        />
      ),
    },
    {
      id: "creator",
      header: "Created by",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">
          {getCreatorName(row.original)}
        </p>
      ),
    },
    {
      accessorKey: "title",
      header: "Broadcast Title",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("title")}</p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created date",
      cell: ({ row }) => {
        const createdDate = String(row.getValue("createdAt")).slice(0, 10);
        if (!row.getValue("createdAt")) {
          return <p className="text-[14px] text-[#373737]">Null</p>; // Return "Null" if createdAt is missing
        }
        return <p className="text-[14px] text-[#373737]">{createdDate}</p>;
      },
    },
    {
      accessorKey: "days",
      header: "Days running",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;

        if (!createdAt) {
          return <p className="text-[14px] text-[#373737]">Null</p>;
        }

        const daysDifference = Math.floor(
          (new Date().getTime() - new Date(createdAt).getTime()) /
            (1000 * 3600 * 24)
        );

        if (daysDifference <= 0) {
          return <p className="text-[14px] text-[#373737]">Today</p>;
        }

        return <p className="text-[14px] text-[#373737]">{daysDifference}d</p>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Modified date",
      cell: ({ row }) => {
        const updatedDate = String(row.getValue("updatedAt")).slice(0, 10);
        if (!row.getValue("updatedAt")) {
          return <p className="text-[14px] text-[#373737]">Null</p>;
        }
        return <p className="text-[14px] text-[#373737]">{updatedDate}</p>;
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
            <DropdownMenuContent className="space-y-2" align="end">
             
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={() => {
                  dispatch(updateBroadcastEdit(profile));
                  router.push("/broadcast/edit");
                }}
              >
                <span>
                  <Image
                    src={"/DASHBOARDASSETS/ICONS/EDIT.svg"}
                    alt="EditIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p className="text-[14px]">Edit Broadcast</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={() => {
                  setBroadcastId(profile.id);
                  setisDeleteOpen(true);
                }}
              >
                <span>
                  <Image
                    src={"/DASHBOARDASSETS/ICONS/DELETE.svg"}
                    alt="DeleteIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p className="text-[14px]">Delete Broadcast</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    if (!allLoading) {
      setIsInitialLoading(false);
    }
  }, [allLoading]);

  if (allLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading broadcasts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]">Broadcast</h2>
          <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            Send, View and Manage App wide Broadcast Messages
          </p>
        </div>
        <div>
          <Button
            onClick={() => {
              router.push("/broadcast/create");
            }}
            className="btnColored"
          >
            <span>
              <PlusIcon size={20} />
            </span>
            New Broadcast
          </Button>
        </div>
      </div>
      <div>
        <div className="my-2">
          <div className="flex w-[350px] items-center border px-2 rounded-md">
            <Image
              src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
              width={20}
              height={19.88}
              alt="searchIcon"
            />
            <Input
              placeholder="Search for Broadcast title"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
            />
          </div>
        </div>
        <UserTable
          columns={columns}
          data={broadcast}
        />
        {totalDocs !== 0 && (
           <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
             <p>
               SHOWING {broadcast.length > 0 ? (page - 1) * limit + 1 : 0}-
               {broadcast.length > 0 ? Math.min(page * limit, totalDocs) : 0} OF{" "}
               {totalDocs.toLocaleString()}
             </p>
             <div className="flex items-center gap-2">
               <button  
                 className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                 onClick={() => {
                   if (hasPrevPage) {
                     setBroadcastPage((prevPage) => prevPage - 1); 
                   }
                 }}
                 disabled={!hasPrevPage}
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
                 disabled={!hasNextPage}
                 className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                 onClick={() => {
                   if (hasNextPage) {
                     setBroadcastPage((prevPage) => prevPage + 1); 
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
       
      </div>
      <Dialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/DASHBOARDASSETS/ILLUSTRATION/DELETE.png"}
              height={72}
              width={69.68}
              alt="trashIcon"
            />
            <p className="text-[20px] font-medium">Delete this Broadcast?</p>
            <p className="text-[14px] text-center text-[#808080]">
              Are you sure you want to delete this broadcast? This action is
              irreversible.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center items-center space-x-2">
              <Button
                className="w-full shadow-md text-[14px] text-black bg-transparent hover:bg-transparent transition-all hover:scale-105 active:scale-95 border"
                type="submit"
                onClick={() => {
                  closeDeleteDialog();
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-full shadow-md text-[14px] text-white bg-[#C83532] hover:bg-[#C83532] transition-all hover:scale-105 active:scale-95"
                type="submit"
                onClick={async () => {
                  closeDeleteDialog();
                  await deleteBroadcast(broadcastId);
                }}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BroadCast;
