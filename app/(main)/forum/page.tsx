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
import LoadingOverlay from "@/components/LoadingOverlay";
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

  const hasForums = (allForums?.length ?? 0) > 0;

  if (forumLoading && !hasForums) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading forums..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      {forumLoading && hasForums && (
        <LoadingOverlay message="Processing..." />
      )}
      <div>
        <h2 className=" text-2xl"> Forum</h2>
        <p className="text-sm text-[#A8A8A8]">
          Lorem ipsum dolor sit amet consectetur.
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
    </div>
  );
};

export default Forum;
