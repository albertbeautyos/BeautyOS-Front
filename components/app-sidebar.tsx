"use client"

import * as React from "react"
import Image from 'next/image'
import {
Users,
PanelLeftDashed,
} from "lucide-react"
import { type VariantProps } from "class-variance-authority"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Button,
  buttonVariants
} from "@/components/ui/button"
import beautyosLogo from '@/public/assets/beautyos.png'
import { PRIVATE_ROUTES } from "@/constants"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  teams: [
    {
      name: "BeatyOS",
      logo: beautyosLogo,
      plan: "Dashboard",
    },
     {
      name: "BeatyOS2",
      logo: beautyosLogo,
      plan: "Dashboard",
    },
     {
      name: "BeatyOS3",
      logo: beautyosLogo,
      plan: "Dashboard",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: PRIVATE_ROUTES.DASHBOARD,
      icon:   PanelLeftDashed,
      isActive: true,
    },
    {
      title: "Clients",
      url: PRIVATE_ROUTES.CLIENTS,
      icon:   Users,
      isActive: true,
    },
    {
      title: "Users",
      url: PRIVATE_ROUTES.USERS,
      icon:   Users,
      isActive: true,
    }
  ],
  // Empty projects list
  projects: []
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-between">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
