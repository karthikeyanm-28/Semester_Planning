import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AcademicProvider } from "@/context/AcademicContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SemesterConfig from "./pages/SemesterConfig";
import Subjects from "./pages/Subjects";
import Tasks from "./pages/Tasks";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import Performance from "./pages/Performance";
import Goals from "./pages/Goals";
import Notes from "./pages/Notes";
import Alerts from "./pages/Alerts";
import Summary from "./pages/Summary";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Roadmap from "./pages/Roadmap";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }
  
  return element;
}

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading screen with timeout fallback
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        margin: 0,
        padding: 0,
        width: '100%',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ 
            color: '#64748b',
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            margin: 0,
            fontWeight: '500'
          }}>
            Loading...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Navigate based on auth status
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  // User is authenticated
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/semester" element={<SemesterConfig />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planner" element={<WeeklyPlanner />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0
    }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <UserProvider>
              <AcademicProvider>
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </AcademicProvider>
            </UserProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
