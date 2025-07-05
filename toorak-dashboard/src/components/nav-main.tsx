import React from "react"
import { type Icon } from "@tabler/icons-react"

// import { Button } from "@/components/ui/button" 
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onNavigate,
  }: {
  items: {
    title: string
    url: string
    icon?: Icon
    isActive?: boolean
  }[]
  onNavigate?: (url: string) => void
}) {
  const handleItemClick = (item: { title: string; url: string; icon?: Icon; isActive?: boolean }) => {
    if (onNavigate && item.url) {
      onNavigate(item.url);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
           
            {/* <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button> */}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                onClick={() => handleItemClick(item)}
                className={item.isActive ? 'bg-accent text-accent-foreground' : ''}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
