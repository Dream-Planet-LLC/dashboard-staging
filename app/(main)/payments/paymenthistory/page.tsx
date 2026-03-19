"use client";
import { UserTable } from "@/components/UserTable";
import { paymentData } from "@/mock/row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import usePayment from "@/hooks/usePayment";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Input } from "@/components/ui/input";
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
import LoadingOverlay from "@/components/LoadingOverlay";
import LoadingState from "@/components/LoadingState";
import { dateOptions } from "@/utils/interface";

const PaymentHistory = () => {
  const { history, stats } = useSelector((state: RootState) => state.payment);
  const [date, setDate] = useState<Date>();
  const { hasNextPage, hasPrevPage, limit, page, totalDocs } = useSelector(
    (state: RootState) => state.payment.pagination
  );
  const [searchString, setSearchString] = useState<string>("");

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
                src={profile?.user_image}
                alt="@shadcn"
              />
              <AvatarFallback>{profile?.user_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p>{profile?.user_name}</p>
              <p className="text-[#A4A4A4]">@{profile?.user_username}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user_type",
      header: "User type",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">
          {row.getValue("user_type")}
        </p>
      ),
    },
    {
      accessorKey: "payment_type",
      header: "Payment type",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">
          {row.getValue("payment_type")}
        </p>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#2BAC47]">
          + ${row.getValue("amount")}
        </p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string; // Cast to string
        const formattedDate = new Date(createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return <p className="text-[14px] text-[#373737]">{formattedDate}</p>;
      },
    },
  ];

  const { getPaymentHistory, paymentLoading, paymentPage,setPaymentPage } = usePayment();

  const paymentOptions = [
    "Wallet top-up",
    "campaign donation",
    "subscription plan update",
  ];
  const userOptions = ["creator", "fan", "investor"];
  const [selectedDate, setSelectedDate] = useState<any>("All Date");
  const handleDateChange = (value: any) => {
    setSelectedDate(value);
  };
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>(
    []
  );
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);

  const togglePaymentDropdown = () => setIsPaymentOpen((prev) => !prev);
  const toggleUserDropdown = () => setIsUserOpen((prev) => !prev);

  const handleCheckboxChange = (
    option: string,
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    options: string[]
  ) => {
    setSelected((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      return [...prev, option];
    });
  };

  const handleSelectAllChange = (
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    options: string[]
  ) => {
    setSelected((prev) => {
      return prev.length === options.length ? [] : options;
    });
  };
  useEffect(() => {
    setPaymentPage(1);
    const date = selectedDate === 'All Date' ? null : selectedDate;
    getPaymentHistory(
      selectedUserTypes.length ? selectedUserTypes : null,
      selectedPaymentTypes.length ? selectedPaymentTypes : null,
      searchString,
      date
    );
  }, [selectedPaymentTypes, selectedUserTypes, searchString, selectedDate]);

  useEffect(() => {
    const date = selectedDate === 'All Date' ? null : selectedDate;
    getPaymentHistory(
      selectedUserTypes.length ? selectedUserTypes : null,
      selectedPaymentTypes.length ? selectedPaymentTypes : null,
      searchString,
      date
    );
  }, [paymentPage]);


  const hasHistory = (history?.length ?? 0) > 0;

  if (paymentLoading && !hasHistory) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading payment history..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      {paymentLoading && hasHistory && (
        <LoadingOverlay message="Processing..." />
      )}
      <div>
        <h2 className="text-2xl"> Payment history</h2>
        <p className="text-sm text-[#A8A8A8]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>
      <div className="flex items-center space-x-10">
        <div className="space-y-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#F79203] "></div>
            <p className="text-[#373737] text-[14px]">
              Total amount of donation
            </p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">
            ${stats?.total_donation}
          </p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#BF3100] "></div>
            <p className="text-[#373737] text-[14px]">
              Total amount of wallet top-up
            </p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">
            ${stats?.total_wallet_topup}
          </p>
        </div>
        <div className="border-l space-y-2 pl-2">
          <p className="flex items-center text-sm  py-0 space-x-[4px]">
            <div className="w-[3px] h-[12px] rounded-[32px] bg-[#111810] "></div>
            <p className="text-[#373737] text-[14px]">
              Total amount of subscription
            </p>
          </p>
          <p className="text-[32px] font-Recoleta font-medium">
            ${stats?.total_subscription}
          </p>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-[16px]">
            <div className="flex flex-col space-y-2">
              <div className="border p-2 rounded-md relative">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={togglePaymentDropdown}
                >
                  <span className="mr-4 text-[14px] font-medium">
                    Payment Options
                  </span>

                  <Image
                    src={"/icons/dropdownIcon.svg"}
                    alt="dropdownIcon"
                    width={16}
                    height={16}
                  />
                </div>
                {isPaymentOpen && (
                  <div className="absolute bg-white z-30 border rounded-md shadow-lg mt-3 w-full">
                    <div className="flex items-center p-1">
                      <div
                        onClick={() =>
                          handleSelectAllChange(
                            setSelectedPaymentTypes,
                            paymentOptions
                          )
                        }
                        className={`border-2 border-[#F75803] rounded-sm w-4 h-4 flex items-center justify-center cursor-pointer ${
                          selectedPaymentTypes.length === paymentOptions.length
                            ? "bg-[#fdd7c3]"
                            : ""
                        }`}
                      >
                        {selectedPaymentTypes.length ===
                          paymentOptions.length && (
                          <span className="text-[#F75803]">✓</span>
                        )}
                      </div>
                      <span className="ml-2 text-[14px] text-[#808080]">
                        Select All
                      </span>
                    </div>
                    {paymentOptions.map((option) => (
                      <div key={option} className="flex items-center p-1  z-30">
                        <div
                          onClick={() =>
                            handleCheckboxChange(
                              option,
                              setSelectedPaymentTypes,
                              paymentOptions
                            )
                          }
                          className={`border-2 border-[#F75803] rounded-sm w-4 h-4 flex items-center justify-center cursor-pointer ${
                            selectedPaymentTypes.includes(option)
                              ? "bg-[#fdd7c3]"
                              : ""
                          }`}
                        >
                          {selectedPaymentTypes.includes(option) && (
                            <span className="text-[#F75803]">✓</span>
                          )}
                        </div>
                        <span className="ml-2  text-[14px] text-[#808080]">
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Type Section */}
            <div className="flex flex-col space-y-2">
              <div className="border p-2 rounded-md relative">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={toggleUserDropdown}
                >
                  <span className="mr-4 text-[14px] font-medium">
                    User Options
                  </span>
                  <Image
                    src={"/icons/dropdownIcon.svg"}
                    alt="dropdownIcon"
                    width={16}
                    height={16}
                  />
                </div>
                {isUserOpen && (
                  <div className="absolute z-30 bg-white border rounded-md shadow-lg mt-3 w-full">
                    <div className="flex items-center p-1">
                      <div
                        onClick={() =>
                          handleSelectAllChange(
                            setSelectedUserTypes,
                            userOptions
                          )
                        }
                        className={`border-2 border-[#F75803] rounded-md w-4 h-4 flex items-center justify-center cursor-pointer ${
                          selectedUserTypes.length === userOptions.length
                            ? "bg-[#fdd7c3]"
                            : ""
                        }`}
                      >
                        {selectedUserTypes.length === userOptions.length && (
                          <span className="text-[#F75803]">✓</span>
                        )}
                      </div>
                      <span className="ml-2 text-[14px] text-[#808080]">
                        Select All
                      </span>
                    </div>
                    {userOptions.map((option) => (
                      <div key={option} className="flex items-center p-1">
                        <div
                          onClick={() =>
                            handleCheckboxChange(
                              option,
                              setSelectedUserTypes,
                              userOptions
                            )
                          }
                          className={`border-2 border-[#F75803] rounded-md w-4 h-4 flex items-center justify-center cursor-pointer ${
                            selectedUserTypes.includes(option)
                              ? "bg-[#fdd7c3]"
                              : ""
                          }`}
                        >
                          {selectedUserTypes.includes(option) && (
                            <span className="text-[#F75803]">✓</span>
                          )}
                        </div>
                        <span className="ml-2 text-[14px] text-[#808080]">
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
            />
          </div>
        </div>
        <UserTable data={history} columns={columns} />
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
                         setPaymentPage((prevPage) => prevPage - 1); 
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
                         setPaymentPage((prevPage) => prevPage + 1); 
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

export default PaymentHistory;
