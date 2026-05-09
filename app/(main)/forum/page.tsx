"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { UserTable } from "@/components/UserTable";
import { data } from "@/mock/row";
import { EllipsisVertical } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import useForum from "@/hooks/useForum";
import { useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



const Forum = () => {
  const {allForums} = useSelector((state: RootState) => state.forum);
  const {getAllForums, forumLoading, setForumPage, forumPage} = useForum();
  const {hasNextPage, hasPrevPage, limit, page, totalDocs} = useSelector(
    (state: RootState) => state.forum.pagination
  );
  const [searchForum, setSearchForum] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name of forum",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <p>{row.getValue("status")}</p>
      )
        // row.getValue("status") === "Activated" ? (
        //   <div className="flex items-center space-x-1 border border-[#2BAC47] bg-green-100 text-xs font-medium w-max rounded-xl py-1 px-2">
        //     <span>
        //       <Image
        //         src={"/icons/ActivateIcon.svg"}
        //         width={10}
        //         height={10}
        //         alt="activateIcon"
        //       />
        //     </span>
        //     <p>{row.getValue("status")}</p>
        //   </div>
        // ) : (
        //   <div className="flex items-center space-x-1 border border-[#C83532] bg-red-100 text-xs font-medium w-max rounded-xl py-1 px-2">
        //     <span>
        //       <Image
        //         src={"/icons/DeactivateIcon.svg"}
        //         width={10}
        //         height={10}
        //         alt="deactivateIcon"
        //       />
        //     </span>
        //     <p>{row.getValue("status")}</p>
        //   </div>
        // ),
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

        return <EllipsisVertical className="h-4 w-4" />;
      },
    },
  ];

  if (forumLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading forums..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      <div>
        <h2 className=" text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]"> Forum</h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
       View and Manage Forum Activities
        </p>
      </div>
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
         {totalDocs !== 0 && (
                   <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                     <p>
                       SHOWING {allForums.length > 0 ? (page - 1) * limit + 1 : 0}-
                       {allForums.length > 0 ? Math.min(page * limit, totalDocs) : 0} OF{" "}
                       {totalDocs.toLocaleString()}
                     </p>
                     <div className="flex items-center gap-2">
                       <button  
                         className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                         onClick={() => {
                           if (hasPrevPage) {
                             setForumPage((prevPage) => prevPage - 1); 
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
                             setForumPage((prevPage) => prevPage + 1); 
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
    </div>
  );
};

export default Forum;
