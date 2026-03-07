import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, BookOpen, ListTodo, Calendar,
  BarChart3, Target, StickyNote, AlertTriangle, PieChart,
  LogOut,
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
  { title: 'Semester Config', url: '/semester', icon: Settings },
  { title: 'Subjects', url: '/subjects', icon: BookOpen },
  { title: 'Tasks & Exams', url: '/tasks', icon: ListTodo },
  { title: 'Weekly Planner', url: '/planner', icon: Calendar },
  { title: 'Performance', url: '/performance', icon: BarChart3 },
  { title: 'Goals', url: '/goals', icon: Target },
  { title: 'Notes', url: '/notes', icon: StickyNote },
  { title: 'Alerts & Risks', url: '/alerts', icon: AlertTriangle },
  { title: 'Summary', url: '/summary', icon: PieChart },
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
    <Sidebar collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground leading-tight">AcadPlan</h2>
              <p className="text-[10px] text-sidebar-foreground/60">Semester Intelligence</p>
            </div>
          )}
        </div>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === '/'} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
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

      <SidebarSeparator />
      <SidebarFooter className="py-4">
        <div className="space-y-2">
          <div className="px-2 py-2">
            {!collapsed && (
              <div className="text-xs">
                <p className="font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-muted-foreground truncate">{user?.email || 'email@example.com'}</p>
              </div>
            )}
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <NavLink to="/settings" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {!collapsed && <span>Logout</span>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout? Your data will be saved and you can login again anytime.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700">
                  Logout
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
