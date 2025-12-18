import * as React from "react";
import { FileText, Home, PlusCircle, Settings, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = useSelector(
    (state: { auth: { userData: any } }) => state.auth.userData
  );

  // ZenJournal specific navigation data
  const data = {
    user: {
      name: userData?.name || userData?.email?.split("@")[0] || "User",
      email: userData?.email || "user@zenjournal.com",
      avatar: userData?.avatar || "/avatars/user.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
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
          // Removed Drafts and Archive links: feature not implemented
        ],
      },
      {
        title: "Mood Tracking",
        url: "/mood",
        icon: TrendingUp,
        items: [
          {
            title: "Mood Calendar",
            url: "/dashboard/mood",
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
    ],
  };

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
                {/* <Heart className="size-4" /> */}
                <img
                  src="/logo (2).png"
                  alt=""
                  className="h-11 w-11 invert brightness-0"
                />
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
        {/* <NavProjects projects={data.quickActions} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
