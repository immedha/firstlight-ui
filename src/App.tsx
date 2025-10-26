import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { store } from "./store/store";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setUserId } from "./store/user/userSlice";
import { listenToUserUpdatesAction } from "./store/user/userActions";
import { listenToAllProjectsAction } from "./store/projects/projectsActions";
import { listenToYourReviewsAction } from "./store/reviews/reviewsActions";
import Navigation from "./components/Navigation";
import LandingPage from "./pages/LandingPage";
import ProjectsPage from "./pages/ProjectsPage";
import UploadProjectPage from "./pages/UploadProjectPage";
import ViewProjectPage from "./pages/ViewProjectPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth listener component
const AuthListener = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Listen to projects updates
    dispatch(listenToAllProjectsAction());
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUserId(user.uid));
        dispatch(listenToUserUpdatesAction({ userId: user.uid }));
        dispatch(listenToYourReviewsAction());
      } else {
        dispatch(setUserId(null));
      }
    });
    
    return () => unsubscribe();
  }, [dispatch]);
  
  return null;
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthListener />
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/upload-project" element={<UploadProjectPage />} />
              <Route path="/project/:projectId" element={<ViewProjectPage />} />
              <Route path="/my-projects" element={<MyProjectsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

export default App;
