"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "@/components/UserTable";
import { userAnalytics } from "@/mock/row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import usePerformance from "@/hooks/usePerformance";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateActiveUser } from "@/redux/slices/performanceslice";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserAnalytics = () => {
  
  const { getAllPerformanceCreator, getAllPerformanceFan, getAllPerformanceInvestor, getCreatorPerformance, getFanInvestorPerformance, performanceLoading, setCreatorPage, creatorPage, fanPage, investorPage, setFanPage, setInvestorPage } = usePerformance();
  const { allPerformanceCreator, allPerformanceFan, allPerformanceInvestor, stats } = useSelector((state: RootState) => state.performance);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { pagination, paginationCreator } = useSelector(
    (state: RootState) => state.performance
  );
  const [searchCreator, setSearchCreator] = useState('')
  const [searchFan, setSearchFan] = useState('')
  const [searchInvestor, setSearchInvestor] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "full_name",
      header: "Creator name",
      cell: ({ row }) => {
        const profile = row.original
        return (
          <div className="flex items-center space-x-1">
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={profile?.image}
              alt="@shadcn"
            />
            <AvatarFallback>{profile?.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p>{profile?.full_name}</p>
            <p className="text-[#A4A4A4]">@{profile?.username}</p>
          </div>
        </div>
        )
       
      },
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "subscription_plan",
      header: "Subscription type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") === "active" ? (
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
        ),
    },
    {
      accessorKey: "analytics",
      header: "",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <p onClick={async() => {
           await getCreatorPerformance(profile?.id);
           dispatch(updateActiveUser(profile));
           router.push(`/performance/useranalytics/creator/${profile?.full_name}`)

          }} className="text-[#7E2D02] font-medium cursor-pointer">
          View Analytics
        </p>
        )
      
      },
    },
  ];
  const columnsFan: ColumnDef<any>[] = [
    {
      accessorKey: "full_name",
      header: "Creator name",
      cell: ({ row }) => {
        const profile = row.original
        return (
          <div className="flex items-center space-x-1">
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={profile?.image}
              alt="@shadcn"
            />
            <AvatarFallback>{profile?.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p>{profile?.full_name}</p>
            <p className="text-[#A4A4A4]">@{profile?.username}</p>
          </div>
        </div>
        )
       
      },
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "subscription_plan",
      header: "Subscription type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") === "active" ? (
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
        ),
    },
    {
      accessorKey: "analytics",
      header: "",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <p onClick={async() => {
           await getFanInvestorPerformance(profile?.id);
           dispatch(updateActiveUser(profile));
           router.push(`/performance/useranalytics/fan/${profile?.full_name}`)

          }} className="text-[#7E2D02] font-medium cursor-pointer">
          View Analytics
        </p>
        )
      
      },
    },
  ];
  
  useEffect(() => {
  getAllPerformanceCreator(searchCreator);
  }, []);

  useEffect(() => {
     setCreatorPage(1);
    getAllPerformanceCreator(searchCreator);

  }, [searchCreator]);

  useEffect(() => {
    setInvestorPage(1);
   getAllPerformanceInvestor(searchInvestor);

 }, [searchInvestor]);

 useEffect(() => {
  setFanPage(1);
 getAllPerformanceFan(searchFan);

}, [searchFan]);

  useEffect(() => {
    
    getAllPerformanceInvestor(searchInvestor);
  
}, [investorPage]);
useEffect(() => {
    
  getAllPerformanceFan(searchFan);

}, [fanPage]);

