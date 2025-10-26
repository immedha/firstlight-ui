import { all, call, put, takeEvery } from "redux-saga/effects";
import { setUser, setUserId } from "./userSlice";
import { auth, db, provider } from "@/firebase";
import { browserLocalPersistence, setPersistence, signInWithPopup, signOut, type UserCredential } from "firebase/auth";
import { setPageStateInfoAction } from "../global/globalActions";
import { listenToUserUpdatesAction, logOutAction, signInAction, createProjectAction, updateProjectAction, publishProjectAction, type listenToUserUpdatesActionFormat, type createProjectActionFormat, type updateProjectActionFormat, type publishProjectActionFormat } from "./userActions";
import { doc, onSnapshot } from "firebase/firestore";
import { setHaveUserDoc } from "../global/globalSlice";
import { store } from "../store";
import { createProjectInDb, initializeUserInDb, getAllProjectsFromDb, updateProjectInDb, publishProjectInDb } from "@/lib/dbQueries";
import { setAllProjects } from "../projects/projectsSlice";

function* listenToUserUpdates(action: listenToUserUpdatesActionFormat) {
  const { userId } = action.payload;
  const roomRef = doc(db, "users", userId);  
  onSnapshot(roomRef, (docSnap) => {
    const data = docSnap.data();
    if (data) {
      const email = data.email || "";
      const displayName = data.displayName || "";
      const uploadedProjects = data.uploadedProjects || [];
      const reviewsGiven = data.reviewsGiven || [];
      const createdAt = data.createdAt || "";
      const karmaPoints = data.karmaPoints || 0;
      store.dispatch(
        setUser({ userId, email, displayName, uploadedProjects, reviewsGiven, createdAt, karmaPoints })
      );
    }
  });
  yield put(setHaveUserDoc(true));
}


function* logOut() {
  try {
    yield signOut(auth);
    yield put(setUserId(null));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: 'Failed to log out. Please try again!' }));
  }
}

function* signIn() {
  try {
    yield call(setPersistence, auth, browserLocalPersistence);
    const result: UserCredential = yield call(signInWithPopup, auth, provider);
    yield call(initializeUserInDb, result.user.email!, "" + result.user.uid, result.user.displayName || "");
    yield put(setUserId("" + result.user.uid));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: 'Failed to log in. Please try again!' }));
  }
}

function* createProject(action: createProjectActionFormat) {
  try {
    const userId = store.getState().user.userId;
    if (!userId) {
      yield put(setPageStateInfoAction({ type: 'error', message: 'You must be logged in to create a project!' }));
      return;
    }

    yield call(createProjectInDb, userId, action.payload);
    
    // Fetch updated projects list from the database
    const projects = yield call(getAllProjectsFromDb);
    yield put(setAllProjects(projects));
    
    yield put(setPageStateInfoAction({ type: 'success', message: 'Project created successfully!' }));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: 'Failed to create project. Please try again!' }));
  }
}

function* updateProject(action: updateProjectActionFormat) {
  try {
    const userId = store.getState().user.userId;
    if (!userId) {
      yield put(setPageStateInfoAction({ type: 'error', message: 'You must be logged in to update a project!' }));
      return;
    }

    const { projectId, ...projectData } = action.payload;
    yield call(updateProjectInDb, projectId, projectData);
    
    // Fetch updated projects list from the database
    const projects = yield call(getAllProjectsFromDb);
    yield put(setAllProjects(projects));
    
    yield put(setPageStateInfoAction({ type: 'success', message: 'Project updated successfully!' }));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: error.message || 'Failed to update project. Please try again!' }));
  }
}

function* publishProject(action: publishProjectActionFormat) {
  try {
    const userId = store.getState().user.userId;
    if (!userId) {
      yield put(setPageStateInfoAction({ type: 'error', message: 'You must be logged in to publish a project!' }));
      return;
    }

    yield call(publishProjectInDb, action.payload.projectId);
    
    // Fetch updated projects list from the database
    const projects = yield call(getAllProjectsFromDb);
    yield put(setAllProjects(projects));
    
    yield put(setPageStateInfoAction({ type: 'success', message: 'Project published successfully!' }));
  } catch (error: any) {
    console.error(error);
    yield put(setPageStateInfoAction({ type: 'error', message: error.message || 'Failed to publish project. Please try again!' }));
  }
}

export default function* userSaga() {
  yield all([
    takeEvery(logOutAction.type, logOut),
    takeEvery(signInAction.type, signIn), 
    takeEvery(createProjectAction.type, createProject),
    takeEvery(updateProjectAction.type, updateProject),
    takeEvery(publishProjectAction.type, publishProject),
    takeEvery(listenToUserUpdatesAction.type, listenToUserUpdates),
  ]);
}