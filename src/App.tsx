import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CreatePool from "./pages/CreatePool";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PoolDetail from "./pages/PoolDetail";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
import Followers from "./pages/Followers";
import VenueDetail from "./pages/VenueDetail";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<CreatePool />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Chat />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/me/edit" element={<EditProfile />} />
          <Route path="/pool/:id" element={<PoolDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/followers/:userId" element={<Followers />} />
          <Route path="/venue/:id" element={<VenueDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
