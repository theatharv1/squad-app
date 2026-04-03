import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CreatePool from "./pages/CreatePool";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PoolDetail from "./pages/PoolDetail";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Followers from "./pages/Followers";
import VenueDetail from "./pages/VenueDetail";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreatePool /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/me/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/pool/:id" element={<ProtectedRoute><PoolDetail /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/followers/:userId" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
              <Route path="/venue/:id" element={<ProtectedRoute><VenueDetail /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
