"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EllipsisVertical, SearchIcon, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserTable } from "@/components/UserTable";
import { adminData } from "@/mock/row";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react"; // Arrow Icons
import Image from "next/image";
import useAdminsetting from "@/hooks/useAdminsetting";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import { updateRoles } from "@/redux/slices/adminsettingslice";

const features = [
  "Broadcast",
  "Users",
  "Challenge",
  "Payments",
  "Performance",
  "Report",
  "Admin Setting",
  "Investments",
  "Forum",
  "Change Password",
];

const AdminSetting = () => {
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { pagination, paginationPending } = useSelector(
    (state: RootState) => state.adminsetting
  );
  const {
    getAdminAccepted,
    getAdminPending,
    createAdminRole,
    updateAdminStatus,
    deleteAdmin,
    updateAdminRole,
    updateRole,
    deleteRole,
    adminLoading,
    pendingPage,
    setPendingPage,
    acceptedPage,
    setAcceptedPage,
  } = useAdminsetting();
  const { adminRoles, pendingAdmin, acceptedAdmin } = useSelector(
    (state: RootState) => state.adminsetting
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [adminId, setAdminId] = useState<number>(0);
  const [selectedMoveRole, setSelectedMoveRole] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [editingRole, setEditingRole] = useState<any>(null); // Role being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

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
  }, [isMoveDialogOpen]);
  useEffect(() => {
    getAdminPending();
  }, [pendingPage]);

  useEffect(() => {
    getAdminAccepted();
  }, [acceptedPage]);

  useEffect(() => {
    const hideChevronsInTrigger = () => {
      // Select all AccordionTrigger elements
      const triggers = document.querySelectorAll(".accordion-trigger");

      triggers.forEach((trigger) => {
        const chevrons = trigger.querySelectorAll(".lucide-chevron-down");
        chevrons.forEach((chevron) => {
          (chevron as HTMLElement).style.display = "none"; // Completely remove the element from layout
        });
      });
    };

    // Create a MutationObserver to monitor changes in the DOM
    const observer = new MutationObserver(() => {
      hideChevronsInTrigger();
    });

    // Observe changes in the entire document
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    hideChevronsInTrigger();

    // Clean up the observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
  };

  const openMoveDialog = () => setIsMoveDialogOpen(true);
  const closeMoveDialog = () => {
    setSelectedMoveRole(null);
    setIsMoveDialogOpen(false);
  };

  const handleRoleChange = (roleId: number) => {
    const selected = adminRoles.find((role) => role.id === roleId);
    if (selected) {
      setSelectedMoveRole({ id: selected.id, name: selected.name });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "first_name",
      header: "Admin Name",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage className="object-cover" src="" alt="@shadcn" />
              <AvatarFallback>{profile.first_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p>{row.getValue("first_name")}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("email")}</p>
      ),
    },
    {
      accessorKey: "role_name",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 border  text-xs font-medium w-max rounded-xl py-1 px-2">
          <span className="h-1 w-1 rounded-full bg-[#BF3100]"></span>
          <p>{row.getValue("role_name")}</p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date Joined",
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
            <DropdownMenuContent align="end" className="space-y-2">
              <DropdownMenuItem className="flex items-center space-x-2">
                <span>
                  <Image
                    src={"/icons/more.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>More info</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={() => {
                  setAdminId(profile?.id);
                  setIsMoveDialogOpen(true);
                }}
              >
                <span>
                  <Image
                    src={"/icons/change.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Change Role</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={async () => {
                  await deleteAdmin(profile?.id);
                  await getAdminAccepted();
                }}
              >
                <span>
                  <Image
                    src={"/icons/delete.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Delete Request</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const moveColumns: ColumnDef<any>[] = [
    {
      accessorKey: "first_name",
      header: "Admin Name",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Avatar>
              <AvatarImage className="object-cover" src="" alt="@shadcn" />
              <AvatarFallback>{profile.first_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p>{row.getValue("first_name")}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <p className="text-[14px] text-[#373737]">{row.getValue("email")}</p>
      ),
    },
    {
      accessorKey: "role_name",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 border  text-xs font-medium w-max rounded-xl py-1 px-2">
          <span className="h-1 w-1 rounded-full bg-[#BF3100]"></span>
          <p>{row.getValue("role_name")}</p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date Joined",
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
              <DropdownMenuItem className="flex items-center space-x-2">
                <span>
                  <Image
                    src={"/icons/more.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>More info</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={async () => {
                  await updateAdminStatus(profile.id);
                  await getAdminPending();
                }}
              >
                <span>
                  <Image
                    src={"/icons/move.svg"}
                    alt="moveIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Move to accepted</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await deleteAdmin(profile?.id);
                  await getAdminPending();
                }}
             
              >
                <span>
                  <Image
                    src={"/icons/delete.svg"}
                    alt="moreIcon"
                    width={16.25}
                    height={16.25}
                  />
                </span>
                <p>Delete Request</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setSelectedRole(role.name);
    setSelectedFeatures(role.features || []);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRole = (roleId: number, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setIsDeleteDialogOpen(true);
  };

