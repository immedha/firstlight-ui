import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./store/store";
import Navigation from "./components/Navigation";
import LandingPage from "./pages/LandingPage";
import ProjectsPage from "./pages/ProjectsPage";
import UploadProjectPage from "./pages/UploadProjectPage";
import ViewProjectPage from "./pages/ViewProjectPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
