"use client";

import LoadingState from "@/components/LoadingState";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { checkMarkIcon, MailIcon, PhoneIcon, requestIcon } from "@/svg";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface HireRequest {
  id: string;
  requester: {
    name: string;
    avatar?: string;
  };
  hiredBy: {
    name: string;
    avatar?: string;
  };
  amount: number;
  timeAgo: string;
  message: string;
  email: string;
  phone: string;
  status: "PENDING" | "ACCEPTED" | "COMPLETED";
}

interface HireStats {
  totalRequests: number;
  activeProjects: number;
  completedProjects: number;
}

interface TopCreator {
  name: string;
  category: string;
  hires: number;
  avatar?: string;
}

type TabType = "Pending" | "Accepted" | "Completed";

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockStats: HireStats = {
  totalRequests: 232000,
  activeProjects: 5200,
  completedProjects: 10300,
};

const mockTopCreators: TopCreator[] = [
  {
    name: "Liam Foster",
    category: "PHOTOGRAPHER",
    hires: 142,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "MUSICIAN",
    hires: 102,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "PHOTOGRAPHY",
    hires: 100,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "ARTIST",
    hires: 99,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "DESIGNER",
    hires: 80,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "PHOTOGRAPHER",
    hires: 67,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "MUSICIAN",
    hires: 66,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "VIDEOGRAPHER",
    hires: 65,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "DEVELOPER",
    hires: 52,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    name: "Liam Foster",
    category: "DJ",
    hires: 50,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
];

const mockHireRequests: HireRequest[] = [
  {
    id: "1",
    requester: {
      name: "Jordan Miller",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    hiredBy: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
    amount: 6000,
    timeAgo: "2 HOURS AGO",
    message:
      "Hello, I'm interested in hiring you for a collaboration project. Let me know your availability so we can move forward with the collaboration.",
    email: "sarah.chen@email.net",
    phone: "+2348070762056",
    status: "PENDING",
  },
  {
    id: "2",
    requester: {
      name: "Jordan Miller",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    hiredBy: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
    amount: 3200,
    timeAgo: "2 HOURS AGO",
    message:
      "Hello, I'm interested in hiring you for a collaboration project. Let me know your availability so we can move forward with the collaboration.",
    email: "sarah.chen@email.net",
    phone: "+2348070762056",
    status: "PENDING",
  },
  {
    id: "3",
    requester: {
      name: "Jordan Miller",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    hiredBy: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
    amount: 4500,
    timeAgo: "3 HOURS AGO",
    message:
      "Hello, I'm interested in hiring you for a collaboration project. Let me know your availability so we can move forward with the collaboration.",
    email: "sarah.chen@email.net",
    phone: "+2348070762056",
    status: "ACCEPTED",
  },
  {
    id: "4",
    requester: {
      name: "Collins Osueze",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    hiredBy: {
      name: "Emmanuel Adebayo",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    },
    amount: 3200,
    timeAgo: "2 HOURS AGO",
    message:
      "Hello, I'm interested in hiring you for a collaboration project. Let me know your availability so we can move forward with the collaboration.",
    email: "emmanuel@email.net",
    phone: "+2348070762056",
    status: "COMPLETED",
  },
];

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

const formatCompactNumber = (num: number): string => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum < 1000) {
    return sign + absNum.toString();
  } else if (absNum < 1_000_000) {
    const value = absNum / 1000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "K";
  } else if (absNum < 1_000_000_000) {
    const value = absNum / 1_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "M";
  } else {
    const value = absNum / 1_000_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "B";
  }
};

const HireMarketplacePage = () => {
  const [stats, setStats] = useState<HireStats | null>(null);
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [hireAmount, setHireAmount] = useState("");

  // Simulate API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStats(mockStats);
        setRequests(mockHireRequests);
        setTopCreators(mockTopCreators);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveRequest = (requestId: string) => {
    console.log("Approve request:", requestId);
    // API call to approve request
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log("Decline request:", requestId);
    // API call to decline request
  };

  const handleMoveToCompleted = (requestId: string) => {
    console.log("Move to completed:", requestId);
    // API call to mark as completed
  };

  const handleContinue = () => {
    console.log("Continue with amount:", hireAmount);
    setModalOpen(false);
    // API call to process hire request
  };

  const openHireModal = (request: HireRequest) => {
    setSelectedRequest(request);
    setHireAmount("");
    setModalOpen(true);
  };

  // Filter requests by status
  const getFilteredRequests = () => {
    return requests.filter((req) => {
      if (activeTab === "Pending") return req.status === "PENDING";
      if (activeTab === "Accepted") return req.status === "ACCEPTED";
      if (activeTab === "Completed") return req.status === "COMPLETED";
      return false;
    });
  };

  const filteredRequests = getFilteredRequests();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading hire marketplace..." />
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Hire Marketplace
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
         Process pending hire requests and track active project milestones.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-row gap-[109px] mt-[24px]">
        <div className=" flex items-center gap-[12px]">
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Total hire requests {requestIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.totalRequests || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Active projects {requestIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.activeProjects || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Completed projects {requestIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.completedProjects || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-[32px] w-full gap-[24px] md:flex md:flex-row flex-col">
        <div className="md:w-[70%] w-full h-full">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-[#F1F1F1] ">
            <button
              onClick={() => setActiveTab("Pending")}
              className={`pb-3 px-1 text-[14px] INT500 font-medium transition-colors relative tracking-[-1.5%] leading-[24px] ${
                activeTab === "Pending"
                  ? "text-[#F75803]"
                  : "text-[#111810] hover:text-[#5B5B5B]"
              }`}
            >
              Pending ({requests.filter((r) => r.status === "PENDING").length})
              {activeTab === "Pending" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F75803]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("Accepted")}
              className={`pb-3 px-1 text-[14px] INT500 font-medium transition-colors relative tracking-[-1.5%] leading-[24px] ${
                activeTab === "Accepted"
                  ? "text-[#F75803]"
                  : "text-[#808080] hover:text-[#5B5B5B]"
              }`}
            >
              Accepted ({requests.filter((r) => r.status === "ACCEPTED").length}
              )
              {activeTab === "Accepted" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F75803]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("Completed")}
              className={`pb-3 px-1 text-[14px] INT500 font-medium transition-colors relative tracking-[-1.5%] leading-[24px] ${
                activeTab === "Completed"
                  ? "text-[#F75803]"
                  : "text-[#808080] hover:text-[#5B5B5B]"
              }`}
            >
              Completed (
              {requests.filter((r) => r.status === "COMPLETED").length})
              {activeTab === "Completed" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F75803]" />
              )}
            </button>
          </div>

          {/* Request Cards */}
          <div className="space-y-[24px] py-[24px]">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-[#F1F1F1] p-5 shadow-[0_4px_8px_0_rgba(0,0,0,0.03)]"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <Avatar className="h-[40px] w-[40px]">
                      <AvatarImage src={request.requester.avatar} />
                      <AvatarFallback>
                        {request.requester.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                          <span className="text-[#111810]">
                            {request.requester.name}
                          </span>{" "}
                          <span className="text-[#A4A4A4]">requested</span>{" "}
                          <span className="text-[#111810]">
                            {request.hiredBy.name}
                          </span>
                        </p>
                        <p className="text-[#A8A8A8] INT500 font-medium text-[12px] leading-[16px] tracking-[6%]">
                          {request.timeAgo}
                        </p>
                      </div>
                      <div className="text-[#5B5B5B] INT500 font-medium text-[12px] leading-[16px] tracking-[6%] bg-[#E4E4E4] px-[8px] py-[4px] rounded-[4px]">
                        {formatCurrency(request.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="text-[#111810] INT400 w-full text-[14px] leading-[20px] tracking-[-1.8%] mb-3 bg-[#F7F7F7] p-[12px] rounded-[4px]">
                      "{request.message}"
                    </div>

                    <div className="flex items-center gap-3 my-[16px]">
                      <div className="flex items-center gap-2 text-[#5B5B5B] text-[12px]">
                        {MailIcon}

                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%] ">
                          {request.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#5B5B5B] text-[12px]">
                        {PhoneIcon}
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%] ">
                          {request.phone}
                        </span>
                      </div>
                    </div>

                    {request.status === "PENDING" && (
                      <div className="flex items-center gap-3 border-t border-[#F1F1F1] pt-[16px]">
                        <Button
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-[#F75803] hover:bg-[#E54D00] text-white INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium px-[12px] py-[10px] h-auto rounded-[12px] "
                        >
                          Approve request
                        </Button>
                        <Button
                          onClick={() => handleDeclineRequest(request.id)}
                          variant="outline"
                          className="border-[#F1F1F1] text-[#C83532] hover:bg-[#F7F7F7] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium px-[12px] py-[10px] h-auto rounded-[12px]"
                        >
                          Decline request
                        </Button>
                      </div>
                    )}

                    {request.status === "ACCEPTED" && (
                      <div className="flex items-center gap-3 border-t border-[#F1F1F1] pt-[16px]">
                    
                        <Button
                          onClick={() => handleMoveToCompleted(request.id)}
                          className="bg-[#F75803] hover:bg-[#E54D00]  text-white INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium px-[12px] py-[10px] h-auto rounded-[12px]"
                        >
                          Move to completed
                        </Button>
                      </div>
                    )}

                    {request.status === "COMPLETED" && (
                      <div className="flex items-center gap-2 border-t border-[#F1F1F1] pt-[16px]">
                    {checkMarkIcon}
                        <span className=" text-[#5B5B5B] INT500 text-[12px] leading-[16px] tracking-[6%] font-medium">
                          COMPLETED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Top Performing Creators */}
        <div className=" w-full h-full md:w-[30%] col-span-12 lg:col-span-4 bg-white  rounded-lg border border-[#F1F1F1] p-5 shadow-[0_4px_8px_0_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="text-[#F75803]"
            >
              <path d="M8 1L10.5 6H15.5L11.5 9.5L13 14.5L8 11L3 14.5L4.5 9.5L0.5 6H5.5L8 1Z" />
            </svg>
            <h3 className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
              Top Performing Creator
            </h3>
          </div>

          <div className="space-y-[20px] py-[20px]">
            {topCreators.map((creator, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-[40px] w-[40px]">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback>{creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[#111810] INT500 font-medium text-[14px] leading-[24px] tracking-[-1.5%]">
                      {creator.name}
                    </p>
                    <p className="text-[#A4A4A4] text-[12px] leading-[16px] tracking-[6%] INT500 font-medium">
                      {creator.category}
                    </p>
                  </div>
                </div>
                <p className="text-[#111810] INT500 font-medium text-[14px] leading-[24px] tracking-[-1.5%]">
                  {creator.hires} Hires
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hire Request Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[400px] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-[#F1F1F1]">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[#111810] INT500 font-medium text-[18px] leading-[24px]">
                Hire Marketplace
              </DialogTitle>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#5B5B5B] hover:text-[#373737]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="text-[#373737] INT500 text-[14px] leading-[20px] mb-2 block">
                Amount
              </label>
              <Input
                type="text"
                placeholder="Enter Amount"
                value={hireAmount}
                onChange={(e) => setHireAmount(e.target.value)}
                className="border-[#F1F1F1] focus-visible:ring-[#F75803]"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#F1F1F1] flex items-center justify-end gap-3">
            <Button
              onClick={() => setModalOpen(false)}
              variant="outline"
              className="border-[#F1F1F1] text-[#5B5B5B] hover:bg-[#F7F7F7] INT500 text-[14px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-[#F75803] hover:bg-[#E54D00] text-white INT500 text-[14px]"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HireMarketplacePage;
