"use client"

import { BookOpen, Building, ChevronLeft, ChevronRight, FileText, KeyRound, LayoutDashboard, Settings, Ticket, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"

const sidebarItems = [
    { title: "Dashboard", icon: Building, href: "/dashboard" }, // Changed icon to Building to match 'Business Info' concept or keep Dashboard
    { title: "Users", icon: Users, href: "/users" },
    { title: "Courses", icon: BookOpen, href: "/courses" },
    { title: "Mentors", icon: Users, href: "/mentors" },
    { title: "Deals", icon: Ticket, href: "/deals" },
    { title: "Home Config", icon: Settings, href: "/home-config" },
    { title: "About", icon: FileText, href: "/about" },
    { title: "Permissions", icon: KeyRound, href: "/permissions" },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const [isCollapsed, setIsCollapsed] = useState(false)

    if (isMobile) return null // Mobile handled separately in layout

    return (
        <div
            className={cn(
                "relative flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
        >
            <div className="flex h-16 items-center border-b px-4 justify-between">
                <div className={cn("flex items-center gap-2 font-semibold", isCollapsed && "hidden")}>
                    <Building className="h-6 w-6" />
                    <span>N-edu Admin</span>
                </div>
                {isCollapsed && <Building className="h-6 w-6 mx-auto" />}

                <Button variant="ghost" size="icon" className="h-6 w-6 absolute -right-3 top-6 rounded-full border bg-background text-foreground shadow-sm hover:bg-accent" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                                pathname.startsWith(item.href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}
