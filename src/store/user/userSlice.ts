import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UserSliceState {
  userId: string | null;
  email: string;
  displayName: string;
  uploadedProjects: string[];
  reviewsGiven: string[];
  createdAt: string;
  karmaPoints: number;
}

const initialState: UserSliceState = {
  userId: null,
  email: "",
  displayName: "",
  uploadedProjects: [],
  reviewsGiven: [],
  createdAt: "",
  karmaPoints: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserSliceState>) => {
      const { userId, email, displayName, uploadedProjects, reviewsGiven, createdAt, karmaPoints } = action.payload;
      state.userId = userId;
      state.email = email;
      state.displayName = displayName;
      state.uploadedProjects = uploadedProjects;
      state.reviewsGiven = reviewsGiven;
      state.createdAt = createdAt;
      state.karmaPoints = karmaPoints;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
  },
});

export const { setUserId, setUser } = userSlice.actions;

export const selectUser = (state: RootState) => state.user;
export const selectUserId = (state: RootState) => state.user.userId;
export const selectEmail = (state: RootState) => state.user.email;
export const selectDisplayName = (state: RootState) => state.user.displayName;
export const selectUploadedProjects = (state: RootState) => state.user.uploadedProjects;

export default userSlice.reducer;