import {
  LayoutDashboard, Settings, BookOpen, ListTodo, Calendar,
  BarChart3, Target, StickyNote, AlertTriangle, PieChart,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

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
    </Sidebar>
  );
}
