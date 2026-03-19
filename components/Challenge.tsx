"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { UserTable } from "@/components/UserTable";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useChallenge from "@/hooks/useChallenge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateChallengeEdit } from "@/redux/slices/challengeslice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import LoadingOverlay from "@/components/LoadingOverlay";
import LoadingState from "@/components/LoadingState";
import { dateOptions } from "@/utils/interface";

const Challenge = () => {
  const router = useRouter();
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const closeDeleteDialog = () => setisDeleteOpen(false);
  const { challengeAll, challengeEdit } = useSelector(
    (state: RootState) => state.challenge
  );
  const { hasNextPage, hasPrevPage, limit, page, totalDocs } = useSelector(
    (state: RootState) => state.challenge.pagination
  );
  const [date, setDate] = useState<Date>();
  const [selectedDate, setSelectedDate] = useState<any>("All Date");
  const handleDateChange = (value: any) => {
    setSelectedDate(value);
  };

  const dispatch = useDispatch<AppDispatch>();
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
  const { getAllChallenges, deleteChallenge, challengeLoading, challengePage, setChallengePage } = useChallenge();
  const [searchString, setSearchString] = useState<string>("");

  useEffect(() => {
    setChallengePage(1);
    const date = selectedDate === 'All Date' ? null : selectedDate;
    getAllChallenges(searchString, date);
  }, [searchString, selectedDate]);

  useEffect(() => {
    const date = selectedDate === 'All Date' ? null : selectedDate;
    getAllChallenges(searchString, date);
  }, [challengePage]);
  const [challengeId, setChallengeId] = useState<number>(1);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="text-[14px] text-[#373737]">{row.getValue("name")}</p>
        </div>
      ),
    },
    {
      accessorKey: "hashtag",
      header: "Hashtag",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("hashtag")}</p>
      ),
    },
    {
      accessorKey: "entries",
      header: "Entries",
      cell: ({ row }) => {
        const entries = row.original.entries;
        return (
          <p className="text-[14px] text-[#373737]">{`${entries} entries`}</p>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date Created",
      cell: ({ row }) => {
        const dateCreated = row.original.createdAt?.substring(0, 10);
        return <p className="text-[14px] text-[#373737]">{dateCreated}</p>;
      },
    },
    {
      accessorKey: "duration",
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

        if (daysDifference === 0) {
          return <p className="text-[14px] text-[#373737]">Today</p>;
        }

        return (
          <p className="text-[14px] text-[#373737]">{daysDifference}days</p>
        );
      },
    },
    {
      accessorKey: "options",
      header: "",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center justify-end space-x-4">
            <Image
              src={"/icons/editbl.svg"}
              width={15.62}
              height={15.62}
              className="cursor-pointer"
              alt="editIcon"
              onClick={() => {
                dispatch(updateChallengeEdit(profile));
                router.push("/challenge/edit");
              }}
            />
            <Image
              src={"/icons/deleteIconred.svg"}
              width={15.62}
              height={15.62}
              className="cursor-pointer"
              onClick={() => {
                setChallengeId(profile.id);
                setisDeleteOpen(true);
              }}
              alt="deleteIconred"
            />
          </div>
        );
      },
    },
  ];

  const hasChallenges = (challengeAll?.length ?? 0) > 0;

  if (challengeLoading && !hasChallenges) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading challenges..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-7">
      {challengeLoading && hasChallenges && (
        <LoadingOverlay message="Processing..." />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className=" text-2xl">Challenge</h2>
          <p className="text-sm text-[#A8A8A8]">
            Lorem ipsum dolor sit amet consectetur.
          </p>
        </div>
        <div>
          <Button
            onClick={() => {
              router.push("/challenge/create");
            }}
            className="btnColored"
          >
            <span>
              <PlusIcon size={20} />
            </span>
            Add Challenge
          </Button>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-[16px]">
            {/* <Select>
              <SelectTrigger className="w-[104px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                <SelectValue placeholder="All Title" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup></SelectGroup>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[118px] focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#E4E4E4] shadow-sm">
                <SelectValue placeholder="All Hashtag" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup></SelectGroup>
              </SelectContent>
            </Select> */}
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
          <div className="flex w-[350px] items-center border px-2 rounded-md ">
            <Image
              src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
              width={20}
              height={19.88}
              alt="searchIcon"
            />
            <Input
              placeholder="Search Challenge name"
              className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)} // Update search string on input change
            />
          </div>
        </div>
        <UserTable columns={columns} data={challengeAll} />
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
                         setChallengePage((prevPage) => prevPage - 1); 
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
                         setChallengePage((prevPage) => prevPage + 1); 
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

      <Dialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/DASHBOARDASSETS/ILLUSTRATION/DELETE.png"}
              height={72}
              width={69.68}
              alt="trashIcon"
            />
            <p className="text-[20px] font-medium">Delete this Challege?</p>
            <p className="text-[14px] text-center text-[#808080]">
              Are you sure you want to delete this challenge? This action is
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
                  await deleteChallenge(challengeId);
                  getAllChallenges();
                }}
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

export default Challenge;
