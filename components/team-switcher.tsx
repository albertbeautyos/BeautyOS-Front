"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import Image, { StaticImageData } from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Team {
  name: string;
  logo: StaticImageData | string;
  plan: string;
}

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(teams[0] ?? null)

  if (!activeTeam) {
    return null
  }

  const renderLogo = (team: Team) => {
    return (
      <Image
        src={team.logo}
        alt={`${team.name} logo`}
        width={80}
        height={60}
        className="rounded-sm"
      />
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >

                {renderLogo(activeTeam)}

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
          >
            <DropdownMenuLabel>Select a team</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onSelect={() => setActiveTeam(team)}
                className="cursor-pointer"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground mr-2 flex aspect-square size-6 items-center justify-center rounded-md">
                  {renderLogo(team)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{team.name}</span>
                  <span className="truncate text-xs">{team.plan}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Plus className="text-muted-foreground mr-2" />
              <span>Create team</span>
              <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
