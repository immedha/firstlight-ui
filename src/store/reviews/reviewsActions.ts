import { createAction } from "@reduxjs/toolkit";
import { type FilledReviewSchema } from "@/types";

export interface submitReviewActionPayload {
  projectId: string;
  filledReviewSchema: FilledReviewSchema[];
}

export interface submitReviewActionFormat {
  type: string;
  payload: submitReviewActionPayload;
}

export const submitReviewAction = createAction<submitReviewActionPayload>('reviews/submitReviewAction');

export interface updateReviewQualityActionPayload {
  reviewId: string;
  reviewQuality: number;
}

export interface updateReviewQualityActionFormat {
  type: string;
  payload: updateReviewQualityActionPayload;
}

export const updateReviewQualityAction = createAction<updateReviewQualityActionPayload>('reviews/updateReviewQualityAction');

export const getYourReviewsAction = createAction('reviews/getYourReviewsAction');

export const listenToYourReviewsAction = createAction('reviews/listenToYourReviewsAction');