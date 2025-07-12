
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import Home from '@/pages/Home/Home';
import Tags from '@/pages/Tags/Tags';
import Users from '@/pages/Users/Users';
import Leaderboard from '@/pages/Leaderboard/Leaderboard';
import AskQuestion from '@/pages/AskQuestion/AskQuestion';
import QuestionDetail from '@/pages/QuestionDetail/QuestionDetail';
import Login from '@/pages/Login/Login';
import Register from '@/pages/Register/Register';
import ForgotPassword from '@/pages/ForgotPassword/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword/ResetPassword';
import Profile from '@/pages/Profile/Profile';
import AdminDashboard from '@/pages/AdminDashboard/AdminDashboard';
import AllQuestions from '@/pages/AllQuestions/AllQuestions';
import AllAnswers from '@/pages/AllAnswers/AllAnswers';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 min-h-screen">
                    <Routes>
                      <Route path="/" element={
                        <PrivateRoute>
                          <Home />
                        </PrivateRoute>
                      } />
                      <Route path="/tags" element={<Tags />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/ask" element={
                        <PrivateRoute>
                          <AskQuestion />
                        </PrivateRoute>
                      } />
                      <Route path="/question/:id" element={
                        <PrivateRoute>
                          <QuestionDetail />
                        </PrivateRoute>
                      } />
                      <Route path="/all-questions" element={
                        <PrivateRoute>
                          <AllQuestions />
                        </PrivateRoute>
                      } />
                      <Route path="/all-answers" element={
                        <PrivateRoute>
                          <AllAnswers />
                        </PrivateRoute>
                      } />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      } />
                      <Route path="/admin" element={
                        <PrivateRoute>
                          <AdminDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
