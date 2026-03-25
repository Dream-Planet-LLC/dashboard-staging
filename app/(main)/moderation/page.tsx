"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User } from "lucide-react";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface FlaggedProduct {
  id: string;
  type: "AUDIO" | "VIDEO" | "IMAGE";
  timeAgo: string;
  title: string;
  creator: string;
  thumbnail?: string;
  details: string;
  reporter: string;
}

interface FlaggedCreator {
  id: string;
  username: string;
  handle: string;
  avatar?: string;
  details: string;
}

interface LiveSession {
  id: string;
  watching: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  thumbnail?: string;
  details: string;
}

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockFlaggedProducts: FlaggedProduct[] = [
  {
    id: "1",
    type: "AUDIO",
    timeAgo: "2MINS AGO",
    title: "Luxury Watch Replica",
    creator: "@neetocreative",
    thumbnail: "",
    details:
      "Lorem ipsum dolor sit amet consectetur. Lectus lacus et dui facilisis interdum pellentesque et id. Diam cursus molestie et massa non facilisis ut augue duis.",
    reporter: "Wizzyboy",
  },
  {
    id: "2",
    type: "AUDIO",
    timeAgo: "5MINS AGO",
    title: "Luxury Watch Replica",
    creator: "@neetocreative",
    thumbnail: "",
    details: "Lorem ipsum dolor sit amet consectetur.",
    reporter: "JohnDoe",
  },
  {
    id: "3",
    type: "AUDIO",
    timeAgo: "10MINS AGO",
    title: "Luxury Watch Replica",
    creator: "@neetocreative",
    thumbnail: "",
    details: "Lorem ipsum dolor sit amet consectetur.",
    reporter: "JaneSmith",
  },
];

const mockFlaggedCreators: FlaggedCreator[] = [
  {
    id: "1",
    username: "TechGuru99",
    handle: "@neetocreative",
    avatar: "",
    details: "Lorem ipsum dolor sit amet consectetur.",
  },
];

const mockLiveSessions: LiveSession[] = [
  {
    id: "1",
    watching: "1.2K WATCHING",
    title: "Video Production 101",
    creator: "@neonvibes",
    creatorAvatar: "",
    thumbnail:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
    details: "Lorem ipsum dolor sit amet consectetur.",
  },
];

