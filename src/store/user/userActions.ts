import { ReviewSchema, ProductImage } from "@/types";
import { createAction } from "@reduxjs/toolkit";

export const logOutAction = createAction('user/logOutAction');
export const signInAction = createAction('user/signInAction');

export interface createProjectActionPayload {
  name: string;
  description: string;
  link: string;
  reviewSchema: ReviewSchema[];
  imageUrl?: string;
  images?: ProductImage[];
  feedbackObjective?: string;
  status?: 'draft' | 'published';
}

export interface createProjectActionFormat {
  type: string;
  payload: createProjectActionPayload;
}

export const createProjectAction = createAction<createProjectActionPayload>('user/createProjectAction');

export interface updateProjectActionPayload extends createProjectActionPayload {
  projectId: string; // Keep as projectId for backward compatibility with routes and database
}

export interface updateProjectActionFormat {
  type: string;
  payload: updateProjectActionPayload;
}

export const updateProjectAction = createAction<updateProjectActionPayload>('user/updateProjectAction');

export interface publishProjectActionPayload {
  projectId: string; // Keep as projectId for backward compatibility with routes and database
}

export interface publishProjectActionFormat {
  type: string;
  payload: publishProjectActionPayload;
}

export const publishProjectAction = createAction<publishProjectActionPayload>('user/publishProjectAction');

export interface listenToUserUpdatesActionPayload {
  userId: string;
}

export interface listenToUserUpdatesActionFormat {
  type: string;
  payload: listenToUserUpdatesActionPayload
}

export const listenToUserUpdatesAction = createAction<listenToUserUpdatesActionPayload>('user/listenToUserUpdatesAction');

