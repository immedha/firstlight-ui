import { ReviewSchema } from "@/types";
import { createAction } from "@reduxjs/toolkit";

export const logOutAction = createAction('user/logOutAction');
export const signInAction = createAction('user/signInAction');

export interface createProjectActionPayload {
  name: string;
  description: string;
  link: string;
  reviewSchema: ReviewSchema[];
}

export interface createProjectActionFormat {
  type: string;
  payload: createProjectActionPayload;
}

export const createProjectAction = createAction<createProjectActionPayload>('user/createProjectAction');

export interface listenToUserUpdatesActionPayload {
  userId: string;
}

export interface listenToUserUpdatesActionFormat {
  type: string;
  payload: listenToUserUpdatesActionPayload
}

export const listenToUserUpdatesAction = createAction<listenToUserUpdatesActionPayload>('user/listenToUserUpdatesAction');

