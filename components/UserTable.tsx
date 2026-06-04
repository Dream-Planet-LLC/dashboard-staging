"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SearchIcon } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  placeholder?: string;
  top?: boolean;
  bottom?: boolean;
  loading?: boolean;
}

export function UserTable<TData, TValue>({
  columns,
  data,
  placeholder,
  top,
  bottom,
  loading,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20, 
      },
    },
  });

  const totalItems = table?.getFilteredRowModel()?.rows?.length || 0;

  
  return (
    <div className="flex flex-col space-y-3 mt-[20px]">
      {top && (
        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex w-[350px] items-center border px-2 rounded-md ">
            <Image
              src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
              width={20}
              height={19.88}
              alt="searchIcon"
            />
            <Input
              placeholder={placeholder}
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
            />
          </div>
        </div>
      )}
      {bottom && (
        <div className="my-2">
          <div className="flex w-[350px] items-center border px-2 rounded-md">
            <Image
              src={"/DASHBOARDASSETS/ICONS/SEARCH.svg"}
              width={20}
              height={19.88}
              alt="searchIcon"
            />
            <Input
              placeholder={placeholder}
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8]"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border-0">
        <Table className="border-none">
          <TableHeader className="rounded-[16px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-gray-100 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] rounded-[16px]"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="text-[#808080] h-[56px] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="mt-10">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20"
                >
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-[#F75803] border-t-transparent rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="h-[56px]" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
     
    </div>
  );
}
