import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types';

interface ProjectsState {
  allProjects: Project[];
}

const initialState: ProjectsState = {
  allProjects: []
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action: PayloadAction<Project>) => {
      state.allProjects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.allProjects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.allProjects[index] = action.payload;
      }
    },
    addReviewToProject: (state, action: PayloadAction<{ projectId: string; reviewId: string }>) => {
      const project = state.allProjects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.reviewsReceived.push(action.payload.reviewId);
      }
    }
  }
});

export const { addProject, updateProject, addReviewToProject } = projectsSlice.actions;
export default projectsSlice.reducer;
