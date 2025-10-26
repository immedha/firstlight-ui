import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './projectsSlice';
import reviewsReducer from './reviewsSlice';

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    reviews: reviewsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
