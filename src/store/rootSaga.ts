import { all } from 'redux-saga/effects';
import userSaga from './user/userSaga';
import globalSaga from './global/globalSaga';
import projectsSaga from './projects/projectsSaga';
import reviewsSaga from './reviews/reviewsSaga';

export default function* rootSaga() {
  yield all([
    userSaga(),
    globalSaga(),
    projectsSaga(),
    reviewsSaga(),
  ]);
}
