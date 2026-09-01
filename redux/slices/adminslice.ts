import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for a single user object

export interface AdminRole {
  id?: number | string;
  name?: string;
  features?: string[];
}

export interface AdminUser {
  id?: number | string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: AdminRole;
  role_id?: number | string;
  role_name?: string;
  permissions?: string[];
  [key: string]: any;
}

interface AdminState {
  loggedInUser: AdminUser;
}

const initialState: AdminState = {
  loggedInUser: {},
};

// Redux slice
export const adminslice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<AdminUser>) => {
      state.loggedInUser = action.payload;
    },
    clearUser: (state) => {
      state.loggedInUser = {};
    },
  },
});

// Export the actions
export const {
  updateUser,
  clearUser
} = adminslice.actions;

// Export the reducer
export default adminslice.reducer;
