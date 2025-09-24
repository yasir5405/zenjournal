import * as React from "react"
import {
  Calendar,
  FileText,
  Heart,
  Home,
  PlusCircle,
  Settings,
  TrendingUp,
} from "lucide-react"
import { useSelector } from "react-redux"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = useSelector((state: { auth: { userData: any } }) => state.auth.userData)
  const { state } = useSidebar()

  // ZenJournal specific navigation data
  const data = {
    user: {
      name: userData?.name || userData?.email?.split('@')[0] || "User",
      email: userData?.email || "user@zenjournal.com",
      avatar: userData?.avatar || "/avatars/user.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Recent Entries",
            url: "/dashboard/recent",
          },
          {
            title: "Analytics",
            url: "/dashboard/analytics",
          },
        ],
      },
      {
        title: "Journal Entries",
        url: "/entries",
        icon: FileText,
        items: [
          {
            title: "All Entries",
            url: "/entries",
          },
          {
            title: "Create New",
            url: "/entries/new",
          },
          {
            title: "Drafts",
            url: "/entries/drafts",
          },
          {
            title: "Archive",
            url: "/entries/archive",
          },
        ],
      },
      {
        title: "Mood Tracking",
        url: "/mood",
        icon: TrendingUp,
        items: [
          {
            title: "Mood Calendar",
            url: "/mood/calendar",
          },
          {
            title: "Mood Trends",
            url: "/mood/trends",
          },
          {
            title: "Log Mood",
            url: "/mood/log",
          },
        ],
      },
      {
        title: "Goals & Progress",
        url: "/goals",
        icon: Calendar,
        items: [
          {
            title: "My Goals",
            url: "/goals",
          },
          {
            title: "Progress Tracking",
            url: "/goals/progress",
          },
          {
            title: "Achievements",
            url: "/goals/achievements",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: "Profile",
            url: "/settings/profile",
          },
          {
            title: "Privacy",
            url: "/settings/privacy",
          },
          {
            title: "Notifications",
            url: "/settings/notifications",
          },
          {
            title: "Export Data",
            url: "/settings/export",
          },
        ],
      },
    ],
    quickActions: [
      {
        name: "New Journal Entry",
        url: "/entries/new",
        icon: PlusCircle,
      },
      {
        name: "Log Mood",
        url: "/mood/log",
        icon: Heart,
      },
      {
        name: "View Progress",
        url: "/goals/progress",
        icon: TrendingUp,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">ZenJournal</span>
                <span className="truncate text-xs">Personal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.quickActions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
