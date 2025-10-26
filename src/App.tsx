import { Provider, useSelector } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { store, RootState } from "./store/store";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setUserId } from "./store/user/userSlice";
import { listenToUserUpdatesAction } from "./store/user/userActions";
import { listenToAllProjectsAction } from "./store/projects/projectsActions";
import { listenToYourReviewsAction } from "./store/reviews/reviewsActions";
import Navigation from "./components/Navigation";
import LandingPage from "./pages/LandingPage";
import ProductsPage from "./pages/ProductsPage";
import UploadProductPage from "./pages/UploadProductPage";
import ViewProductPage from "./pages/ViewProductPage";
import MyProductsPage from "./pages/MyProductsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userId = useSelector((state: RootState) => state.user.userId);
  return userId ? <>{children}</> : <Navigate to="/" replace />;
};

// Auth listener component
const AuthListener = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
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
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/add-product" element={<ProtectedRoute><UploadProductPage /></ProtectedRoute>} />
              <Route path="/add-product/:projectId" element={<ProtectedRoute><UploadProductPage /></ProtectedRoute>} />
              <Route path="/product/:projectId" element={<ViewProductPage />} />
              <Route path="/my-products" element={<ProtectedRoute><MyProductsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

export default App;
