import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, BookOpen, ListTodo, Calendar,
  BarChart3, Target, StickyNote, AlertTriangle, PieChart,
  LogOut, Plus, GraduationCap, Map,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useUser } from '@/context/UserContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar, SidebarFooter, SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Semester Setup', url: '/semester', icon: GraduationCap },
  { title: 'Subjects', url: '/subjects', icon: BookOpen },
  { title: 'Tasks', url: '/tasks', icon: ListTodo },
  { title: 'Planner', url: '/planner', icon: Calendar },
  { title: 'Analytics', url: '/performance', icon: BarChart3 },
  { title: 'Goals', url: '/goals', icon: Target },
  { title: 'Notes', url: '/notes', icon: StickyNote },
  { title: 'Alerts', url: '/alerts', icon: AlertTriangle },
  { title: 'Summary', url: '/summary', icon: PieChart },
  { title: 'Roadmap', url: '/roadmap', icon: Map },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/landing');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-gradient-to-b from-sidebar to-sidebar/95">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-sidebar-foreground leading-tight truncate">AcadPlan</h2>
              <p className="text-[11px] text-sidebar-foreground/70">Semester Intelligence</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Create Button */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border/50">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      )}

      {/* Main Navigation */}
      <SidebarContent className="flex-1">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider px-2">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className="hover:bg-sidebar-accent/60 transition-colors data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'} 
                      activeClassName="bg-primary/15 text-primary font-semibold"
                      className="hover:bg-sidebar-accent/40"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarSeparator className="bg-sidebar-border/50" />
      <SidebarFooter className="py-3 space-y-2">
        {/* User Profile Card */}
        {!collapsed && (
          <div className="px-3 py-3 rounded-lg bg-sidebar-accent/40 border border-sidebar-border/30">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-sidebar-foreground/60 truncate">{user?.email || 'email@example.com'}</p>
          </div>
        )}

        {/* Settings & Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Settings"
              className="hover:bg-sidebar-accent/60 transition-colors"
            >
              <NavLink 
                to="/settings" 
                activeClassName="bg-primary/15 text-primary"
                className="hover:bg-sidebar-accent/40"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <SidebarMenuButton 
              className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logout</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to logout?</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">Logout</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