const confirmDelete = async () => {
  if (!roleToDelete) return;

  const roleId = roleToDelete.id;

  // Close modal immediately
  setIsDeleteDialogOpen(false);
  setRoleToDelete(null);

  // Let UI update before loader appears
  await new Promise((res) => setTimeout(res, 50));

  await deleteRole(roleId);

  await getAdminAccepted(); // or refresh roles if you have getAdminRoles()
};


  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

const handleUpdateRole = async () => {
  if (!editingRole || !selectedRole || selectedFeatures.length === 0) return;
  await updateRole(editingRole.id, selectedRole, selectedFeatures);
};


  useEffect(() => {
    if (!adminLoading) {
      setIsInitialLoading(false);
    }
  }, [adminLoading]);

  if (adminLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading admin settings..." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-8 space-x-4">
      <section className="col-span-6 flex flex-col space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]">Admin Setting</h2>
            <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Add, Manage and Create Admin Roles.
            </p>
          </div>
          <div className="flex items-center space-x-[8px]">
            <Button
              onClick={() => {
                router.push("/addAdmin");
              }}
              className="btnColored"
            >
              <PlusIcon size={20} />
              Add Admin
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(true);
              }}
              className="btnPlain"
            >
              Create Role
            </Button>
          </div>
        </div>
        <div>
          <Tabs defaultValue="accepted">
            <TabsList className="space-x-7 bg-transparent border-b rounded-none px-0 w-full justify-start pb-0">
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                value="accepted"
                onClick={() => {
                  getAdminAccepted();
                }}
              >
                Accepted Request
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
                value="pending"
                onClick={() => {
                  getAdminPending();
                }}
              >
                Pending Request
              </TabsTrigger>
            </TabsList>
            <TabsContent value="accepted">
              <UserTable data={acceptedAdmin} columns={columns} />
              {pagination?.totalDocs !== 0 && (
                <div className="flex items-center justify-start space-x-2 px-4 py-4">
                  <div>
                    <p className="text-[14px]">
                      {(pagination?.page - 1) * pagination?.limit + 1} -{" "}
                      {Math.min(
                        pagination?.page * pagination?.limit,
                        pagination?.totalDocs
                      )}{" "}
                      of {pagination?.totalDocs}
                    </p>
                  </div>
                  <Button
                    className="p-0 bg-transparent hover:bg-transparent"
                    size="sm"
                    onClick={() => {
                      if (pagination?.hasPrevPage) {
                        setAcceptedPage((prevPage) => prevPage - 1);
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
                        setAcceptedPage((prevPage) => prevPage + 1);
                      }
                    }}
                    disabled={
                      pagination?.page * pagination?.limit >=
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
              )}
            </TabsContent>
            <TabsContent value="pending">
              <UserTable
                placeholder="Search for Admin Name"
                data={pendingAdmin}
                columns={moveColumns}
              />
              {paginationPending?.totalDocs !== 0 && (
                <div className="flex items-center justify-start space-x-2 px-4 py-4">
                  <div>
                    <p className="text-[14px]">
                      {(paginationPending?.page - 1) *
                        paginationPending?.limit +
                        1}{" "}
                      -{" "}
                      {Math.min(
                        paginationPending?.page * paginationPending?.limit,
                        paginationPending?.totalDocs
                      )}{" "}
                      of {paginationPending?.totalDocs}
                    </p>
                  </div>
                  <Button
                    className="p-0 bg-transparent hover:bg-transparent"
                    size="sm"
                    onClick={() => {
                      if (paginationPending?.hasPrevPage) {
                        setPendingPage((prevPage) => prevPage - 1);
                      }
                    }}
                    disabled={paginationPending?.page <= 1}
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
                      if (paginationPending?.hasNextPage) {
                        setPendingPage((prevPage) => prevPage + 1);
                      }
                    }}
                    disabled={
                      paginationPending?.page * paginationPending?.limit >=
                      paginationPending?.totalDocs
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
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <section className="col-span-2 border">
        <h2 className="p-[20px] pb-[12px] border-b font-medium">
          Admin Roles{" "}
          <span className="text-[#808080] font-Recoleta font-medium">
            ({adminRoles?.length})
          </span>
        </h2>
        <Accordion type="single" collapsible>
          {adminRoles.map((role: any) => (
            <AccordionItem className="px-[20px] pb-[16px]" value={role?.id}>
              <AccordionTrigger className=" accordion-trigger hover:no-underline  pt-[32px] pb-0">
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#373737] font-normal ">
                    {role?.name}
                    <span className="font-Recoleta font-medium text-[#F75803]">
                      {" "}
                      ({role?.features?.length})
                    </span>
                  </p>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <EllipsisVertical className="h-4 w-4 text-[#808080]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => handleEditRole(role)}
                      >
                        <Image
                          src="/icons/editicon.svg"
                          alt="Edit"
                          width={16}
                          height={16}
                        />
                        <span>Edit Role</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="flex items-center space-x-2 text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => handleDeleteRole(role.id, role.name)}
                      >
                        <Image
                          src="/icons/deleteiconred.svg"
                          alt=""
                          width={16}
                          height={16}
                        />
                        <span>Delete Role</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-[16px] space-y-[18px]">
                {role?.features?.map((feature: any) => (
                  <p className="text-[#7E2D02] text-[14px] flex items-center">
                    <span>
                      <Image
                        src={"/DASHBOARDASSETS/ICONS/PROFILE.svg"}
                        width={13.01}
                        height={12.51}
                        alt="profile Icon"
                        className="mr-[8px]"
                      />
                    </span>
                    {feature}
                  </p>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Dialog for "More Info" */}
      <Dialog
        open={isDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
            setIsEditDialogOpen(false);
            setEditingRole(null);
            setSelectedRole("");
            setSelectedFeatures([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[432px]  max-h-[80vh] overflow-y-scroll scrollbar-hide ">
          <DialogDescription className="hidden"></DialogDescription>
          <DialogHeader>
            <DialogTitle className="font-medium">
              {editingRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="creator" className="font-medium">
                Role
              </Label>

              {/* <Select onValueChange={(value) => setSelectedRole(value)}>
                <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Sub-admin">Sub-Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select> */}
              <Input
                placeholder="Select Role"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                }}
                className="focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-0 p-[12px] placeholder:text-[#111810] rounded-[8px] border-[#C8C8C8]"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="features" className="font-medium">
                Features
              </Label>
              <button
                className="w-full border p-2 text-left flex justify-between items-center rounded-[8px] border-[#C8C8C8]"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="flex space-x-2 flex-wrap items-center">
                  {selectedFeatures.length > 0 ? (
                    selectedFeatures.slice(0, 2).map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-1 bg-[#F1F1F1] px-2 py-1 rounded text-[14px]"
                      >
                        <span>{feature}</span>
                        <XIcon
                          size={16}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFeature(feature);
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <span className="text-[14px]">Select Features</span>
                  )}
                  {selectedFeatures.length > 1 && (
                    <div className="flex items-center">
                      <p>....</p>
                      <div className="ml-2 bg-[#808080] text-white px-2 py-1 rounded">
                        {selectedFeatures.length}
                      </div>
                    </div>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {/* Expandable section */}
              {isExpanded && (
                <div className="border transition-all px-2 pt-2 w-full">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center space-x-2 py-2 cursor-pointer"
                      onClick={() => toggleFeature(feature)}
                    >
                      <div
                        className={`w-4 h-4 flex items-center border justify-center  ${
                          selectedFeatures.includes(feature)
                            ? "bg-[#F75803] border-0"
                            : "bg-white "
                        }`}
                      >
                        {selectedFeatures.includes(feature) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-[14px]">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            {selectedRole && selectedFeatures.length > 0 ? (
              <>
                <Button
                  className="bg-transparent hover:bg-transparent transition hover:scale-105 active:scale-95 text-black border"
                  onClick={() => {
                    closeDialog();
                    setIsEditDialogOpen(false);
                    setEditingRole(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    // Close modal immediately
                    closeDialog();
                    setIsEditDialogOpen(false);
                    setEditingRole(null);

                    await new Promise((res) => setTimeout(res, 50));

                    if (editingRole) {
                      await updateRole(
                        editingRole.id,
                        selectedRole,
                        selectedFeatures
                      );
                    } else {
                      await createAdminRole(selectedRole, selectedFeatures);
                    }

                    await getAdminAccepted();
                  }}
                  className="bg-[#F75803] hover:bg-[#F75803] transition hover:scale-105 active:scale-95"
                >
                  {editingRole ? "Update Role" : "Create Role"}
                </Button>
              </>
            ) : (
              <>
                <Button className="btnPlainInactive">Cancel</Button>
                <Button className="btnColoredInactive">Update</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMoveDialogOpen} onOpenChange={closeMoveDialog}>
        <DialogContent className="sm:max-w-[432px] px-0">
          <DialogHeader className="border-b pb-[18px]">
            <DialogTitle className="px-[16px] flex justify-between items-center">
              <DialogDescription className="hidden"></DialogDescription>
              <p className="font-medium">Move Admin</p>
              <span
                className="cursor-pointer transition-all active:scale-95"
                onClick={closeMoveDialog}
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
          <div className="px-[16px] grid gap-4 py-[31px]">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="creator" className="font-medium">
                Role
              </Label>

              <Select
                onValueChange={(value) => handleRoleChange(Number(value))}
              >
                <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {adminRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="px-[16px]">
            <Button
              className="bg-transparent hover:bg-transparent transition hover:scale-105 active:scale-95 text-black border"
              onClick={closeMoveDialog}
            >
              Cancel
            </Button>
            {selectedMoveRole !== null ? (
              <Button
                onClick={async () => {
                  closeMoveDialog();
                  await updateAdminRole(
                    adminId,
                    selectedMoveRole.id,
                    selectedMoveRole.name
                  );
                }}
                className="bg-[#F75803] hover:bg-[#F75803] transition hover:scale-105 active:scale-95"
              >
                Move
              </Button>
            ) : (
              <Button disabled={true} className="bgColoredInactive">
                Move
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[432px]">
          <DialogHeader>
            <DialogTitle className="font-medium text-lg">
              Are you sure you want to delete this role?
            </DialogTitle>
            <DialogDescription className="text-[#373737] pt-2">
              Role: <span className="font-medium">"{roleToDelete?.name}"</span>
              <br />
              <br />
              This action cannot be undone. Any admins assigned to this role
              will lose access to its features.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="border hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSetting;
