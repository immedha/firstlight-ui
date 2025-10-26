import { createAction } from "@reduxjs/toolkit";

export interface setPageStateInfoActionFormat {
  type: string;
  payload: setPageStateInfoActionPayload;
}

export interface setPageStateInfoActionPayload {
  type: 'success' | 'loading' | 'error' | 'idle';
  message: string | null;
}

export const setPageStateInfoAction = createAction<setPageStateInfoActionPayload>('user/setPageStateInfoAction');