useEffect(() => {
    
  getAllPerformanceCreator(searchCreator);

}, [creatorPage]);

  useEffect(() => {
    if (!performanceLoading) {
      setIsInitialLoading(false);
    }
  }, [performanceLoading]);

  if (performanceLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      <div>
        
        <h2 className="text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]"> User Analytics</h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
      View General User Analytics 
        </p>
      </div>
      <div className="flex items-center space-x-[121px]">
        <div className="space-y-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#F79203] "></div>
            <p className="text-[#373737] text-[14px]">Total no. of users</p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">{stats?.total_users}</p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#BF3100] "></div>
            <p className="text-[#373737] text-[14px]">
              Total no. of likes in app
            </p>
          </p>
          <p className="text-[32px] font-medium font-Recoleta">{stats?.total_likes}</p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#111810] "></div>
            <p className="text-[#373737] text-[14px]">
              Total no. of creator engagements
            </p>
          </p>
          <p className="text-[32px] font-medium font-Recoleta">{stats?.total_engagements}</p>
        </div>
      </div>
      <div>
        <Tabs defaultValue="creators" className="">
          <TabsList className="space-x-7 bg-transparent border-b rounded-none px-0 w-full justify-start pb-0">
            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              value="creators"
              onClick={() => {
                getAllPerformanceCreator()
              }}
            >
              Creators
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              value="fans"
              onClick={() => {
                getAllPerformanceFan()
              }}
            >
              Fans
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              value="investors"
              onClick={() => {
                getAllPerformanceInvestor()
              }}
            >
              Investor
            </TabsTrigger>
          </TabsList>
          <TabsContent value="creators">
          <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md shadow-sm mt-[20px]">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Here"
                      value={searchCreator}
                      onChange={(e) => setSearchCreator(e.target.value)}
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                    />
                  </div>
            <UserTable
             
              data={allPerformanceCreator}
              columns={columns}
            />
            {paginationCreator?.totalDocs !== 0 && (
                     <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                       <p>
                         SHOWING {allPerformanceCreator.length > 0 ? (paginationCreator?.page - 1) * paginationCreator?.limit + 1 : 0}-
                         {allPerformanceCreator.length > 0 ? Math.min(paginationCreator?.page * paginationCreator?.limit, paginationCreator?.totalDocs) : 0} OF{" "}
                         {paginationCreator?.totalDocs?.toLocaleString()}
                       </p>
                       <div className="flex items-center gap-2">
                         <button  
                           className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                           onClick={() => {
                             if (paginationCreator?.hasPrevPage) {
                               setCreatorPage((prevPage) => prevPage - 1); 
                             }
                           }}
                           disabled={!paginationCreator?.hasPrevPage}
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
                           disabled={!paginationCreator?.hasNextPage}
                           className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                           onClick={() => {
                             if (paginationCreator?.hasNextPage) {
                               setCreatorPage((prevPage) => prevPage + 1); 
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
          <TabsContent value="fans">
          <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md shadow-sm mt-[20px]">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Here"
                      value={searchFan}
                      onChange={(e) => setSearchFan(e.target.value)}
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                    />
                  </div>
            <UserTable
             
              data={allPerformanceFan}
              columns={columnsFan}
            />
               {pagination?.totalDocs !== 0 && (
                        <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                          <p>
                            SHOWING {allPerformanceFan.length > 0 ? (pagination?.page - 1) * pagination?.limit + 1 : 0}-
                            {allPerformanceFan.length > 0 ? Math.min(pagination?.page * pagination?.limit, pagination?.totalDocs) : 0} OF{" "}
                            {pagination?.totalDocs?.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <button  
                              className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                if (pagination?.hasPrevPage) {
                                  setFanPage((prevPage) => prevPage - 1); 
                                }
                              }}
                              disabled={!pagination?.hasPrevPage}
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
                              disabled={!pagination?.hasNextPage}
                              className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                if (pagination?.hasNextPage) {
                                  setFanPage((prevPage) => prevPage + 1); 
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
          <TabsContent value="investors">
          <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md shadow-sm mt-[20px]">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Here"
                      value={searchInvestor}
                      onChange={(e) => setSearchInvestor(e.target.value)}
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                    />
                  </div>
            <UserTable
             
              data={allPerformanceInvestor}
              columns={columnsFan}
            />
               {pagination?.totalDocs !== 0 && (
                        <div className="flex items-center justify-between text-sm text-[#808080] flex-1 px-4 py-4">
                          <p>
                            SHOWING {allPerformanceInvestor.length > 0 ? (pagination?.page - 1) * pagination?.limit + 1 : 0}-
                            {allPerformanceInvestor.length > 0 ? Math.min(pagination?.page * pagination?.limit, pagination?.totalDocs) : 0} OF{" "}
                            {pagination?.totalDocs?.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <button  
                              className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                if (pagination?.hasPrevPage) {
                                  setInvestorPage((prevPage) => prevPage - 1); 
                                }
                              }}
                              disabled={!pagination?.hasPrevPage}
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
                              disabled={!pagination?.hasNextPage}
                              className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                if (pagination?.hasNextPage) {
                                  setInvestorPage((prevPage) => prevPage + 1); 
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
        </Tabs>
      </div>
    </div>
  );
};

export default UserAnalytics;
