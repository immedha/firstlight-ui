import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface GlobalSliceState {
  authStatus: 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
  haveUserDoc: boolean;
  pageState: "loading" | "error" | "idle" | "success";
  stateMessage: string | null;
}

const initialState: GlobalSliceState = {
  authStatus: 'idle',
  haveUserDoc: false,
  pageState: "idle",
  stateMessage: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setAuthStatus: (state, action: PayloadAction<'idle' | 'checking' | 'authenticated' | 'unauthenticated'>) => {
      state.authStatus = action.payload;
    },
    setHaveUserDoc: (state, action: PayloadAction<boolean>) => {
      state.haveUserDoc = action.payload;
    },
    setPageState: (state, action: PayloadAction<"loading" | "error" | "idle" | "success">) => {
      state.pageState = action.payload;
    },
    setStateMessage: (state, action: PayloadAction<string | null>) => {
      state.stateMessage = action.payload;
    },
  },
});

export const { 
  setAuthStatus, 
  setHaveUserDoc, 
  setPageState,
  setStateMessage
} = globalSlice.actions;

export const selectAuthStatus = (state: RootState) => state.global.authStatus;
export const selectHaveUserDoc = (state: RootState) => state.global.haveUserDoc;
export const selectPageState = (state: RootState) => state.global.pageState;
export const selectStateMessage = (state: RootState) => state.global.stateMessage;

export default globalSlice.reducer;