// ────────────────────────────────────────────────
// Component: FlaggedProductCard
// ────────────────────────────────────────────────
function FlaggedProductCard({ product }: { product: FlaggedProduct }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
  
    <div className="bg-white border border-[#F1F1F1] rounded-[6px] p-[16px]">
      <div className="flex items-center gap-[12px] ]">
        {/* Thumbnail */}
        <div className="w-[80px] h-[80px] bg-[#D9D9D9] rounded-[6px] flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0 gap-[1px]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-[6px]">
              <span className="text-[#F75803] INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase">
                {product.type} 
              </span>
              <span className="text-[#A4A4A4] INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase">
               •{" "} {product.timeAgo}
              </span>
            </div>
          </div>

          <h4 className="text-[#000000] INT500 text-[16px] leading-[24px] tracking-[-1.5%] font-medium">
            {product.title}
          </h4>
          <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            {product.creator}
          </p>
        </div>
      </div>

      {/* Collapsible Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center w-full py-[16px] mt-[16px] justify-between border-t border-[#F1F1F1] border-b border-dashed gap-1 text-[#A4A4A4] INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase hover:text-[#808080] transition-colors"
      >
        {showDetails ? "HIDE" : "SHOW"} DETAILS
        {showDetails ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showDetails && (
        <div className="mt-3 space-y-3">
          <p className="text-[#373737] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            {product.details}
          </p>

          <div className="flex items-center gap-2 text-[#808080] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            <User className="h-4 w-4" />
            <span>Reporter:</span>
            <span className="text-[#111810] INT500">
              {product.reporter}
            </span>
          </div>

       
        </div>
      )}

              <div className="flex gap-2 pt-[16px]">
            <Button className="flex-1  rounded-[12px] bg-[#F1F8F2] text-[#2BAC47]  hover:bg-[#F1F8F2]/80 INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium h-[36px]">
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-[12px]  border-[#F1F1F1]  bg-[#FFEBEE] text-[#C83532]  hover:bg-[#FFCDD2] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium h-[36px]"
            >
              Remove
            </Button>
          </div>
    </div>

  );
}

// ────────────────────────────────────────────────
// Component: FlaggedCreatorCard
// ────────────────────────────────────────────────
function FlaggedCreatorCard({ creator }: { creator: FlaggedCreator }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border border-[#F1F1F1] rounded-[8px] p-3">
      <div className="flex gap-3 items-center">
        {/* Avatar */}
        <Avatar className="h-[48px] w-[48px]">
          <AvatarImage src={creator.avatar} />
          <AvatarFallback className="bg-[#D9D9D9] text-[#5B5B5B]">
            {creator.username[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[#000000] INT500 text-[16px] leading-[24px] tracking-[-1.5%] font-medium">
            {creator.username}
          </h4>
          <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            {creator.handle}
          </p>
        </div>
      </div>

      {/* Collapsible Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center w-full justify-between  py-[16px] border-t border-[#F1F1F1] border-b border-dashed gap-1 text-[#A4A4A4]  INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase mt-3 hover:text-[#808080] transition-colors"
      >
        {showDetails ? "HIDE" : "SHOW"} DETAILS
        {showDetails ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showDetails && (
        <div className="mt-3 space-y-3">
          <p className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            {creator.details}
          </p>

        
        </div>
      )}

        <div className="flex gap-2 pt-[16px]">
            <Button className="flex-1  rounded-[12px] bg-[#FFEBEE] text-[#C83532]  hover:bg-[#FFCDD2] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium h-[36px]">
              Suspend
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-[12px]  border-[#F1F1F1] text-[#111810] hover:bg-[#F7F7F7] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium h-[36px]"
            >
              Cancel
            </Button>
          </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Component: LiveSessionCard
// ────────────────────────────────────────────────
function LiveSessionCard({ session }: { session: LiveSession }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border border-[#EDEDED] rounded-lg overflow-hidden shadow-sm">
      {/* Thumbnail Section */}
      <div className="relative h-[190px] bg-gradient-to-br from-red-900 to-red-600">
        {/* Background Image */}
        {session.thumbnail ? (
          <img
            src={session.thumbnail}
            alt={session.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-4xl">🎤</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Watching Badge - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-[8px] py-[4px] bg-[#C83532] text-white text-[12px] font-medium INT500 rounded tracking-[6%] leading-[16px] uppercase">
            {session.watching}
          </span>
        </div>

        {/* Creator Info - Bottom Left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
          <Avatar className="h-[20px] w-[20px] border border-[#FFFFFF]">
            <AvatarImage src={session.creatorAvatar} />
            <AvatarFallback className="text-[10px] bg-[#808080] text-white">
              {session.creator[1]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-[14px] INT400 leading-[20px] drop-shadow-lg tracking-[-1.8%]">
            {session.creator}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3">
        <h4 className="font-medium text-[#000000] INT500 text-[16px] leading-[24px] tracking-[-1.5%]">
          {session.title}
        </h4>

        {/* Collapsible Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center mt-[16px] w-full py-[16px] justify-between border-t border-[#F1F1F1] border-b border-dashed  gap-1 text-[#A4A4A4] INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase hover:text-[#808080] transition-colors"
        >
          {showDetails ? "HIDE" : "SHOW"} DETAILS
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showDetails && (
          <div className="mt-3 space-y-3">
            <p className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              {session.details}
            </p>

        
          </div>
        )}

            <div className="flex gap-2 pt-[16px]">
              <Button className="flex-1  rounded-[12px] bg-[#FFEBEE] text-[#C83532] hover:bg-[#FFCDD2] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium h-[36px]">
                Shut down
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-[12px] border-[#F1F1F1] text-[#111810] hover:bg-[#F7F7F7] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium h-[36px]"
              >
                Cancel
              </Button>
            </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Component: ModerationPage
// ────────────────────────────────────────────────
const ModerationPage = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Moderation
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          Audit reported activity across the marketplace.
        </p>
      </div>

      {/* Three Column Grid */}
      <div className="flex flex-wrap gap-[31.5px] w-full">
        {/* Column 1: Flagged Products */}
        <div className="bg-[#F7F7F7] h-full p-[8px]  border border-[#F1F1F1] rounded-[6px] space-y-[8px] w-[336px]">
          <div className="flex items-center gap-[12px]">
            <h3 className="text-[#000000] INT500 font-medium text-[14px] leading-[20px] tracking-[6%] uppercase">
              FLAGGED PRODUCTS
            </h3>
            <span className="bg-[#5B5B5B] text-white INT500 text-[12px] leading-[16px] font-medium px-[8px] py-[2px] rounded-[32px]">
              {mockFlaggedProducts.length}
            </span>
          </div>

            <div className="space-y-[8px]" >
            {mockFlaggedProducts.map((product) => (
              <FlaggedProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Column 2: Flagged Creators */}
        <div className="bg-[#F7F7F7] h-full p-[8px]  border border-[#F1F1F1] rounded-[6px] space-y-[8px] w-[336px]">
          <div className="flex items-center gap-[12px]">
            <h3 className="text-[#000000] INT500 font-medium text-[14px] leading-[20px] tracking-[6%] uppercase">
              FLAGGED CREATORS
            </h3>
            <span className="bg-[#5B5B5B] text-white INT500 text-[12px] leading-[16px] font-medium px-[8px] py-[2px] rounded-[32px]">
              {mockFlaggedCreators.length}
            </span>
          </div>

          <div className="space-y-[8px]">
            {mockFlaggedCreators.map((creator) => (
              <FlaggedCreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>

        {/* Column 3: Live Sessions */}
        <div className="bg-[#F7F7F7] h-full p-[8px]  border border-[#F1F1F1] rounded-[6px] space-y-[8px] w-[336px] ">
          <div className="flex items-center gap-[12px]">
            <h3 className="text-[#000000] INT500 font-medium text-[14px] leading-[20px] tracking-[6%] uppercase">
              LIVE SESSIONS
            </h3>
            <span className="bg-[#5B5B5B] text-white INT500 text-[12px] leading-[16px] font-medium px-[8px] py-[2px] rounded-[32px]">
              {mockLiveSessions.length}
            </span>
          </div>

          <div className="space-y-[8px]">
            {mockLiveSessions.map((session) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
