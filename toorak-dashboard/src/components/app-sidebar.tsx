import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  // IconCamera,
  IconChartBar,
  IconDashboard,
  // IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconCurrencyDollar,
  // IconFolder,
  // IconHelp,
  // IconInnerShadowTop,
  IconListDetails,
  // IconReport,
  // IconSearch,
  // IconSettings,
  // IconUsers,
  IconCalculator,
  IconFileText,
} from "@tabler/icons-react"

// import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const data = {
    user: {
      name: "Manish",
      email: "manishindiyaar@gmail.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
        isActive: location.pathname === "/dashboard",
      },
      {
        title: "Loan Portfolio",
        url: "/loan-portfolio",
        icon: IconCurrencyDollar,
        isActive: location.pathname === "/loan-portfolio",
      },
      {
        title: "Add New Loan",
        url: "/add-loan",
        icon: IconListDetails,
        isActive: location.pathname === "/add-loan",
      },
      {
        title: "Interest Calculator",
        url: "/interest-calculator",
        icon: IconCalculator,
        isActive: location.pathname === "/interest-calculator",
      },
      {
        title: "AI Chat",
        url: "/ai-chat",
        icon: IconFileAi,
        isActive: location.pathname === "/ai-chat",
      }
    ],
    navClouds: [
      {
        title: "Loan Applications",
        icon: IconFileText,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Pending",
            url: "#",
          },
          {
            title: "Approved",
            url: "#",
          },
          {
            title: "Funded",
            url: "#",
          },
          {
            title: "Declined",
            url: "#",
          },
        ],
      },
      {
        title: "Documents",
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: "Loan Agreements",
            url: "#",
          },
          {
            title: "Property Docs",
            url: "#",
          },
          {
            title: "Financial Statements",
            url: "#",
          },
        ],
      },
      {
        title: "Analytics",
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: "Portfolio Analysis",
            url: "#",
          },
          {
            title: "Risk Assessment",
            url: "#",
          },
          {
            title: "Performance Metrics",
            url: "#",
          },
        ],
      },
    ],
    // navSecondary: [
    //   {
    //     title: "Settings",
    //     url: "#",
    //     icon: IconSettings,
    //   },
    //   {
    //     title: "Get Help",
    //     url: "#",
    //     icon: IconHelp,
    //   },
    //   {
    //     title: "Search",
    //     url: "#",
    //     icon: IconSearch,
    //   },
    // ],
    // documents: [
    //   {
    //     name: "Data Library",
    //     url: "#",
    //     icon: IconDatabase,
    //   },
    //   {
    //     name: "Reports",
    //     url: "#",
    //     icon: IconReport,
    //   },
    //   {
    //     name: "Word Assistant",
    //     url: "#",
    //     icon: IconFileWord,
    //   },
    // ],
  }

  const handleNavClick = (url: string) => {
    if (url.startsWith('/')) {
      navigate(url)
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconCurrencyDollar className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Toorak Capital</span>
                  <span className="truncate text-xs">Loan Management</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onNavigate={handleNavClick} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
