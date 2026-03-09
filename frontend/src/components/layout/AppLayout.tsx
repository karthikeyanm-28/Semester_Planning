import { Outlet, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  const { isAuthenticated } = useUser();
  const location = useLocation();

  // Don't show layout for landing page
  if (!isAuthenticated || location.pathname === '/landing') {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm flex items-center px-6 sticky top-0 z-40">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
            {/* You can add header actions here in the future */}
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
