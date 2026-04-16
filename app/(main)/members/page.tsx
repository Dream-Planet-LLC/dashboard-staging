"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserTable } from "@/components/UserTable";
import { data } from "@/mock/row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, EllipsisVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useGetUsers from "@/hooks/useGetUsers";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { countries, dateOptions } from "@/utils/interface";

const Members = () => {
  const {
    getUsersAll,
    getUsersCreator,
    getUsersFan,
    getUsersInvestor,
    updateStatus,
    getUserPosts,
    userLoading,
    sheetLoading, allPage, setAllPage, creatorPage, setCreatorPage, fanPage, setFanPage, investorPage, setInvestorPage
  } = useGetUsers();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { usersAll, usersCreator, usersFan, usersInvestor, fanCount, creatorCount, investorCount, allCount } = useSelector(
    (state: RootState) => state.usersOnboarded
  );
  const { pagination, paginationOther} = useSelector(
    (state: RootState) => state.usersOnboarded
  );
  const [searchTermAll, setSearchTermAll] = useState("");
  const [searchTermCreator, setSearchTermCreator] = useState("");
  const [searchTermFan, setSearchTermFan] = useState("");
  const [searchTermInvestor, setSearchTermInvestor] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [countryStatus, setCountryStatus] = useState<string>("All");
  const [countryInvestorStatus, setCountryInvestorStatus] = useState<string>("All");
  const [countryCreatorStatus, setCountryCreatorStatus] = useState<string>("All");
  const [countryFanStatus, setCountryFanStatus] = useState<string>("All");
  const [selectedStatusCreator, setSelectedStatusCreator] =
    useState<string>("all");
  const [selectedStatusFan, setSelectedStatusFan] = useState<string>("all");
  const [profileData, setprofileData] = useState<any>({});
  const [date, setDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStatusInvestor, setSelectedStatusInvestor] =
    useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<any>("All Date");
  const [selectedInvestorDate, setSelectedInvestorDate] = useState<any>("All Date");
  const [selectedCreatorDate, setSelectedCreatorDate] = useState<any>("All Date");
  const [selectedFanDate, setSelectedFanDate] = useState<any>("All Date");


  const handleDateChange = (value: any) => {
    setSelectedDate(value);
  };
  const handleCreatorDateChange = (value: any) => {
    setSelectedCreatorDate(value);
  };
  const handleFanDateChange = (value: any) => {
    setSelectedFanDate(value);
  };
  const handleInvestorDateChange = (value: any) => {
    setSelectedInvestorDate(value);
  };

  const handleCountryChange = (value: string) => {
      setCountryStatus(value);
  }; 
  const handleCreatorCountryChange = (value: string) => {
    setCountryCreatorStatus(value);
};  
const handleFanCountryChange = (value: string) => {
  setCountryFanStatus(value);
}; 
const handleInvestorCountryChange = (value: string) => {
  setCountryInvestorStatus(value);
}; 

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };
  const handleStatusChangeCreator = (value: string) => {
    setSelectedStatusCreator(value);
  };
  const handleStatusChangeFan = (value: string) => {
    setSelectedStatusFan(value);
  };
  const handleStatusChangeInvestor = (value: string) => {
    setSelectedStatusInvestor(value);
  };
  const hasMounted = useRef(false);
 
  useEffect(() => {
    if (hasMounted.current) {
      setCreatorPage(1);
      const status =
        selectedStatusCreator === "all" ? null : selectedStatusCreator;   
        const country = countryCreatorStatus === "All" ? null : countryCreatorStatus;
        const date = selectedCreatorDate === 'All Date' ? null : selectedCreatorDate;     
      getUsersCreator(status, searchTermCreator, country, date);
    }
  }, [selectedStatusCreator, searchTermCreator, countryCreatorStatus, selectedCreatorDate]);

  useEffect(() => {
    const status = selectedStatusCreator === "all" ? null : selectedStatusCreator;
    const country = countryCreatorStatus === "All" ? null : countryCreatorStatus  
    const date = selectedCreatorDate === 'All Date' ? null : selectedCreatorDate;     
    getUsersCreator(status, searchTermCreator, country, date);
  }, [creatorPage]);

  useEffect(() => {
    if (hasMounted.current) {
      setFanPage(1);
      const status = selectedStatusFan === "all" ? null : selectedStatusFan;
      const country = countryFanStatus === "All" ? null : countryFanStatus 
      const date = selectedFanDate === 'All Date' ? null : selectedFanDate;      
      getUsersFan(status, searchTermFan, country, date);
    }
  }, [selectedStatusFan, searchTermFan, countryFanStatus, selectedFanDate]);

  useEffect(() => {
    const status = selectedStatusFan === "all" ? null : selectedStatusFan;
    const country = countryFanStatus === "All" ? null : countryFanStatus
    const date = selectedFanDate === 'All Date' ? null : selectedFanDate;
    getUsersFan(status, searchTermFan, country, date)
  }, [fanPage]);

  useEffect(() => {
    if (hasMounted.current) {
      setInvestorPage(1);
      const status =
        selectedStatusInvestor === "all" ? null : selectedStatusInvestor;
        const country = countryInvestorStatus === "All" ? null : countryInvestorStatus 
        const date = selectedInvestorDate === 'All Date' ? null : selectedInvestorDate;      
      getUsersInvestor(status, searchTermInvestor, country, date);
    }
  }, [selectedStatusInvestor, searchTermInvestor, countryInvestorStatus, selectedInvestorDate ]);
  
  useEffect(() => {
    if (hasMounted.current) {
      const status =
      selectedStatusInvestor === "all" ? null : selectedStatusInvestor;
      const country = countryInvestorStatus === "All" ? null : countryInvestorStatus 
      const date = selectedInvestorDate === 'All Date' ? null : selectedInvestorDate;      
      getUsersInvestor(status, searchTermInvestor, country, date);
    }
  }, [investorPage]);

  useEffect(() => {
    if (hasMounted.current) {
      setAllPage(1);
      const status = selectedStatus === "all" ? null : selectedStatus;
      const country = countryStatus === "All" ? null : countryStatus
      const date = selectedDate === 'All Date' ? null : selectedDate;
      getUsersAll(status, searchTermAll, country, date);
    }
  }, [countryStatus, selectedStatus, searchTermAll, selectedDate]);
  
  useEffect(() => {
    if (hasMounted.current) {
      const status = selectedStatus === "all" ? null : selectedStatus;
      const country = countryStatus === "All" ? null : countryStatus
      const date = selectedDate === 'All Date' ? null : selectedDate;
      getUsersAll(status, searchTermAll, country, date);
    }
  }, [allPage]);

  useEffect(() => {
    getUsersAll(null);
    // getUsersCreator(null);
    // getUsersFan(null);
    // getUsersInvestor(null);

    hasMounted.current = true;
  }, []);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
  const closeSheet = async() => {setIsSheetOpen(false);

    
    // await getUsersAll(null);
    if(statusFilter === 'all') {
      const status = selectedStatus === "all" ? null : selectedStatus;
      const country = countryStatus === "All" ? null : countryStatus
      const date = selectedDate === 'All Date' ? null : selectedDate;
      getUsersAll(status, searchTermAll, country, date);
    }else if (statusFilter === 'investor') {
      const status =
        selectedStatusInvestor === "all" ? null : selectedStatusInvestor;
        const country = countryInvestorStatus === "All" ? null : countryInvestorStatus
        const date = selectedInvestorDate === 'All Date' ? null : selectedInvestorDate;
      getUsersInvestor(status, searchTermInvestor, country, date);
    } else if (statusFilter === 'creator') {
      const status =
        selectedStatusCreator === "all" ? null : selectedStatusCreator;   
        const country = countryCreatorStatus === "All" ? null : countryCreatorStatus  
        const date = selectedCreatorDate === 'All Date' ? null : selectedCreatorDate;   
      getUsersCreator(status, searchTermCreator, country, date);
    } else {
      const status = selectedStatusFan === "all" ? null : selectedStatusFan;
      const country = countryFanStatus === "All" ? null : countryFanStatus
      const date = selectedFanDate === 'All Date' ? null : selectedFanDate;
      getUsersFan(status, searchTermFan, country, date);
    }

  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={profile.image}
                alt="@shadcn"
              />
              <AvatarFallback className="bg-gray-200 text-black">
                {profile.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{row.getValue("name")}</p>
              <p className="text-[#A4A4A4]">@{profile.username}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <p className="text-[#373737]">{row.getValue("country") || "Null"}</p>
      ),
    },
    {
      accessorKey: "subscription_plan",
      header: "Subscription type",
      cell: ({ row }) => (
        <p className="text-[#373737]">{row.getValue("subscription_plan")}</p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date joined",
      cell: ({ row }) => {
        const dateJoined = String(row.getValue("createdAt")).slice(0, 10); // Cast to string
        return <p className="text-[#373737]">{dateJoined}</p>;
      },
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
      accessorKey: "profile",
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
                onClick={async () => {
                  await getUserPosts(profile.id, "all");
                  router.push("/members/posts");
                }}
              >
                <span>
                  <Image
                    src={"/icons/deletepost.svg"}
                    alt="viewIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>View Post</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={() => {
                  openSheet();
                  setprofileData(profile);
                }}
              >
                <span>
                  <Image
                    src={"/icons/profileIcon.svg"}
                    alt="profileIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>View Profile</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                // onClick={openSheet}
              >
                <span>
                  <Image
                    src={"/icons/restorepost.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Activate Profile</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    if (!userLoading) {
      setIsInitialLoading(false);
    }
  }, [userLoading]);

  if (userLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading users..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      <div>
        <h2 className="text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]"> Onboarded Users</h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
View and Manage a list of Onboarded Users
        </p>
      </div>
      <div>
        <Tabs defaultValue="all" className="space-y-7">
          <TabsList className="space-x-7 bg-transparent border-b rounded-none px-0 w-full justify-start pb-0">
            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getUsersAll(null);
                setStatusFilter('all')
              }}
              value="all"
            >
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none my-0 font-normal text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getUsersInvestor(null);
                setStatusFilter('investor')
              }}
              value="investor"
            >
              Investor ({investorCount})
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none my-0 font-normal text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getUsersCreator(null);
                setStatusFilter('creator')
              }}
              value="creator"
            >
              Creator ({creatorCount})
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none my-0 font-normal text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getUsersFan(null);
                setStatusFilter('fan')
              }}
              value="fan"
            >
              Fan ({fanCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
           
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-[16px]">
                    <Select
                     onValueChange={handleCountryChange}
                     value={countryStatus}
                    >
                      <SelectTrigger className="w-[128px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {countries.map((country) => (
            
                          <SelectItem value={country.name}>{country.name}</SelectItem> 
                          ))}
                         
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={handleStatusChange}
                      value={selectedStatus}
                    >
                      <SelectTrigger className="w-[118px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {/* <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex justify-center space-x-[12px] items-center min-w-[96px] w-max border border-[#E4E4E4] rounded-md shadow-sm">
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-max text-black justify-end hover:bg-transparent space-x-2 text-left px-2 font-normal border-transparent",
                              !date && "text-muted-foreground text-black "
                            )}
                          >
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span className="text-black text-[14px]">
                                Date
                              </span>
                            )}
                            <Image
                              src="./icons/calendarIcon.svg"
                              height={15}
                              width={16.25}
                              alt="calendarIcon"
                            />
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover> */}
                    <Select onValueChange={handleDateChange} value={selectedDate}>
      <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
        <SelectValue placeholder="Select Date" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {dateOptions.map((option) => (
            <SelectItem key={option.name} value={option.value ?? 'null'}>
              {option.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
                  </div>
                  <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md shadow-sm">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Username, full name..."
                      value={searchTermAll}
                      onChange={(e) => setSearchTermAll(e.target.value)}
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                    />
                  </div>
                </div>

                <UserTable
                  data={usersAll}
                  columns={columns}
                  placeholder="Search username, full name..."
                />
                 <div className="flex items-center justify-start space-x-2 px-4 py-4">
        <div>
          <p className="text-[14px]">
          {(pagination?.page - 1) * pagination?.limit + 1} -{" "}
          {Math.min(pagination?.page * pagination?.limit, pagination?.totalDocs)} of {pagination?.totalDocs}
          </p>
        </div>
        <Button
          className="p-0 bg-transparent hover:bg-transparent"
          size="sm"
          onClick={() => {
            if (pagination?.hasPrevPage) {
              setAllPage((prevPage) => prevPage - 1); 
            }
          }}
          disabled={pagination?.page <= 1}
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
            if (pagination?.hasNextPage) {
              setAllPage((prevPage) => prevPage + 1); 
            }
          }}
          disabled={pagination?.page * pagination?.limit >=
            pagination?.totalDocs
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
              

            
          </TabsContent>
          <TabsContent value="investor">
           
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-[16px]">
                  <Select
                     onValueChange={handleInvestorCountryChange}
                     value={countryInvestorStatus}
                    >
                      <SelectTrigger className="w-[128px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {countries.map((country) => (
            
                          <SelectItem value={country.name}>{country.name}</SelectItem> 
                          ))}
                         
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={handleStatusChangeInvestor}
                      value={selectedStatusInvestor}
                    >
                      <SelectTrigger className="w-[118px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select onValueChange={handleInvestorCountryChange} value={selectedInvestorDate}>
      <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
        <SelectValue placeholder="Select Date" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {dateOptions.map((option) => (
            <SelectItem key={option.name} value={option.value ?? 'null'}>
              {option.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
                  </div>
                  <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md ">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Username, full name..."
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                      value={searchTermInvestor}
                      onChange={(e) => setSearchTermInvestor(e.target.value)}
                    />
                  </div>
                </div>

                <UserTable
                  data={usersInvestor}
                  columns={columns}
                  placeholder="Search username, full name..."
                />
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
              setInvestorPage((prevPage) => prevPage - 1); 
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
              setInvestorPage((prevPage) => prevPage + 1); 
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
              
           
          </TabsContent>
          <TabsContent value="creator">
           
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-[16px]">
                  <Select
                     onValueChange={handleCreatorCountryChange}
                     value={countryCreatorStatus}
                    >
                      <SelectTrigger className="w-[128px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {countries.map((country) => (
            
                          <SelectItem value={country.name}>{country.name}</SelectItem> 
                          ))}
                         
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={handleStatusChangeCreator}
                      value={selectedStatusCreator}
                    >
                      <SelectTrigger className="w-[118px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select onValueChange={handleCreatorDateChange} value={selectedCreatorDate}>
      <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
        <SelectValue placeholder="Select Date" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {dateOptions.map((option) => (
            <SelectItem key={option.name} value={option.value ?? 'null'}>
              {option.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
                  </div>
                  <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md ">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Username, full name..."
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                      value={searchTermCreator}
                      onChange={(e) => setSearchTermCreator(e.target.value)}
                    />
                  </div>
                </div>

                <UserTable
                  data={usersCreator}
                  columns={columns}
                  placeholder="Search username, full name..."
                />
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
              setCreatorPage((prevPage) => prevPage - 1); 
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
              setCreatorPage((prevPage) => prevPage + 1); 
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
          </TabsContent>
          <TabsContent value="fan">
           
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-[16px]">
                  <Select
                     onValueChange={handleFanCountryChange}
                     value={countryFanStatus}
                    >
                      <SelectTrigger className="w-[128px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {countries.map((country) => (
            
                          <SelectItem value={country.name}>{country.name}</SelectItem> 
                          ))}
                         
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={handleStatusChangeFan}
                      value={selectedStatusFan}
                    >
                      <SelectTrigger className="w-[118px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select onValueChange={handleFanDateChange} value={selectedFanDate}>
      <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
        <SelectValue placeholder="Select Date" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {dateOptions.map((option) => (
            <SelectItem key={option.name} value={option.value ?? 'null'}>
              {option.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
                  </div>
                  <div className="flex w-[350px] items-center border border-[#E4E4E4] px-2 rounded-md ">
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                    />
                    <Input
                      placeholder="Search Username, full name..."
                      className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
                      value={searchTermFan}
                      onChange={(e) => setSearchTermFan(e.target.value)}
                    />
                  </div>
                </div>

                <UserTable
                  data={usersFan}
                  columns={columns}
                  placeholder="Search username, full name..."
                />
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
              setFanPage((prevPage) => prevPage - 1); 
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
              setFanPage((prevPage) => prevPage + 1); 
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
             
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
     
        <SheetContent className="sm:max-w-[519px] overflow-y-auto scrollbar-hide">
          <SheetHeader>
            <SheetTitle className="flex justify-between">
              <p className="text-[#111810] font-medium text-[20px]">
                User Details
              </p>
              <Image
                src="/DASHBOARDASSETS/ICONS/CANCEL WITH FILL.svg"
                alt="cancelIcon"
                className="cursor-pointer transition-all active:scale-95 "
                onClick={() => {
                  closeSheet()
                }}
                width={26}
                height={26}
              />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col">
            <div className="flex items-center space-x-[12px] mt-[40px] mb-[28px]">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={profileData?.image}
                alt="@shadcn"
              />
              <AvatarFallback className="bg-gray-200 text-black">
              {profileData?.name?.[0] || ""}              </AvatarFallback>
            </Avatar>
              <div>
                <p className="text-[20px] font-medium text-[#111810]">
                  {profileData?.full_name}
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
                    <p className="text-[#808080]">Creator</p>
                  </p>
                  <p className="h-1 w-1 rounded-full bg-[#C8C8C8]"></p>
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
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-between border rounded-md p-3 mb-[40px]">
              <div className="flex flex-col space-y-1">
                <p className="text-[#A4A4A4] text-[14px]">Members in forum</p>
                <h2 className="font-Recoleta font-medium text-[28px]">
                  {profileData?.noOfMembers}
                </h2>
              </div>
              <div className="h-[61px] w-[1px] bg-[#E4E4E4]"></div>
              <div className="flex flex-col space-y-1 ">
                <p className="text-[#A4A4A4] text-[14px]  ">
                  Post in portfolio
                </p>
                <h2 className="font-Recoleta font-medium text-[28px] flex ">
                  {profileData?.noOfPosts}
                </h2>
              </div>
            </div>
            <div className="space-y-[24px] mb-[32px]">
              <p className="font-semibold text-sm">Personal Info</p>

              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Full Name</p>
                <p className="">{profileData?.full_name}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Email</p>
                <p className="text-[#F75803]">{profileData?.email}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Phone Number</p>
                <p className="text-[#F75803]">{profileData?.phone_number}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Country</p>
                <p className="">{profileData?.country || "Null"}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Interested Creators</p>
                <p className="">___</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Active Camapaigns</p>
                <p className="">Active Campaigns</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4] line-clamp-2">Date Joined</p>
                <p className="">{profileData?.createdAt?.substring(0, 10)}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">No Of Investor</p>
                <p className="">___</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Verification</p>
                <p className="">{profileData?.verification_type}</p>
              </div>
            </div>
          </div>
          <SheetFooter>
            {profileData?.status === "active" ? (
              <Button
                onClick={async () => {
                  try {
                    const data = await updateStatus(
                      profileData?.id,
                      "inactive"
                    );

                    setprofileData(data);
                  } catch (error) {
                  }
                }}
                className="w-full bg-[#C83532] text-white hover:bg-[#C83532] transition-all active:scale-95"
              >
                Restrict Account
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    const data = await updateStatus(profileData?.id, "active");
                    setprofileData(data);
                  } catch (error) {
                  }
                }}
                className="w-full bg-[#2BAC47] text-white hover:bg-[#2BAC47] transition-all active:scale-95"
              >
                Activate Account
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Members;
