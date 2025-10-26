import { all, call, put, takeEvery } from 'redux-saga/effects';
import { getAllProjectsAction, listenToAllProjectsAction } from './projectsActions';
import { setAllProjects } from './projectsSlice';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Project } from '@/types';
import { store } from '../store';
import { getAllProjectsFromDb } from '@/lib/dbQueries';

function* listenToAllProjects() {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, orderBy("createdAt", "desc"));
  
  onSnapshot(q, (querySnapshot) => {
    const allProjects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allProjects.push({
        id: doc.id,
        founderId: data.founderId || "",
        name: data.name || "",
        description: data.description || "",
        link: data.link || "",
        imageUrl: data.imageUrl || "",
        images: data.images || undefined,
        createdAt: data.createdAt || "",
        reviewSchema: data.reviewSchema || [],
        reviewsReceived: data.reviewsReceived || [],
        status: data.status || 'draft'
      });
    });
    
    // TODO: Add tier-based filtering here later
    // For now, show all projects to everyone
    store.dispatch(setAllProjects(allProjects));
  });
}

function* getAllProjects() {
  const projects: Project[] = yield call(getAllProjectsFromDb);
  yield put(setAllProjects(projects));
}

export default function* projectsSaga() {
  yield all([
    takeEvery(listenToAllProjectsAction.type, listenToAllProjects),
    takeEvery(getAllProjectsAction.type, getAllProjects),
  ]);
}