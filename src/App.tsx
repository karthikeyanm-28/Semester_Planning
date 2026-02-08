import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AcademicProvider } from "@/context/AcademicContext";
import { AppLayout } from "@/components/layout/AppLayout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AcademicProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/semester" element={<SemesterConfig />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/planner" element={<WeeklyPlanner />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/summary" element={<Summary />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AcademicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
