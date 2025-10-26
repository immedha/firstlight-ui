import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Product } from "@/types";
import { RootState } from "../store";

interface ProjectsSliceState {
  allProjects: Product[];
}

const initialState: ProjectsSliceState = {
  allProjects: [],
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setAllProjects: (state, action: PayloadAction<Product[]>) => {
      state.allProjects = action.payload;
    },
  },
});

export const { setAllProjects } = projectsSlice.actions;

// Selectors
export const selectAllProjects = (state: RootState) => state.projects.allProjects;

export default projectsSlice.reducer;