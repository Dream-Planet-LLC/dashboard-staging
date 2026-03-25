"use client";
import { UserTable } from "@/components/UserTable";
import { accessData } from "@/mock/row";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";

const management = () => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Creator",
      cell: ({ row }) => {
        const original = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={original.image}
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p>{row.getValue("name")}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "users",
      header: "Task based",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("users")}</p>
      ),
    },
    {
      accessorKey: "type",
      header: "Type of Access",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("type")}</p>
      ),
    },
    {
      accessorKey: "options",
      header: "",
      cell: () => {
        return <EllipsisVertical className="h-4 w-4" />;
      },
    },
  ];
  return (
    <div className="flex flex-col space-y-7">
      <div>
        <h2 className="text-2xl">Access Management</h2>
        <p className="text-sm text-[#A8A8A8]">
          manage access roles and permissions across the platform
        </p>
      </div>
      <div>
        <UserTable
          bottom={true}
          placeholder="Search for Broadcast title"
          data={accessData}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default management;
