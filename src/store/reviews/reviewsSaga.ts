import { all, call, put, takeEvery } from "redux-saga/effects";
import { setAllReviews, addReview, updateReview } from "./reviewsSlice";
import { setPageStateInfoAction } from "../global/globalActions";
import { 
  createReviewInDb, 
  getYourReviewsFromDb, 
  updateReviewQualityInDb 
} from "@/lib/dbQueries";
import { 
  submitReviewAction, 
  updateReviewQualityAction, 
  getYourReviewsAction,
  type submitReviewActionFormat, 
  type updateReviewQualityActionFormat,
  listenToYourReviewsAction,
} from "./reviewsActions";
import { type ReviewGiven } from "@/types";
import { store } from "../store";
import { db } from "@/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

function* submitReview(action: submitReviewActionFormat) {
  try {
    const userId = store.getState().user.userId;
    if (!userId) {
      yield put(setPageStateInfoAction({ type: 'error', message: 'You must be logged in to submit a review!' }));
      return;
    }

    const review: ReviewGiven = yield call(
      createReviewInDb, 
      userId, 
      action.payload.projectId, 
      action.payload.filledReviewSchema
    );
    yield put(addReview(review));
    yield put(setPageStateInfoAction({ type: 'success', message: 'Review submitted successfully!' }));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: 'Failed to submit review. Please try again!' }));
  }
}

function* updateReviewQuality(action: updateReviewQualityActionFormat) {
  try {
    const updatedReview: ReviewGiven = yield call(updateReviewQualityInDb, action.payload.reviewId, action.payload.reviewQuality);
    yield put(updateReview(updatedReview));
    yield put(setPageStateInfoAction({ type: 'success', message: 'Review quality updated successfully!' }));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: 'Failed to update review quality. Please try again!' }));
  }
}

function* getYourReviews() {
  try {
    const currentState = store.getState();
    const userId = currentState.user.userId;
    if (!userId) return;
    
    const userProjectIds = currentState.user.uploadedProjects || [];
    
    const reviews: ReviewGiven[] = yield call(getYourReviewsFromDb, userId, userProjectIds);
    yield put(setAllReviews(reviews));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: 'Failed to fetch reviews. Please try again!' }));
  }
}

function* listenToYourReviews() {
  const userId = store.getState().user.userId;
  if (!userId) return;

  const reviewsRef = collection(db, "reviews");
  
  // Simple approach: Listen to all reviews and filter in memory
  const q = query(reviewsRef, orderBy("createdAt", "desc"));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    // Get fresh user data each time to ensure we have latest projects
    const currentState = store.getState();
    const currentUserId = currentState.user.userId;
    const currentUserProjectIds = currentState.user.uploadedProjects || [];
    
    const allReviews: ReviewGiven[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const review = {
        id: doc.id,
        reviewerId: data.reviewerId || "",
        projectId: data.projectId || "",
        filledReviewSchema: data.filledReviewSchema || [],
        createdAt: data.createdAt || "",
        reviewQuality: data.reviewQuality || 0
      };
      
      // Filter: Include if user gave this review OR if it's for user's project
      if (review.reviewerId === currentUserId || currentUserProjectIds.includes(review.projectId)) {
        allReviews.push(review);
      }
    });
    
    // Dispatch the filtered reviews list
    store.dispatch(setAllReviews(allReviews));
  });
  
  // Return cleanup function
  return unsubscribe;
}

export default function* reviewsSaga() {
  yield all([
    takeEvery(submitReviewAction.type, submitReview),
    takeEvery(updateReviewQualityAction.type, updateReviewQuality),
    takeEvery(getYourReviewsAction.type, getYourReviews),
    takeEvery(listenToYourReviewsAction.type, listenToYourReviews),
  ]);
}
