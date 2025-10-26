import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReviewGiven } from '@/types';

interface ReviewsState {
  allReviews: ReviewGiven[];
}

const initialState: ReviewsState = {
  allReviews: []
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    addReview: (state, action: PayloadAction<ReviewGiven>) => {
      state.allReviews.push(action.payload);
    },
    updateReviewQuality: (state, action: PayloadAction<{ id: string; quality: number }>) => {
      const review = state.allReviews.find(r => r.id === action.payload.id);
      if (review) {
        review.reviewQuality = action.payload.quality;
      }
    }
  }
});

export const { addReview, updateReviewQuality } = reviewsSlice.actions;
export default reviewsSlice.reducer;
