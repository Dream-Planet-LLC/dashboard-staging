import { PaginationProps } from "@/utils/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BroadcastCreator {
  id: number;
  first_name: string | null;
  last_name: string | null;
}

export interface BroadcastProps {
  admin_id: number | null;
  creator: BroadcastCreator | null;
  challenge_id: null;
  content_type: null;
  createdAt: string | null;
  forum_id: null;
  id: number;
  is_broadcast: boolean;
  link: string;
  media_url: string[];
  shared_feed: null;
  text_content: string;
  title: string;
  updatedAt: string;
  user_id: null;
}

const initialState = {
  broadcastAll: [] as BroadcastProps[],
  broadcastEdit: {} as BroadcastProps,
  pagination: {
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
export const broadcastslice = createSlice({
  name: "broadcast",
  initialState,
  reducers: {
    updateBroadcastAll: (state, action: PayloadAction<BroadcastProps[]>) => {
      state.broadcastAll = action.payload;
    },
    updateBroadcastEdit: (state, action: PayloadAction<BroadcastProps>) => {
      state.broadcastEdit = action.payload;
    },
     updatePaginationBroadcast: (state, action: PayloadAction<PaginationProps>) => {
        state.pagination = { ...state.pagination, ...action.payload };
      },
  },
});

// Export the actions
export const { updateBroadcastAll, updateBroadcastEdit, updatePaginationBroadcast } =
  broadcastslice.actions;

// Export the reducer
export default broadcastslice.reducer;
