"use client";
import { UserTable } from "@/components/UserTable";
import { accessData } from "@/mock/row";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical, PlusIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const foul = [
  {
    name: "yen",
  },
  {
    name: "shh",
  },
  {
    name: "ohh",
  },
  {
    name: "dahhh",
  },
];

const foulwords = () => {
  const [isOpen, setisOpen] = useState(false);
  const closeDialog = () => setisOpen(false);
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Foul Words",
      cell: ({ row }) => {
        return (
          <div>
            <p>{row.getValue("name")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "options",
      header: "",
      cell: () => {
        return (
          <div className="flex items-center justify-end space-x-2">
            <Image
              src={"/icons/editbl.svg"}
              width={15.62}
              height={15.62}
              className="cursor-pointer"
              alt="editIcon"
            />
            <Image
              src={"/icons/delete.svg"}
              width={15.62}
              height={15.62}
              className="cursor-pointer"
              alt="deleteIcon"
              onClick={() => {
                setisOpen(true);
              }}
            />
          </div>
        );
      },
    },
  ];
  return (
    <div className="flex flex-col space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">Foul Words</h2>
          <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
            Manage Blocked Words to Keep Community Conversations Safe
          </p>
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btnColored">
                <PlusIcon size={15} />{" "}
                <p className="text-14px">Add Foul Words</p>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-medium">Add Foul Word</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-2 mt-7">
                <Label htmlFor="foul" className="font-medium">
                  Foul Word
                </Label>
                <Input
                  id="foul"
                  placeholder="Enter Foul Word"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[12px] border-[#C8C8C8] placeholder:text-[#C8C8C8] placeholder:text-[14px]"
                />
              </div>

              <DialogFooter>
                <Button className="w-full btnColoredInactive" type="submit">
                  Add Word
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        <UserTable
          bottom={true}
          placeholder="Search for foul words"
          data={foul}
          columns={columns}
        />
      </div>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/icons/trash.png"}
              height={72}
              width={47.61}
              alt="trashIcon"
            />
            <p className="text-[20px]">Delete Foul Word?</p>
            <p className="text-[14px] text-center text-[#808080]">
              Are you sure you want to delete this Foul Word? This action is
              irreversible.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center items-center space-x-2">
              <Button
                className="w-full text-[14px] text-black bg-transparent hover:bg-transparent transition-all hover:scale-105 active:scale-95 border"
                type="submit"
              >
                Cancel
              </Button>
              <Button
                className="w-full text-[14px] text-white bg-[#C83532] hover:bg-[#C83532] transition-all hover:scale-105 active:scale-95"
                type="submit"
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

export default foulwords;
