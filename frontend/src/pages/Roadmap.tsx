import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Milestone, Roadmap as RoadmapType } from '@/types/roadmap';
import {
  getUserRoadmaps,
  createRoadmap,
  toggleMilestone,
  TEMPLATE_SOFTWARE_ENGINEERING,
} from '@/services/roadmapService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Map as MapIcon, PlusCircle, Target, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const CircleProgress = ({ progress }: { progress: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          className="text-muted/30"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="48"
          cy="48"
        />
        <circle
          className="text-primary transition-all duration-1000 ease-in-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="48"
          cy="48"
        />
      </svg>
      <span className="absolute text-lg font-bold text-foreground">{progress}%</span>
    </div>
  );
};

export default function Roadmap() {
  const { user } = useUser();
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapType | null>(null);

  // Use React Query to handle caching, auto-fetching, and background updates
  const { data: roadmaps = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['roadmaps', user?.id],
    queryFn: () => getUserRoadmaps(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Keep cached for 5 minutes to prevent re-fetching on tab switch
  });

  // Sync active roadmap locally when data loads
  useEffect(() => {
    if (roadmaps.length > 0) {
      setActiveRoadmap(prev => prev || roadmaps[0]);
    }
  }, [roadmaps]);

  const handleCreateTemplate = async () => {
    try {
      if (!user?.id) return;
      await createRoadmap(user.id, TEMPLATE_SOFTWARE_ENGINEERING);
      toast.success('Software Engineering Template Created!');
      refetch();
    } catch (err) {
      toast.error('Failed to create template roadmap. Check the console and Firebase config.');
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    if (!activeRoadmap || !user?.id) return;

    try {
      // Optimistic locally
      const updatedMilestones = activeRoadmap.milestones.map((m) =>
        m.id === milestoneId ? { ...m, isCompleted: !currentStatus } : m
      );
      
      const newProgress = Math.round(
        (updatedMilestones.filter((m) => m.isCompleted).length / updatedMilestones.length) * 100
      );

      setActiveRoadmap({
        ...activeRoadmap,
        milestones: updatedMilestones,
        progress: newProgress,
      });

      // Firebase sync
      await toggleMilestone(
        activeRoadmap.id,
        activeRoadmap.milestones,
        milestoneId,
        !currentStatus
      );
      // Make sure the background cache is consistent (doesn't trigger a full UI suspension)
      refetch();
    } catch (err) {
      toast.error('Failed to update milestone status.');
      refetch(); // Rollback local state
      if (roadmaps.length > 0) setActiveRoadmap(roadmaps[0]);
    }
  };

  if (loading && roadmaps.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapIcon className="w-8 h-8 text-primary" />
            Career Roadmap
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your long-term goals and semester milestones.
          </p>
        </div>
        {roadmaps.length === 0 && (
          <Button onClick={handleCreateTemplate} className="gap-2 shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4" />
            Use Software Engineering Template
          </Button>
        )}
      </div>

      {roadmaps.length === 0 && !loading ? (
        <Card className="border-dashed border-2 py-12 bg-muted/30">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">No Roadmap Found</h2>
            <p className="text-muted-foreground max-w-sm">
              Set a long-term goal to break it down into achievable semester milestones.
            </p>
            <Button onClick={handleCreateTemplate} variant="outline" className="mt-4">
              <Briefcase className="w-4 h-4 mr-2" />
              Software Engineering Placement
            </Button>
          </div>
        </Card>
      ) : activeRoadmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Overview Sidebar */}
          <Card className="lg:col-span-1 shadow-md bg-card border-primary/10 flex flex-col items-center p-6 space-y-6">
            <div className="text-center w-full">
              <h2 className="text-xl font-bold line-clamp-2">{activeRoadmap.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">{activeRoadmap.description}</p>
            </div>
            
            <CircleProgress progress={activeRoadmap.progress} />
            
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Completed</span>
                <span className="font-medium text-foreground">
                  {activeRoadmap.milestones.filter(m => m.isCompleted).length} / {activeRoadmap.milestones.length}
                </span>
              </div>
              <Progress value={activeRoadmap.progress} className="h-2" />
            </div>
          </Card>

          {/* Timeline UI */}
          <Card className="lg:col-span-3 shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-xl">Semester Milestones</CardTitle>
              <CardDescription>Click on a milestone to mark it as completed.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative p-6">
                {/* Vertical Line Timeline */}
                <div className="absolute left-[39px] md:left-[55px] top-6 bottom-6 w-0.5 bg-border/60"></div>
                
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                    const milestonesForSem = activeRoadmap.milestones.filter(m => m.semester === sem);
                    if (milestonesForSem.length === 0) return null;

                    return (
                      <div key={sem} className="relative flex items-start group gap-4 md:gap-6">
                        {/* Semester Node */}
                        <div className="z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-background border-2 border-primary rounded-full shadow-sm shadow-primary/20">
                          <span className="text-xs md:text-sm font-bold text-primary">S{sem}</span>
                        </div>
                        
                        {/* Milestones Content */}
                        <div className="flex-1 space-y-4 pt-1 md:pt-2">
                          {milestonesForSem.map((milestone) => (
                            <div 
                              key={milestone.id}
                              onClick={() => handleToggleMilestone(milestone.id, milestone.isCompleted)}
                              className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                                milestone.isCompleted 
                                  ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                                  : 'bg-card hover:border-primary/30'
                              }`}
                            >
                              <button className="flex-shrink-0 mt-0.5" aria-label="Toggle Complete">
                                {milestone.isCompleted ? (
                                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary transition-transform scale-100" />
                                ) : (
                                  <Circle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </button>
                              
                              <div className="flex-1">
                                <h4 className={`text-base font-semibold ${milestone.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {milestone.title}
                                </h4>
                                {milestone.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {milestone.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
