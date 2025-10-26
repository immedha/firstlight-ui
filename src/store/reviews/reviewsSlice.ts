import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type ReviewGiven } from "@/types";
import { RootState } from "../store";

const initialState = {
  allReviews: [] as ReviewGiven[],
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setAllReviews: (state, action: PayloadAction<ReviewGiven[]>) => {
      state.allReviews = action.payload;
    },
    addReview: (state, action: PayloadAction<ReviewGiven>) => {
      state.allReviews.push(action.payload);
    },
    updateReview: (state, action: PayloadAction<ReviewGiven>) => {
      const index = state.allReviews.findIndex(review => review.id === action.payload.id);
      if (index !== -1) {
        state.allReviews[index] = action.payload;
      }
    },
  },
});

export const { setAllReviews, addReview, updateReview } = reviewsSlice.actions;

export const selectAllReviews = (state: RootState) => state.reviews.allReviews;
export const selectReviewById = (reviewId: string) => (state: RootState) => 
  state.reviews.allReviews.find(review => review.id === reviewId);

export default reviewsSlice.reducer;
