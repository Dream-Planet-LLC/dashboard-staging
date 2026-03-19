"use client";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  XIcon,
  EllipsisVertical,
} from "lucide-react";
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
import { UserTable } from "@/components/UserTable";
import { reportData } from "@/mock/row";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import useReport from "@/hooks/useReport";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateCreatorData } from "@/redux/slices/reportslice";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import LoadingState from "@/components/LoadingState";

const ReportOverview = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Creator",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={profile?.user_image}
                alt={profile?.user_name[0]}
              />
              <AvatarFallback>{profile?.user_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p>{profile?.user_name}</p>
              <p className="text-[#A4A4A4]">@{profile.user_username}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "admin_email",
      header: "Assignee",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">
          {row.getValue("admin_email")}
        </p>
      ),
    },
    {
      accessorKey: "admin_role",
      header: "Assignee's Role",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 border  text-xs font-medium w-max rounded-xl py-1 px-2">
          <span className="h-1 w-1 rounded-full bg-[#BF3100]"></span>
          <p>{row.getValue("admin_role")}</p>
        </div>
      ),
    },

    {
      accessorKey: "no_of_investors",
      header: "No. of Investor",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">
          {row.getValue("no_of_investors")} Investors
        </p>
      ),
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
              <DropdownMenuItem>
                <span>
                  <Image
                    src={"/icons/editaccess.svg"}
                    width={18}
                    height={13}
                    alt="editIcon"
                    className="mr-2"
                  />
                </span>
                Edit Access
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  dispatch(updateCreatorData(profile));
                  router.push("/evaluationReport");
                }}
              >
                <span>
                  <Image
                    src={"/icons/reportIcon.svg"}
                    width={18}
                    height={13}
                    alt="reportIcon"
                    className="mr-2"
                  />
                </span>
                Create Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>
                  <Image
                    src={"/icons/removemember.svg"}
                    width={18}
                    height={13}
                    alt="removeIcon"
                    className="mr-2"
                  />
                </span>
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const { creatorReport, admin, creator } = useSelector(
    (state: RootState) => state.report
  );

  const [isOpen, setisOpen] = useState(false);
  const closeOpenDialog = () => setisOpen(false);
  const { getCreatorReport, getAdmin, getCreator, createCreatorReport, reportLoading, reportPage, setReportPage } =
    useReport();
    const { hasNextPage, hasPrevPage, limit, page, totalDocs } = useSelector(
      (state: RootState) => state.report.pagination
    );

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
  }, [isOpen, setisOpen]);
  const [searchCreatorReport, setSearchCreatorReport] = useState("");

  const [searchReport, setSearchReport] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<{
    username: string;
    userId: number;
    image: string | undefined;
  } | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<{
    first_name: string;
    id: number;
  } | null>(null);
  const [investor, setInvestor] = useState<number | undefined>(undefined);

  useEffect(() => {
    getAdmin(adminSearch);
  }, [adminSearch]);

  useEffect(() => {
    setReportPage(1);
    getCreatorReport(searchCreatorReport);
  }, [searchCreatorReport]);

  useEffect(() => {
    getCreatorReport(searchCreatorReport);
  }, [reportPage]);

  useEffect(() => {
    getCreator(searchReport);
  }, [searchReport]);

  const handleSelectCreator = (creator: any) => {
    setSelectedCreator({
      username: creator.username,
      userId: Number(creator.userId),
      image: creator.image,
    });
    setSearchReport("");
  };

  const handleSelectAdmin = (admin: any) => {
    setSelectedAdmin({ first_name: admin.first_name, id: admin.id });
    setAdminSearch("");
  };

  const handleRemoveCreator = () => setSelectedCreator(null);
  const handleRemoveAdmin = () => setSelectedAdmin(null);

  const hasReportData = (creatorReport?.length ?? 0) > 0;

  if (reportLoading && !hasReportData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      {reportLoading && hasReportData && (
        <LoadingOverlay message="Processing..." />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Report</h2>
          <p className="text-sm text-[#A8A8A8]">
            Lorem ipsum dolor sit amet consectetur.
          </p>
        </div>
        <div>
          <Button
            onClick={() => {
              setisOpen(true);
            }}
            className="btnColored"
          >
            <span>
              <PlusIcon size={20} />
            </span>
            Add Creator
          </Button>
        </div>
      </div>
      <div>
        <div className="flex w-[350px] items-center border px-2 rounded-md">
          <Image
            src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
            width={20}
            height={19.88}
            alt="searchIcon"
          />
          <Input
            placeholder={"Search for Admin Name"}
            value={searchCreatorReport}
            onChange={(e) => {
              setSearchCreatorReport(e.target.value);
            }}
            className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
          />
        </div>
        <UserTable columns={columns} data={creatorReport} />
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
                         setReportPage((prevPage) => prevPage - 1); 
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
                         setReportPage((prevPage) => prevPage + 1); 
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
      <Dialog open={isOpen} onOpenChange={closeOpenDialog}>
        <DialogContent className="sm:max-w-[432px] max-h-[80%] px-0 rounded-full overflow-scroll scrollbar-hide">
          <DialogHeader className="pb-[18.5px] border-b">
            <DialogTitle className="px-[16px] flex justify-between items-center">
              <DialogDescription className="hidden"></DialogDescription>
              <p className="font-medium"> Add Creator</p>
              <span
                className="cursor-pointer transition-all active:scale-95"
                onClick={() => setisOpen(false)}
              >
                <Image
                  src="/DASHBOARDASSETS/ICONS/CANCEL.svg"
                  width={24}
                  height={24}
                  alt="cancel"
                />
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid px-[16px] mt-[32px] mb-[24px]  ">
            <div className="space-y-[16px] border-b pb-[32px]">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="creator" className="font-medium">
                  Creator
                </Label>
                <div className="w-full">
                  <div
                    className={cn(
                      "flex items-center border rounded-md px-1 py-1",
                      searchReport ? "border-[#F75803]" : "border-[#C8C8C8]"
                    )}
                  >
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                      className="ml-[12px]"
                    />
                    {selectedCreator ? (
                      <div className="flex items-center justify-between border rounded-[8px] space-x-[12px] w-[140px] ml-[8px] px-[8px] py-[4px]">
                        <div className="flex space-x-2 ">
                          <Avatar className="w-[16px] h-[16px]">
                            <AvatarImage
                              src={selectedCreator?.image}
                              alt="selectedImage"
                            />
                            <AvatarFallback>
                              {selectedCreator?.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[12px]">
                            {selectedCreator?.username}
                          </span>
                        </div>
                        <div>
                          <XIcon
                            size={16}
                            color="#C8C8C8"
                            className="cursor-pointer "
                            onClick={handleRemoveCreator}
                          />
                        </div>
                      </div>
                    ) : (
                      <Input
                        placeholder="Search for Creator"
                        className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 border-none placeholder:text-[#C8C8C8] placeholder:text-[14px]"
                        value={searchReport}
                        onChange={(e) => setSearchReport(e.target.value)}
                      />
                    )}
                  </div>
                  {searchReport && creator?.length > 0 && (
                    <div className="bg-white p-3 rounded-md border mt-1 z-10">
                      {creator?.map((person) => (
                        <div
                          key={person.userId}
                          className="p-2 cursor-pointer flex items-center space-x-[12px]"
                          onClick={() => handleSelectCreator(person)}
                        >
                          <Avatar className="w-[20px] h-[20px]">
                            <AvatarImage src={person?.image} alt={"image"} />
                            <AvatarFallback>
                              {person?.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[14px] font-medium">
                            {person.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Selection */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="assignee" className="font-medium">
                  Assignee
                </Label>
                <div className="w-full">
                  <div
                    className={cn(
                      "flex items-center border rounded-md px-1 py-1",
                      adminSearch ? "border-[#F75803]" : "border-[#C8C8C8]"
                    )}
                  >
                    <Image
                      src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
                      width={20}
                      height={19.88}
                      alt="searchIcon"
                      className="ml-[12px]"
                    />
                    {selectedAdmin ? (
                      <div className="flex items-center justify-between border rounded-[8px] space-x-[12px] w-[140px] ml-[8px] px-[8px] py-[4px]">
                        <div className="flex space-x-2 ">
                          <Avatar className="w-[16px] h-[16px]">
                            <AvatarImage src={""} alt="selectedImage" />
                            <AvatarFallback>
                              {selectedAdmin?.first_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[12px]">
                            {selectedAdmin?.first_name}
                          </span>
                        </div>
                        <div>
                          <XIcon
                            size={16}
                            color="#C8C8C8"
                            className="cursor-pointer "
                            onClick={handleRemoveAdmin}
                          />
                        </div>
                      </div>
                    ) : (
                      <Input
                        placeholder="Search for Admin"
                        className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 border-none placeholder:text-[#C8C8C8] placeholder:text-[14px]"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                      />
                    )}
                  </div>
                  {adminSearch && admin.length > 0 && (
                    <div className="bg-white p-3 rounded-md border mt-1 z-10">
                      {admin?.map((person) => (
                        <div
                          key={person.id}
                          className="p-2 cursor-pointer flex items-center space-x-2"
                          onClick={() => handleSelectAdmin(person)}
                        >
                          <Avatar className="w-[20px] h-[20px]">
                            <AvatarImage src="" alt="firstname" />
                            <AvatarFallback>
                              {person?.first_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-[14px]">
                            <p> {person?.first_name}</p>

                            <p className="text-[#808080] text-[12px]">
                              {person?.role_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="investor" className="font-medium">
                  No. of Investor
                </Label>
                <input
                  className="w-full p-2 rounded-[8px] outline-none border border-[#C8C8C8] placeholder:text-[#C8C8C8] placeholder:text-[14px] appearance-none"
                  type="text"
                  value={investor ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Set value as a number if it’s valid; otherwise, keep it as-is
                    if (/^\d*$/.test(value))
                      setInvestor(value === "" ? undefined : parseInt(value));
                  }}
                  placeholder="Enter no. of Investor"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-[16px]">
            {selectedCreator?.userId &&
            selectedAdmin?.id &&
            investor !== undefined &&
            investor !== null ? (
              <Button
                className="btnPlain w-[96px]"
                type="submit"
                onClick={() => {
                  setisOpen(false);
                  setSelectedAdmin(null);
                  setSelectedCreator(null);
                  setInvestor(undefined);
                }}
              >
                Cancel
              </Button>
            ) : (
              <Button className="btnPlainInactive w-[96px]" type="submit">
                Cancel
              </Button>
            )}

            {selectedCreator?.userId &&
            selectedAdmin?.id &&
            investor !== undefined &&
            investor !== null ? (
              <Button
                className="btnColored w-[96px]"
                type="submit"
                onClick={async () => {
                  await createCreatorReport(
                    selectedAdmin?.id,
                    selectedCreator?.userId,
                    investor
                  );
                  setisOpen(false);
                  setSelectedAdmin(null);
                  setSelectedCreator(null);
                  setInvestor(undefined);
                }}
              >
                Add
              </Button>
            ) : (
              <Button className="btnColoredInactive w-[96px]" type="submit">
                Add
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportOverview;
