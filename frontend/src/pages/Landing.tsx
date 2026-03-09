import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, BarChart3, Calendar, Target, AlertTriangle, PieChart, CheckCircle2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { signInWithGoogle, isAuthenticated, isLoading } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && !isLoading) {
    navigate('/');
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      console.log("User initiated Google Sign-In");
      await signInWithGoogle();
      // Redirect to home - routing will handle actual redirect
      navigate('/');
    } catch (err: any) {
      const errorCode = err?.code;
      const errorMsg = err?.message;
      
      let displayError = 'Failed to sign in. Please try again.';
      
      if (errorCode === 'auth/popup-blocked') {
        displayError = 'Sign-in popup was blocked. Please allow popups for this site and try again.';
      } else if (errorCode === 'auth/user-cancelled') {
        displayError = 'Sign-in was cancelled.';
      } else if (errorCode === 'auth/popup-closed-by-user') {
        displayError = 'Sign-in popup was closed. Please try again.';
      } else if (errorCode === 'auth/cancelled-popup-request') {
        displayError = 'Sign-in was cancelled. Please try again.';
      } else if (errorMsg?.includes('Firebase Auth')) {
        displayError = 'Authentication service is not ready. Please refresh and try again.';
      }
      
      console.error(`Sign-in error [${errorCode}]:`, errorMsg);
      setError(displayError);
    } finally {
      setIsSigningIn(false);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Performance Tracking',
      description: 'Monitor your academic performance with real-time analytics',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Plan your weekly study schedule efficiently',
    },
    {
      icon: AlertTriangle,
      title: 'Smart Alerts',
      description: 'Get notified about deadlines and important events',
    },
    {
      icon: Target,
      title: 'Goal Management',
      description: 'Set and track your academic goals',
    },
    {
      icon: PieChart,
      title: 'Summary Dashboard',
      description: 'Get actionable insights about your semester',
    },
    {
      icon: BookOpen,
      title: 'Subject Management',
      description: 'Organize and manage all your courses in one place',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">AcadPlan</span>
          </div>
          <div className="text-sm text-muted-foreground">Semester Intelligence Platform</div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Master Your Semester with <span className="text-primary">AcadPlan</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                An intelligent academic planning platform designed to help you track progress, manage tasks, and achieve your goals with actionable insights.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              {[
                'Real-time performance analytics',
                'Intelligent task & deadline management',
                'Weekly study planning tools',
                'Goal tracking and progress monitoring',
                'Risk assessment and alerts',
                'Comprehensive semester summary',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Sign In Card */}
          <div>
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Join thousands of students planning smarter</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className="w-full h-11"
                        size="lg"
                        variant="outline"
                      >
                        {isSigningIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <svg
                              className="mr-2 h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                          </>
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">
                            or continue with
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className="w-full"
                        size="lg"
                      >
                        Create New Account
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-slate-950 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in your academic journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 AcadPlan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
