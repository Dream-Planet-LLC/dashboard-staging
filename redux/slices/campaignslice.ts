import { PaginationProps } from "@/utils/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for a single user object
interface campaignProps {
  amount_raised: number;
  closure_reason: null | string;
  createdAt: string;
  creators_id: number;
  creators_name: string;
  creators_type: string;
  goal_amount: number;
  id: number;
  image: string;
  legal_name: string;
  link: string;
  number_of_donations: number;
  reason: string;
  starter_name: string;
  starter_username: string;
  status: string;
  user_content_creator_type: null | string;
  user_id: number;
  user_image: string;
  user_name: string;
  user_username: string;
  user_usertype: string;
}

interface groupProps {
  campaigns: any[];
  creator_type: string;
  total_campaigns: string;
}

interface donationProps {
  amount: number;
  anonymous: boolean;
  campaign_id: number;
  createdAt: string;
  id: 441;
  image: string | null;
  user_id: number;
  username: string | null;
}

// Initial state with an array of campaignProps and top-level status and user_type
const initialState = {
  campaignActive: [] as campaignProps[],
  campaignStopped: [] as campaignProps[],
  campaignCompleted: [] as campaignProps[],
  campaignProcessing: [] as campaignProps[],
  campaignMostPerformed: [] as campaignProps[],
  groupedCampaigns: [] as groupProps[],
  donations: [] as donationProps[],
  paginationActive: {
    hasNextPage: false as boolean,
    hasPrevPage: false as boolean,
    limit: 0 as number,
    nextPage: null as number | null,
    offset: 0 as number,
    page: 1 as number,
    pagingCounter: 0 as number,
    prevPage: null as number | null,
    totalDocs: 0 as number,
    totalPages: 0 as number,
  },
  paginationOther: {
    hasNextPage: false as boolean,
    hasPrevPage: false as boolean,
    limit: 0 as number,
    nextPage: null as number | null,
    offset: 0 as number,
    page: 1 as number,
    pagingCounter: 0 as number,
    prevPage: null as number | null,
    totalDocs: 0 as number,
    totalPages: 0 as number,
  },
};

// Redux slice
export const campaignslice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    updateDonations: (
      state,
      action: PayloadAction<donationProps[]> // Incoming array of users
    ) => {
      state.donations = action.payload;
    },
    updateCampaignActive: (
      state,
      action: PayloadAction<campaignProps[]> // Incoming array of users
    ) => {
      state.campaignActive = action.payload;
    },
    updateCampaignStopped: (
      state,
      action: PayloadAction<campaignProps[]> // Incoming array of users
    ) => {
      state.campaignStopped = action.payload;
    },
    updateCampaignCompleted: (
      state,
      action: PayloadAction<campaignProps[]> // Incoming array of users
    ) => {
      state.campaignCompleted = action.payload;
    },
    updateCampaignProcessing: (
      state,
      action: PayloadAction<any[]> // Incoming array of users
    ) => {
      state.campaignProcessing = action.payload;
    },
    updateCampaignMostPerformed: (
      state,
      action: PayloadAction<campaignProps[]> // Incoming array of users
    ) => {
      state.campaignMostPerformed = action.payload;
    },
    updategroupCampaigns: (
      state,
      action: PayloadAction<groupProps[]> // Incoming array of users
    ) => {
      state.groupedCampaigns = action.payload;
    },
     updatePaginationActive: (state, action: PayloadAction<PaginationProps>) => {
        state.paginationActive = { ...state.paginationActive, ...action.payload };
        },
        updatePaginationOther: (state, action: PayloadAction<PaginationProps>) => {
          state.paginationOther = { ...state.paginationOther, ...action.payload };
          },
    
  },
});

// Export the actions
export const {
  updateCampaignActive,
  updateCampaignCompleted,
  updateCampaignMostPerformed,
  updateCampaignStopped,
  updategroupCampaigns,
  updateDonations,
  updateCampaignProcessing,
  updatePaginationActive, updatePaginationOther
} = campaignslice.actions;

// Export the reducer
export default campaignslice.reducer;
